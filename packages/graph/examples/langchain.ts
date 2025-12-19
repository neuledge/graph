// Loads environment variables from the `.env` file.
// Make sure you have created it using the template available at `.env.example`.
import "dotenv/config";

// make sure to install all the following packages:
// $ npm install @neuledge/graph langchain @langchain/openai @langchain/core zod zod-to-json-schema

import { NeuledgeGraph } from "@neuledge/graph";
import { createAgent, tool } from "langchain";

// Create the tool from the graph lookup function
const graph = new NeuledgeGraph();

const lookup = tool(graph.lookup, graph.lookup);

// Create the agent with an OpenAI LLM
const agent = createAgent({
  model: "openai:gpt-4.1",
  tools: [lookup],
});

// Invoke the agent
const result = await agent.invoke({
  messages: [
    { role: "user", content: "What is the exchange rate from USD to EUR?" },
  ],
});
console.log(result);

// run this example from repo root:
// $ npx tsx examples/langchain.ts
