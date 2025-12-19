import { decodePathPart } from "./utils.js";

export interface NeuledgeGraphMatch<Template extends string = string> {
  template: Template;
  params: NeuledgeGraphTemplateParams<Template>;
}

export type NeuledgeGraphResolver<
  Template extends string,
  Value extends object,
> = (params: NeuledgeGraphTemplateParams<Template>) => Promise<Value>;

export type NeuledgeGraphTemplateParams<Template extends string = string> =
  Record<NeuledgeGraphTemplateParamsNames<Template>, string>;

type NeuledgeGraphTemplateParamsNames<T extends string> =
  T extends `${string}{${infer Param}}${infer Rest}`
    ? Param | NeuledgeGraphTemplateParamsNames<Rest>
    : never;

export class NeuledgeGraphMatcher<Template extends string> {
  private readonly regex: RegExp;

  constructor(public readonly template: Template) {
    this.regex = NeuledgeGraphMatcher.generateRegex(template);
  }

  match(args: { path: string }): NeuledgeGraphMatch<Template> | null {
    const match = args.path.match(this.regex);
    if (!match?.groups) return null;

    return {
      template: this.template,
      params: Object.fromEntries(
        Object.entries(match.groups).map(([key, value]) => [
          key,
          decodePathPart(value),
        ]),
      ) as NeuledgeGraphTemplateParams<Template>,
    };
  }

  private static generateRegex(template: string): RegExp {
    // First, convert {param} into named capture groups
    const withCaptureGroups = template.replace(
      /\{(\w+)\}/g,
      (_, name) => `(?<${name}>[^.]+)`,
    );

    // Then escape regex special chars (dots, etc.)
    const regexString = withCaptureGroups.replace(/\./g, "\\.");

    return new RegExp(`^${regexString}$`);
  }
}
