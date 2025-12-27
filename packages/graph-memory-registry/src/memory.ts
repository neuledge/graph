import {
  type NeuledgeGraphMatch,
  NeuledgeGraphMatcher,
  type NeuledgeGraphRegistry,
  type NeuledgeGraphResolver,
  type NeuledgeGraphSuggestion,
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
      matcher: NeuledgeGraphMatcher<Template>;
      resolver: NeuledgeGraphResolver<Template, object>;
      embedding: Embedding;
    };
  };
  private registerQueue: {
    [Template in string]: {
      matcher: NeuledgeGraphMatcher<Template>;
      resolver: NeuledgeGraphResolver<Template, object>;
    };
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
    this.defaultTrashhold = options.defaultTrashhold ?? 0;
    this.defaultLimit = options.defaultLimit ?? 10;
  }

  async match(args: { path: string }): Promise<NeuledgeGraphMatch | null> {
    for (const { matcher } of Object.values(this.registry)) {
      const match = matcher.match(args);
      if (match) return match;
    }

    return null;
  }

  async resolve<Template extends string, Value extends object>(
    match: NeuledgeGraphMatch<Template>,
  ): Promise<Value> {
    const entry = this.registry[match.template];
    if (!entry) {
      throw new ReferenceError(`Unknown template: ${match.template}`);
    }

    return entry.resolver(match.params) as Promise<Value>;
  }

  async register<Template extends string, Value extends object>(args: {
    template: Template;
    resolver: NeuledgeGraphResolver<Template, Value>;
  }): Promise<void> {
    this.registerQueue[args.template] = {
      matcher: new NeuledgeGraphMatcher(args.template),
      resolver: args.resolver,
    };

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
        const entry = queue[template]!;

        this.registry[template] = {
          matcher: entry.matcher,
          resolver: entry.resolver,
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

    return Object.entries(this.registry)
      .map(
        ([template, entry]): NeuledgeGraphSuggestion => ({
          template,
          similarity: cosineSimilarity(entry.embedding, embedding),
        }),
      )
      .filter((s) => s.similarity >= trashhold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}
