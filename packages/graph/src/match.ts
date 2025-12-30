export interface NeuledgeGraphMatch<Template extends string = string> {
  template: Template;
  params: NeuledgeGraphTemplateParams<Template>;
}

export type NeuledgeGraphTemplateParams<Template extends string = string> =
  Record<NeuledgeGraphTemplateParamsNames<Template>, string>;

type NeuledgeGraphTemplateParamsNames<T extends string> =
  T extends `${string}{${infer Param}}${infer Rest}`
    ? Param | NeuledgeGraphTemplateParamsNames<Rest>
    : never;
