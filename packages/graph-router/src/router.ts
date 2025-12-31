import {
  type NeuledgeApiErrorResponse,
  NeuledgeError,
  type NeuledgeGraphLookupParams,
  type NeuledgeGraphLookupResponse,
} from "@neuledge/graph";
import type { NeuledgeGraphRegistry } from "./registry.js";
import { normalizePath } from "./utils.js";

export class NeuledgeGraphRouter {
  readonly registry: NeuledgeGraphRegistry;

  constructor(options: {
    registry: NeuledgeGraphRegistry;
  }) {
    this.registry = options.registry;
  }

  async lookup(
    params: NeuledgeGraphLookupParams,
  ): Promise<NeuledgeGraphLookupResponse> {
    const path = normalizePath(params.query);
    const match = await this.registry.match({ path });

    if (match) {
      try {
        const value = await this.registry.resolve(match);
        return {
          status: "matched",
          match,
          value,
        };
      } catch (error) {
        if (!(error instanceof NeuledgeError)) {
          throw error;
        }

        const suggestions = await this.registry.suggestions({
          path: match.template,
        });

        return {
          status: "ambiguous",
          reasonCode: "INVALID_IDENTIFIER",
          reasonHint: error.message,
          suggestions: suggestions.map((r) => ({
            template: r.template,
          })),
        };
      }
    }

    const suggestions = await this.registry.suggestions({
      path,
    });

    return {
      status: "ambiguous",
      reasonCode: "UNKNOWN_PATH",
      reasonHint: "Try using one of the suggested templates",
      suggestions: suggestions.map((r) => ({
        template: r.template,
      })),
    };
  }

  formatError(error: unknown): NeuledgeApiErrorResponse {
    return {
      error: {
        message: String((error as Error)?.message || error),
      },
    };
  }
}
