import type { NeuledgeGraphMatch } from "./match.js";
import type { NeuledgeGraphResolver } from "./resolver.js";

export interface NeuledgeGraphRegistry {
  match(args: { path: string }): Promise<NeuledgeGraphMatch | null>;
  suggestions(args: { path: string }): Promise<NeuledgeGraphSuggestion[]>;
}

export interface NeuledgeGraphSuggestion<Template extends string = string> {
  resolver: NeuledgeGraphResolver<Template>;
  similarity: number;
}
