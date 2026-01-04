<div align="center">

# @neuledge/graph


**Live, verified data for your LLM with zero API overhead.**

[![npm version](https://img.shields.io/npm/v/@neuledge/graph.svg)](https://www.npmjs.com/package/@neuledge/graph)
[![License](https://img.shields.io/npm/l/@neuledge/graph.svg)](https://github.com/neuledge/graph/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[How it works](#-how-it-works) • [Examples](#-examples) • [Installation](#-installation) • [API Reference](#-api-reference)

</div>

---

## Overview

`@neuledge/graph` connects your AI to live, structured data sources so your models can answer with certainty. Stop hallucinations before they happen by grounding your LLM in real-time, verified data.

### Why @neuledge/graph?

Your AI agent gets asked: *"What's the weather in Tokyo?"*

**Your options:**
1. 🤷 **Let the LLM guess** → "Tokyo is typically mild this time of year..." (Wrong)
2. 🐌 **Web search tool** → 3-5 seconds, parse HTML, unstructured results
3. 🔧 **Build custom integration** → Sign up for API, handle auth, write parsers
4. ⚡ **Use @neuledge/graph** → `lookup({ query: "cities.tokyo.weather" })` → Done in <100ms

**One tool. Live data. Zero setup.**

- ✅ **Instant** - Pre-fetched & cached data returns in <100ms
- ✅ **Structured** - Clean JSON your LLM can reason about
- ✅ **Trusted** - Real sources, not scraped web pages
- ✅ **Universal** - Same tool for weather, stocks, FX, and more

<br>

## ⚡ How it works

```typescript
// 1. Create a knowledge graph instance
const graph = new NeuledgeGraph();

// 2. Pass the lookup tool to your AI agent
const agent = new Agent({
  model: 'claude-sonnet-4-5',
  tools: { lookup: tool(graph.lookup) },
});

// 3. Ask questions - the agent will fetch live data automatically
const { text } = await agent.generate({
  prompt: 'What is the weather in San Francisco?',
});

// => "San Francisco is sunny, about 68°F."
```

👉 See full working examples with [Vercel AI SDK](#with-vercel-ai-sdk), [OpenAI Agents SDK](#with-openai-agents-sdk), and [LangChain](#with-langchain).

<br>

## 🚀 Use Cases

| Prompt                                       | Example Output                                   |
| -------------------------------------------- | ------------------------------------------------ |
| `What is the weather in San Francisco?`      | `San Francisco is sunny, about 68°F.`            |
| `What time is it in Tokyo?`                  | `It's 3:42 PM JST.`                              |
| `When is the next Monday?`                   | `The next Monday is on February 10, 2025.`       |
| `When is Thanksgiving next year?`            | `Thanksgiving in 2026 falls on November 26.`     |
| `How much is $250 in euros?`                 | `$250 equals €215.`                              |
| `Price of Apple stock?`                      | `Apple (AAPL) is trading at $175.20`             |
| `Latest headlines about AI`                  | *Coming soon…*                                   |
| `Who won the Lakers game last night?`        | *Coming soon…*                                   |
| `What's the current Bitcoin price?`          | *Coming soon…*                                   |

<br>

## 🥇 Key Features

- **Answers in <100ms** – Pre-cached data means your AI responds instantly, not after slow web searches
- **One tool, unlimited sources** – Weather, stocks, currency, and more through a single `lookup()` call
- **LLM-optimized responses** – Structured JSON designed for reasoning, not messy HTML to parse
- **Works everywhere** – Drop into Vercel AI SDK, OpenAI Agents, LangChain, or any framework
- **Zero configuration** – No API keys to juggle, no rate limits to manage, no parsers to write
- **Type-safe & predictable** – Full TypeScript support with discriminated unions for response types
- **Bring your own data** – Connect your databases and APIs for instant, grounded responses *(coming soon)*

<br>

## 💿 Installation

```bash
pnpm add @neuledge/graph zod
```

```bash
npm install @neuledge/graph zod
```

```bash
yarn add @neuledge/graph zod
```

<br>

## 📚 Examples

### With Vercel AI SDK

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { NeuledgeGraph } from "@neuledge/graph";
import { Experimental_Agent as Agent, stepCountIs, tool } from "ai";

const graph = new NeuledgeGraph();

const agent = new Agent({
  model: anthropic("claude-sonnet-4-5"),
  tools: {
    lookup: tool(graph.lookup),
  },
  stopWhen: stepCountIs(20),
});

const { textStream } = agent.stream({
  prompt: "Compare Apple and Microsoft stock prices",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
process.stdout.write("\n");
```

### With OpenAI Agents SDK

```typescript
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
```

### With LangChain

```typescript
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
```

<br>

## 🔐 Authentication & Rate Limits

By default, `@neuledge/graph` is free to use without authentication.  
To increase your request limit, generate a **free API key**.

| Access Type  | Requests Limit    | Per-Minute Limit |
|--------------|-------------------|------------------|
| Anonymous    | 100 / day         | 5 requests/min   |
| Free API Key | 10,000 / month    | 60 requests/min  |
| Pro Plan     | *Coming soon*     | *Coming soon*    |

### Getting a Free API Key

Run the following command:

```bash
npx @neuledge/graph sign-up your-email@example.com
```

You'll receive an API key via email:

```bash
NEULEDGE_API_KEY='sk_xxxxxxxxx'
```

### Using Your API Key

Pass the key when initializing the graph:

```typescript
import "dotenv/config";
import { NeuledgeGraph } from '@neuledge/graph';

const graph = new NeuledgeGraph({
  apiKey: process.env.NEULEDGE_API_KEY
});
```

**Best Practice:** Store your API key in environment variables and never commit it to version control.

### Building a Custom Server

For advanced use cases, you can build your own knowledge graph server using the router and registry packages:

```typescript
// Install: npm install @neuledge/graph-router @neuledge/graph-memory-registry fastify
import { NeuledgeGraphRouter } from "@neuledge/graph-router";
import { NeuledgeGraphMemoryRegistry } from "@neuledge/graph-memory-registry";
import { openai } from "ai";
import Fastify from "fastify";

// Create registry with embedding model
const registry = new NeuledgeGraphMemoryRegistry({
  model: openai.embedding("text-embedding-3-small"),
});

// Register your data sources
await registry.register({
  template: "cities.{city}.weather",
  resolver: async (match) => {
    const city = match.params.city;
    const response = await fetch(`https://api.weather.com/current?city=${city}`);
    return response.json();
  },
});

// Create router
const router = new NeuledgeGraphRouter({ registry });

// Set up HTTP server
const app = Fastify();

app.post("/lookup", async (request, reply) => {
  const result = await router.lookup(request.body);
  return reply.send(result);
});

app.listen({ port: 3000 });
```

See [graph-router](https://github.com/neuledge/graph/tree/main/packages/graph-router) and [graph-memory-registry](https://github.com/neuledge/graph/tree/main/packages/graph-memory-registry) packages for detailed documentation.

### Connecting to a Custom Server

Once you have a custom server running, connect to it using the `baseUrl` option:

```typescript
import { NeuledgeGraph } from "@neuledge/graph";

// Connect to your custom server
const graph = new NeuledgeGraph({
  baseUrl: "http://localhost:3000",
});

// Use it the same way as with the default server
const result = await graph.lookup({ query: "cities.tokyo.weather" });
console.log(result); // => { status: "matched", match: {...}, value: {...} }
```

You can now use this graph instance with any AI framework, and it will query your custom knowledge graph server instead of the default Neuledge service.

<br>

## 🛠 API Reference

### `NeuledgeGraph`

The main class for interacting with the knowledge graph.

#### Constructor Options

```typescript
interface NeuledgeGraphOptions {
  apiKey?: string;        // Your API key (optional for free tier)
  baseUrl?: string;       // Custom API endpoint (optional)
  timeout?: number;       // Request timeout in ms (default: 10000)
}
```

#### Example

```typescript
const graph = new NeuledgeGraph({
  apiKey: process.env.NEULEDGE_API_KEY,
  timeout: 5000,
});
```

### `graph.lookup` Tool

The `lookup` tool is designed to be a **first-class tool** in any AI framework that supports function calling.

#### Properties

- **`lookup`** (`function`) – The function that fetches live data
- **`lookup.name`** (`string`) - The name of the tool (`"lookup"`)
- **`lookup.description`** (`string`) – Instructions for the LLM on how to use the tool
- **`lookup.parameters`** (`object`) – JSON Schema defining expected inputs
- **`lookup.execute`** (`function`) – same as calling `lookup` directly


<br>

## 🎯 Supported Data Sources

Currently available:
- ☀️ **Weather** - Current weather and forecasts for any location
- 💱 **Currency Exchange** - Live FX rates for 150+ currencies
- 📈 **Stock Market** - Current stock prices and market data

Coming soon:
- 📰 News & headlines
- ⚽ Sports scores & schedules
- 🪙 Cryptocurrency prices
- 🗺️ Geographic data
- 📊 Economic indicators

Want to request a data source? [Open an issue](https://github.com/neuledge/graph/issues/new)!

<br>

## Development Setup

```bash
# Clone the repository
git clone https://github.com/neuledge/graph.git
cd graph

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

<br>

## 📄 License

Apache-2.0 © Neuledge

See [LICENSE](LICENSE) for more information.

<br>

---

<div align="center">

**Built with ❤️ by Neuledge**

</div>
