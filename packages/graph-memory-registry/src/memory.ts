import { promises as fs } from "node:fs";
import type { NeuledgeGraphMatch } from "@neuledge/graph";
import {
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
  private cacheFile?: string;
  private registry: {
    [Template in string]: {
      matcher: NeuledgeGraphMatcher<Template>;
      resolver: NeuledgeGraphResolver<Template, object>;
      embedding?: Embedding;
    };
  };
  private embeddingPromise?: Promise<void>;
  private defaultTrashhold: number;
  private defaultLimit: number;

  constructor(options: {
    model: EmbeddingModel;
    cacheFile?: string;
    defaultTrashhold?: number;
    defaultLimit?: number;
  }) {
    this.embeddingModel = options.model;
    this.cacheFile = options.cacheFile;
    this.registry = {};
    this.defaultTrashhold = options.defaultTrashhold ?? 0;
    this.defaultLimit = options.defaultLimit ?? 10;

    setTimeout(() => {
      void this.ensureReady().catch(() => {});
    }, 1);
  }

  private async loadCache(): Promise<void> {
    if (!this.cacheFile) return;

    const exists = await fs
      .access(this.cacheFile, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      return;
    }

    try {
      const data = await fs.readFile(this.cacheFile, "utf8");
      const cache: Record<string, Embedding> = JSON.parse(data);

      for (const [template, embedding] of Object.entries(cache)) {
        if (this.registry[template]) {
          this.registry[template].embedding = embedding;
        }
      }
    } catch (error) {
      throw new Error(`Failed to load cache file: ${error}`);
    }
  }

  private async saveCache(): Promise<void> {
    if (!this.cacheFile) return;

    const cache: Record<string, Embedding> = {};

    for (const [template, entry] of Object.entries(this.registry)) {
      if (entry.embedding) {
        cache[template] = entry.embedding;
      }
    }

    try {
      await fs.writeFile(this.cacheFile, JSON.stringify(cache), "utf8");
    } catch (error) {
      throw new Error(`Failed to save cache file: ${error}`);
    }
  }

  private async ensureEmbeddings(): Promise<void> {
    let missing = Object.keys(this.registry).filter(
      (template) => !this.registry[template]?.embedding,
    );
    if (!missing.length) return;

    await this.loadCache();
    let needsSaving = false;

    while (true) {
      missing = Object.keys(this.registry).filter(
        (template) => !this.registry[template]?.embedding,
      );
      if (!missing.length) break;

      const { embeddings } = await embedMany({
        model: this.embeddingModel,
        values: missing,
      });

      if (embeddings.length !== missing.length) {
        throw new Error(
          "Unexpected number of embedding vectors return from `embedMany`",
        );
      }

      for (let i = 0; i < missing.length; ++i) {
        // biome-ignore lint/style/noNonNullAssertion: already checked length
        this.registry[missing[i]!]!.embedding = embeddings[i];
      }
      needsSaving = true;
    }

    if (needsSaving) {
      await this.saveCache();
    }
  }

  private async ensureReady(): Promise<void> {
    if (!this.embeddingPromise) {
      this.embeddingPromise = this.ensureEmbeddings();
      void this.embeddingPromise
        .catch(() => {})
        .then(() => {
          this.embeddingPromise = undefined;
        });
    }

    await this.embeddingPromise;
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

  register<Template extends string, Value extends object>(args: {
    template: Template;
    resolver: NeuledgeGraphResolver<Template, Value>;
  }): void {
    this.registry[args.template] = {
      matcher: new NeuledgeGraphMatcher(args.template),
      resolver: args.resolver,
    };
  }

  async suggestions(args: {
    path: string;
    trashhold?: number;
    limit?: number;
  }): Promise<NeuledgeGraphSuggestion[]> {
    const [{ embedding }] = await Promise.all([
      embed({
        model: this.embeddingModel,
        value: args.path,
      }),
      this.ensureReady(),
    ]);

    const trashhold = args.trashhold ?? this.defaultTrashhold;
    const limit = args.limit ?? this.defaultLimit;

    return Object.entries(this.registry)
      .map(
        ([template, entry]): NeuledgeGraphSuggestion => ({
          template,
          // biome-ignore lint/style/noNonNullAssertion: ensured by `ensureReady`
          similarity: cosineSimilarity(entry.embedding!, embedding),
        }),
      )
      .filter((s) => s.similarity >= trashhold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}
