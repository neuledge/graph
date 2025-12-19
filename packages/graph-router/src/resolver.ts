import type {
  NeuledgeGraphMatch,
  NeuledgeGraphTemplateParams,
} from "./match.js";
import { decodePathPart } from "./utils.js";

export abstract class NeuledgeGraphResolver<Template extends string> {
  private readonly matcher: RegExp;

  constructor(public readonly template: Template) {
    this.matcher = NeuledgeGraphResolver.generateMatcher(template);
  }

  abstract resolve<Value extends object>(args: {
    params: NeuledgeGraphTemplateParams<Template>;
  }): Promise<Value>;

  match(args: { path: string }): NeuledgeGraphMatch<Template> | null {
    const match = args.path.match(this.matcher);
    if (!match?.groups) return null;

    return {
      resolver: this,
      params: Object.fromEntries(
        Object.entries(match.groups).map(([key, value]) => [
          key,
          decodePathPart(value),
        ]),
      ) as NeuledgeGraphTemplateParams<Template>,
    };
  }

  static generateMatcher(template: string): RegExp {
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
