import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./api-fetch.js";
import { NeuledgeError } from "./error.js";
import type { NeuledgeGraph } from "./index.js";
import { type GraphLookupMatchedResponse, lookup } from "./lookup.js";

vi.mock("./api-fetch.js", () => ({
  apiFetch: vi.fn(),
}));

describe("lookup", () => {
  const graph = {} as NeuledgeGraph;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call apiFetch with correct arguments", async () => {
    const mockResponse: GraphLookupMatchedResponse = {
      status: "matched",
      value: "mocked",
    };
    vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

    const params = { query: "cities.london.weather", context: {} };
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

    const result = await lookup.call(graph, {
      query: "cities.tokyo.weather",
      context: {},
    });

    expect(result).toEqual({
      error: expect.any(NeuledgeError),
    });
  });
});
