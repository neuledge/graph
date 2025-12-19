import { NeuledgeError } from "./error.js";
import type { NeuledgeGraph } from "./index.js";

export interface ApiFetchParams {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  body?: object;
}

export interface ApiFetchErrorResponse {
  error: {
    message: string;
  };
}

export async function apiFetch<T>(
  graph: NeuledgeGraph,
  params: ApiFetchParams,
): Promise<T> {
  const url = `${graph.baseUrl}${params.url}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (graph.apiKey) headers.Authorization = `Bearer ${graph.apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: params.body ? JSON.stringify(params.body) : undefined,
  });

  if (!res.ok) {
    return res
      .json()
      .then((data) => {
        const typed = data as Partial<ApiFetchErrorResponse>;
        if (typeof typed?.error?.message !== "string") {
          throw new Error(`Unknown error response`);
        }

        throw new NeuledgeError(typed.error.message);
      })
      .catch(() => {
        throw new NeuledgeError(
          `NeuledgeGraph: Request failed with ${res.statusText}`,
        );
      });
  }

  const data = await res.json();
  return data as T;
}
