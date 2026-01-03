import type { NeuledgeGraphMatch } from "@neuledge/graph";
import type { EmbeddingModel } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NeuledgeGraphMemoryRegistry } from "./memory.js";

describe("NeuledgeGraphMemoryRegistry", () => {
  let registry: NeuledgeGraphMemoryRegistry;
  let mock_embedding_model: EmbeddingModel;

  beforeEach(() => {
    mock_embedding_model = {
      specificationVersion: "v3",
      provider: "test",
      modelId: "test-model",
      maxEmbeddingsPerCall: 10,
      supportsParallelCalls: true,
      doEmbed: vi
        .fn()
        .mockImplementation(async ({ values }: { values: string[] }) => ({
          embeddings: values.map((value) =>
            Array.from(
              { length: 8 },
              (_, i) => (i + 1) * 0.1 + value.length * 0.01,
            ),
          ),
          warnings: [],
        })),
    };

    registry = new NeuledgeGraphMemoryRegistry({
      model: mock_embedding_model,
      defaultTrashhold: 0.5,
      defaultLimit: 5,
    });
  });

  it("should register and match a template", async () => {
    const resolver = vi
      .fn()
      .mockResolvedValue({ temperature: 72, condition: "sunny" });

    await registry.register({
      template: "cities.{city}.weather",
      resolver,
    });

    const match = await registry.match({ path: "cities.london.weather" });

    expect(match).toBeDefined();
    expect(match?.template).toBe("cities.{city}.weather");
    expect(match?.params).toEqual({ city: "london" });
  });

  it("should resolve a matched template", async () => {
    const mock_data = { temperature: 72, humidity: 65 };
    const resolver = vi.fn().mockResolvedValue(mock_data);

    registry.register({
      template: "cities.{city}.weather",
      resolver,
    });

    const match = await registry.match({ path: "cities.tokyo.weather" });
    expect(match).toBeDefined();

    const result = await registry.resolve(
      match as NeuledgeGraphMatch<"cities.{city}.weather">,
    );

    expect(result).toEqual(mock_data);
    expect(resolver).toHaveBeenCalledWith({ city: "tokyo" });
  });

  it("should return null when no template matches", async () => {
    const match = await registry.match({ path: "unknown.path" });
    expect(match).toBeNull();
  });

  it("should throw error when resolving unknown template", async () => {
    await expect(
      registry.resolve({ template: "unknown.template", params: {} }),
    ).rejects.toThrow("Unknown template: unknown.template");
  });

  it("should return suggestions based on similarity", async () => {
    registry.register({
      template: "cities.{city}.weather",
      resolver: vi.fn(),
    });

    registry.register({
      template: "cities.{city}.population",
      resolver: vi.fn(),
    });

    const suggestions = await registry.suggestions({
      path: "cities.paris.temperature",
      trashhold: 0.3,
      limit: 2,
    });

    expect(suggestions).toBeInstanceOf(Array);
    expect(suggestions.length).toBeLessThanOrEqual(2);
    suggestions.forEach((s) => {
      expect(s).toHaveProperty("template");
      expect(s).toHaveProperty("similarity");
      expect(s.similarity).toBeGreaterThanOrEqual(0.3);
    });
  });
});
