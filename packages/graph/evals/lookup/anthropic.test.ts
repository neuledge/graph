import { anthropic } from "@ai-sdk/anthropic";
import { evalLookupQueries } from "./utils.js";

evalLookupQueries({
  model: anthropic("claude-sonnet-4-5"),
});

evalLookupQueries({
  model: anthropic("claude-sonnet-4-0"),
});

evalLookupQueries({
  model: anthropic("claude-haiku-4-5"),
});
