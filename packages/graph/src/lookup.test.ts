import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./api-fetch.js";
import { NeuledgeError } from "./error.js";
import type { NeuledgeGraph } from "./index.js";
import {
  bindLookup,
  type NeuledgeGraphLookupMatchedResponse,
} from "./lookup.js";

vi.mock("./api-fetch.js", () => ({
  apiFetch: vi.fn(),
}));

describe("bindLookup", () => {
  const graph = {} as NeuledgeGraph;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call apiFetch with correct arguments", async () => {
    const mockResponse: NeuledgeGraphLookupMatchedResponse = {
      status: "matched",
      match: { template: "cities.{city}.weather" },
      value: "mocked",
    };
    vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

    const params = { query: "cities.london.weather" };
    const lookup = bindLookup(graph);
    const result = await lookup.call(graph, params);

    expect(apiFetch).toHaveBeenCalledWith(graph, {
      url: "/lookup",
      method: "POST",
      body: params,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should return error object if apiFetch throws", async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error("network failed"));

    const lookup = bindLookup(graph);
    const result = await lookup.call(graph, {
      query: "cities.tokyo.weather",
      context: {},
    });

    expect(result).toEqual({
      status: "error",
      error: expect.any(NeuledgeError),
    });
  });
});
