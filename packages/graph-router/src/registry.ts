import type { NeuledgeGraphMatch } from "@neuledge/graph";

export interface NeuledgeGraphRegistry {
  match(args: { path: string }): Promise<NeuledgeGraphMatch | null>;
  resolve<Template extends string, Value extends object>(
    match: NeuledgeGraphMatch<Template>,
  ): Promise<Value>;
  suggestions(args: { path: string }): Promise<NeuledgeGraphSuggestion[]>;
}

export interface NeuledgeGraphSuggestion<Template extends string = string> {
  template: Template;
  similarity: number;
}
