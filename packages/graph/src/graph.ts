import { bindLookup, type NeuledgeGraphLookup } from "./lookup.js";

export interface NeuledgeGraphOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export class NeuledgeGraph {
  apiKey?: string;
  baseUrl: string;
  timeout: number;

  constructor(options: NeuledgeGraphOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl =
      options.baseUrl ||
      process.env.NEULEDGE_GRAPH_BASE_URL ||
      "https://api.graph.neuledge.com/v0";
    this.timeout = options.timeout || 10000;
  }

  lookup: NeuledgeGraphLookup = bindLookup(this);
}
