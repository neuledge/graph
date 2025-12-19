import type { NeuledgeGraphResolver } from "./resolver.js";

export interface NeuledgeGraphMatch<Template extends string = string> {
  resolver: NeuledgeGraphResolver<Template>;
  params: NeuledgeGraphTemplateParams<Template>;
}

export type NeuledgeGraphTemplateParams<Template extends string = string> =
  Record<NeuledgeGraphTemplateParamsNames<Template>, string>;

type NeuledgeGraphTemplateParamsNames<T extends string> =
  T extends `${string}{${infer Param}}${infer Rest}`
    ? Param | NeuledgeGraphTemplateParamsNames<Rest>
    : never;
