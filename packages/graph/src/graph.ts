import { lookup } from "./lookup.js";

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
    this.baseUrl = options.baseUrl || "https://api.graph.neuledge.com/v1";
    this.timeout = options.timeout || 10000;
  }

  // assign the type hardcoded here as we updating the prototype later on
  declare lookup: typeof lookup;
}

NeuledgeGraph.prototype.lookup = lookup;
