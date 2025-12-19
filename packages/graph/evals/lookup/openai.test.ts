import { openai } from "@ai-sdk/openai";
import { evalLookupQueries } from "./utils.js";

evalLookupQueries({
  model: openai("gpt-5.1"),
  providerOptions: { openai: { reasoningEffort: "low" } },
});

evalLookupQueries({
  model: openai("gpt-5-mini"),
  providerOptions: {
    openai: { reasoningEffort: "low", reasoningSummary: "auto" },
  },
});

evalLookupQueries({
  model: openai("gpt-5-nano"),
  providerOptions: {
    openai: { reasoningEffort: "low", reasoningSummary: "auto" },
  },
});

evalLookupQueries({
  model: openai("gpt-4o"),
});

evalLookupQueries({
  model: openai("gpt-4.1"),
});
