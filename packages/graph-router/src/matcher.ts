import type {
  NeuledgeGraphMatch,
  NeuledgeGraphTemplateParams,
} from "@neuledge/graph";
import { decodePathPart } from "./utils.js";

export type NeuledgeGraphResolver<
  Template extends string,
  Value extends object,
> = (params: NeuledgeGraphTemplateParams<Template>) => Promise<Value>;

export class NeuledgeGraphMatcher<Template extends string> {
  private readonly regex: RegExp;

  constructor(public readonly template: Template) {
    this.regex = NeuledgeGraphMatcher.generateRegex(template);
  }

  match(args: { path: string }): NeuledgeGraphMatch<Template> | null {
    const match = args.path.match(this.regex);
    if (!match) return null;

    return {
      template: this.template,
      params: Object.fromEntries(
        Object.entries(match.groups ?? {}).map(([key, value]) => [
          key,
          decodePathPart(value),
        ]),
      ) as NeuledgeGraphTemplateParams<Template>,
    };
  }

  private static generateRegex(template: string): RegExp {
    try {
      const escaped = template.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regexString = escaped.replace(
        /\\\{(\w+)\\\}/g,
        (_, name) => `(?<${name}>[^.]+?)`,
      );

      return new RegExp(`^${regexString}$`);
    } catch (err) {
      if (err instanceof SyntaxError) {
        const message = err.message.split(": ").at(-1) || "Syntax error";
        throw new Error(`Invalid template "${template}": ${message}`);
      }
      throw err;
    }
  }
}
