import * as z from "zod";
import { apiFetch } from "./api-fetch.js";
import { NeuledgeError } from "./error.js";
import type { NeuledgeGraph } from "./index.js";

export interface GraphLookup {
  (
    this: NeuledgeGraph,
    params: GraphLookupParams,
  ): Promise<GraphLookupResponse | GraphLookupErrorResponse>;

  name: string;
  description: string;
  parameters: typeof parameters;
  schema: typeof parameters;
  inputSchema: typeof parameters;
  execute: GraphLookup;
}

const description = `This tool provides access to **live, structured data** across a wide range of domains.

It ensures answers are **accurate and up-to-date**, preventing the model from relying on outdated information or hallucinating (e.g., old stock prices, past weather, or obsolete events).

Queries should use **\`snake_case\`** with dots between segments (\`lowercase.with_underscores\`).

The system tries to match your query to a **built-in template** and fill the \`{placeholders}\`.  

* If a close template exists, you receive the structured data.
* If no exact match, the system returns **suggested templates** you can refine your query against.

**This tool supports many domains including (but not limited to):**
- Weather, time, and location data
- Financial data (stocks, currencies, markets)
- Calendar operations and holidays
- And many other live data sources

**The most popular templates used:**  
* \`cities.{city}.weather\`
* \`cities.{city}.time\`
* \`stocks.{stock}.quote\`
* \`currencies.{from}.rate.{to}\`
* \`calendar.next.{weekday}\`
* \`calendar.in.{integer}.{unit}\`
* \`holidays.{holiday}.next\`

**Key principle:** Even if your query doesn't exactly match a template, the tool will **suggest the closest available templates**, allowing you to refine and retrieve the live data. When in doubt, try a query - the tool will guide you to the right template.`;

export type GraphLookupParams = z.infer<typeof parameters>;
const parameters = z.object({
  query: z
    .string()
    .describe(
      `A search query using snake_case and dots between segments (lowercase.with_underscores).`,
    ),

  context: z
    .object({
      units: z
        .enum(["auto", "metric", "imperial"])
        .default("auto")
        .describe(
          "Measurement system for applicable data (temperature, distance, etc.). 'auto' uses location-appropriate defaults.",
        )
        .optional(),

      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .describe(
          "Reference date for time-sensitive queries. Defaults to current date if not specified.",
        )
        .optional(),

      amount: z
        .number()
        .positive()
        .describe(
          "Quantity for conversion queries (e.g., currency amounts). Defaults to 1 if not specified.",
        )
        .optional(),

      timezone: z
        .string()
        .regex(
          /^([A-Z]{2,5}|[A-Za-z]+\/[A-Za-z_]+)$/,
          "Must be a valid timezone (e.g., 'EST', 'America/New_York')",
        )
        .describe(
          "TTimezone for date/time queries (e.g., 'America/New_York', 'EST')",
        )
        .optional(),

      locale: z
        .string()
        .regex(
          /^[a-z]{2}(-[A-Z]{2})?$/,
          "Must be language code or language-country (e.g., 'en', 'en-US')",
        )
        .describe(
          "Locale for formatting numbers, dates, and currency. Affects output presentation.",
        )
        .optional(),
    })
    .describe(
      "Optional parameters that modify how data is retrieved or formatted.",
    )
    .optional(),
});

export type GraphLookupResponse =
  | GraphLookupMatchedResponse
  | GraphLookupAmbiguousResponse;

export interface GraphLookupMatchedResponse<T = unknown> {
  status: "matched";
  value: T;
}

export interface GraphLookupAmbiguousResponse {
  status: "ambiguous";
  reasonCode: "UNKNOWN_PATH" | "INVALID_IDENTIFIER" | (string & {});
  reasonHint: string;
  suggestions: GraphLookupResponseTemplate[];
}

export interface GraphLookupResponseTemplate {
  template: string;
}

export interface GraphLookupErrorResponse {
  status: "error";
  error: NeuledgeError;
}

export const lookup: GraphLookup = Object.assign(
  async function lookup(this: NeuledgeGraph, params: GraphLookupParams) {
    return await apiFetch<GraphLookupResponse>(this, {
      url: "/lookup",
      method: "POST",
      body: {
        query: params.query,
        context: params.context,
      } satisfies GraphLookupParams,
    }).catch(
      (error): GraphLookupErrorResponse => ({
        status: "error",
        error: NeuledgeError.from(error),
      }),
    );
  },
  {
    description,
    parameters: parameters,
    schema: parameters,
    inputSchema: parameters,
    execute: null as never,
  },
);

// force `name` property to be enumerable (fix LangChain bug)
Object.defineProperty(lookup, "name", { value: "lookup", enumerable: true });

// self assign `execute`
lookup.execute = lookup;
