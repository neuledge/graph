// Loads environment variables from the `.env` file.
// Make sure you have created it using the template available at `.env.example`.
import "dotenv/config";

import { NeuledgeGraph } from "@neuledge/graph";
import { Agent, run, tool } from "@openai/agents";

const graph = new NeuledgeGraph();

const agent = new Agent({
  name: "Data Assistant",
  model: "gpt-4.1",
  tools: [tool(graph.lookup)],
});

const result = await run(agent, "What is the current price of Apple stock?");
console.log(result);

// run this example from repo root:
// $ npx tsx examples/openai-agents.ts
