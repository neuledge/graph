// Loads environment variables from the `.env` file.
// Make sure you have created it using the template available at `.env.example`.
import "dotenv/config";

import { anthropic } from "@ai-sdk/anthropic";
import { NeuledgeGraph } from "@neuledge/graph";
import { stepCountIs, ToolLoopAgent, tool } from "ai";

const graph = new NeuledgeGraph();

const agent = new ToolLoopAgent({
  model: anthropic("claude-sonnet-4-5"),
  tools: {
    lookup: tool(graph.lookup),
  },
  stopWhen: stepCountIs(20),
});

const { textStream } = await agent.stream({
  prompt: "Compare Apple and Microsoft stock prices",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
process.stdout.write("\n");

// run this example from repo root:
// $ npx tsx examples/ai-sdk.ts
