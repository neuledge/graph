<div align="center">

# @neuledge/graph-memory-registry

**In-memory embedding registry for [@neuledge/graph-router](https://github.com/neuledge/graph/tree/main/packages/graph-router)**

[![npm version](https://img.shields.io/npm/v/@neuledge/graph-memory-registry.svg)](https://www.npmjs.com/package/@neuledge/graph-memory-registry)
[![License](https://img.shields.io/npm/l/@neuledge/graph-memory-registry.svg)](https://github.com/neuledge/graph/blob/main/LICENSE)

</div>

---

## Overview

`@neuledge/graph-memory-registry` provides an in-memory registry implementation that uses semantic similarity matching through embeddings. It's designed to work with `@neuledge/graph-router` to enable intelligent routing of queries to the appropriate data sources.

This package is part of the `@neuledge/graph` ecosystem. For general use with LLMs and AI agents, see the [main package](https://github.com/neuledge/graph).

## 💻 Installation

```bash
pnpm add @neuledge/graph-memory-registry
```

```bash
npm install @neuledge/graph-memory-registry
```

```bash
yarn add @neuledge/graph-memory-registry
```

## 📖 Usage

Register data sources with embeddings and let the registry intelligently route queries:

```typescript
import { NeuledgeGraphMemoryRegistry } from "@neuledge/graph-memory-registry";
import { openai } from "@ai-sdk/openai";

const registry = new NeuledgeGraphMemoryRegistry({
  model: openai.embedding("text-embedding-3-small"),

  // (optional) useful for persistence across restarts and serverless cold starts
  // commit this file to your repo or store in a shared volume
  cacheFile: "./embedding-cache.json", 
});

// Register a data source
registry.register({
  template: "weather.{city}",
  resolver: async ({ city }) => {
    // fetch weather for the matched city
    return { temperature: "72°F", condition: "Sunny" };
  },
});

// Match queries using semantic similarity
const match = await registry.match({ path: "weather.tokyo" });
```

## 🔧 API

- **`NeuledgeGraphMemoryRegistry`** - In-memory registry with embedding-based matching
  - `register()` - Register a data source with matcher and resolver
  - `match()` - Find matching data source for a query path
  - `resolve()` - Resolve a matched query to a concrete value
  - `suggestions()` - Get suggestions for alternative matches

For detailed API documentation, see the [@neuledge/graph-router](https://github.com/neuledge/graph/tree/main/packages/graph-router) and [main package](https://github.com/neuledge/graph).

## 📄 License

Apache-2.0 © Neuledge

See [LICENSE](LICENSE) for more information.
