<div align="center">

# @neuledge/graph-router

**Router implementation for [@neuledge/graph](https://github.com/neuledge/graph)**

[![npm version](https://img.shields.io/npm/v/@neuledge/graph-router.svg)](https://www.npmjs.com/package/@neuledge/graph-router)
[![License](https://img.shields.io/npm/l/@neuledge/graph-router.svg)](https://github.com/neuledge/graph/blob/main/LICENSE)

</div>

---

## Overview

`@neuledge/graph-router` is a supporting package for `@neuledge/graph` that provides routing capabilities. It enables matching queries against a registry of data sources and resolving them to concrete values.

This is an internal utility package used to implement the core lookup functionality in `@neuledge/graph`. For general use with LLMs and AI agents, see the [main package](https://github.com/neuledge/graph/tree/main/packages/graph).

### Related Packages

- **[@neuledge/graph-memory-registry](https://github.com/neuledge/graph/tree/main/packages/graph-memory-registry)** - In-memory embedding-based registry implementation

## 💻 Installation

```bash
pnpm add @neuledge/graph-router
```

```bash
npm install @neuledge/graph-router
```

```bash
yarn add @neuledge/graph-router
```

## 📖 Usage

The router handles pattern matching and resolution of queries:

```typescript
import { NeuledgeGraphRouter } from "@neuledge/graph-router";
import { NeuledgeGraphMemoryRegistry } from "@neuledge/graph-memory-registry";
import Fastify from "fastify";

// See examples in @neuledge/graph-memory-registry for registering data sources
const registry = new NeuledgeGraphMemoryRegistry({
  // ...registry config
});

const router = new NeuledgeGraphRouter({
  registry,
});


const app = Fastify();

app.post("/lookup", async (request, reply) => {
  try {
    const result = await router.lookup(request.body);
    return reply.send(result);
  } catch (error) {
    return reply.status(500).send(router.formatError(error));
  }
});

app.listen({ port: 3000 });

```

## 🔧 API

- **`NeuledgeGraphRouter`** - Main router class that handles query matching and resolution
- **`NeuledgeGraphMatcher`** - Pattern matching utilities for query routing
- **`NeuledgeGraphRegistry`** - Registry interface for data source management

For detailed API documentation, see the [main package](https://github.com/neuledge/graph).

## 📄 License

Apache-2.0 © Neuledge

See [LICENSE](LICENSE) for more information.
