import type {
  NeuledgeGraphMatch,
  NeuledgeGraphRegistry,
  NeuledgeGraphResolver,
  NeuledgeGraphSuggestion,
} from "@neuledge/graph-router";
import {
  cosineSimilarity,
  type Embedding,
  type EmbeddingModel,
  embed,
  embedMany,
} from "ai";

export class NeuledgeGraphMemoryRegistry implements NeuledgeGraphRegistry {
  private embeddingModel: EmbeddingModel;
  private registry: {
    [Template in string]: {
      resolver: NeuledgeGraphResolver<Template>;
      embedding: Embedding;
    };
  };
  private registerQueue: {
    [Template in string]: NeuledgeGraphResolver<Template>;
  };
  private registerPromise?: Promise<void>;
  private defaultTrashhold: number;
  private defaultLimit: number;

  constructor(options: {
    model: EmbeddingModel;
    defaultTrashhold?: number;
    defaultLimit?: number;
  }) {
    this.embeddingModel = options.model;
    this.registry = {};
    this.registerQueue = {};
    this.defaultTrashhold = options.defaultTrashhold ?? 0.2;
    this.defaultLimit = options.defaultLimit ?? 10;
  }

  async match(args: { path: string }): Promise<NeuledgeGraphMatch | null> {
    for (const { resolver } of Object.values(this.registry)) {
      const match = resolver.match(args);
      if (match) return match;
    }

    return null;
  }

  async register<Template extends string>(
    resolver: NeuledgeGraphResolver<Template>,
  ): Promise<void> {
    this.registerQueue[resolver.template] = resolver;

    if (!this.registerPromise) {
      this.registerPromise = this.registerAsync();

      this.registerPromise
        .catch(() => {})
        .then(() => {
          this.registerPromise = undefined;
        });
    }

    return this.registerPromise;
  }

  private registerAsync = async (): Promise<void> => {
    let queue = this.registerQueue;
    this.registerQueue = {};

    let templates = Object.keys(queue);

    do {
      const { embeddings } = await embedMany({
        model: this.embeddingModel,
        values: templates,
      });

      if (embeddings.length !== templates.length) {
        throw new Error(
          "Unexpected number of embedding vectors return from `embedMany`",
        );
      }

      for (let i = 0; i < templates.length; ++i) {
        // biome-ignore lint/style/noNonNullAssertion: loop
        const template = templates[i]!;

        // biome-ignore lint/style/noNonNullAssertion: already verified
        const embedding = embeddings[i]!;

        // biome-ignore lint/style/noNonNullAssertion: already verified
        const resolver = queue[template]!;

        this.registry[template] = {
          resolver,
          embedding,
        };
      }

      queue = this.registerQueue;
      this.registerQueue = {};

      templates = Object.keys(queue);
    } while (templates.length);
  };

  async suggestions(args: {
    path: string;
    trashhold?: number;
    limit?: number;
  }): Promise<NeuledgeGraphSuggestion[]> {
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: args.path,
    });

    const trashhold = args.trashhold ?? this.defaultTrashhold;
    const limit = args.limit ?? this.defaultLimit;

    return Object.values(this.registry)
      .map(
        (r): NeuledgeGraphSuggestion => ({
          resolver: r.resolver,
          similarity: cosineSimilarity(r.embedding, embedding),
        }),
      )
      .filter((s) => s.similarity >= trashhold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}
