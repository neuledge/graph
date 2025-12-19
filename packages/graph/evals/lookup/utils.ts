import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NeuledgeGraph } from "@neuledge/graph";
import {
  Experimental_Agent as Agent,
  type LanguageModel,
  stepCountIs,
  tool,
} from "ai";
import yaml from "js-yaml";
import { describe, expect, it, vi } from "vitest";
import * as z from "zod";

const file = await fs.readFile(
  `${path.dirname(fileURLToPath(import.meta.url))}/data.yml`,
  "utf8",
);

const testCategories = z
  .array(
    z.object({
      category: z.string(),
      tests: z.array(
        z.object({
          prompt: z.string(),
          matches: z.record(z.string(), z.number().min(0).max(1)),
          suggestions: z.array(z.string()).optional(),
          minScore: z.number().min(0).max(1).optional(),
        }),
      ),
    }),
  )
  .parse(yaml.load(file));

export const evalLookupQueries = ({
  concurrent = true,
  ...rest
}: {
  model: LanguageModel;
  providerOptions?: Record<string, Record<string, string>>;
  concurrent?: boolean;
}) => {
  describe(modelName(rest.model), { concurrent }, () => {
    for (const category of testCategories) {
      describe(category.category, () => {
        for (const test of category.tests) {
          evalLookupQuery({
            ...rest,
            ...test,
          });
        }
      });
    }
  });
};

const modelName = (model: LanguageModel): string =>
  typeof model === "string" ? model : model.modelId;

const evalLookupQuery = ({
  model,
  providerOptions,
  prompt,
  matches,
  suggestions,
  minCount = 2,
  maxCount = 5,
  minScore = 0.7,
}: {
  model: LanguageModel;
  providerOptions?: Record<string, Record<string, string>>;
  prompt: string;
  matches: Record<string, number>;
  suggestions?: string[];
  minCount?: number;
  maxCount?: number;
  minScore?: number;
}) =>
  it(`${prompt} [${modelName(model)}]`, async (ctx) => {
    interface TestScoreResult {
      queries: string[];
      maxScore: number;
      response: string;
    }

    const testScore = async (): Promise<TestScoreResult> => {
      const graph = new NeuledgeGraph();

      // making a hard copy for test isolation
      const lookup = { ...graph.lookup };

      const lookupSpy = vi
        .spyOn(lookup, "execute")
        .mockImplementation(async ({ query }) => {
          if (matches[query] != null || !suggestions?.length) {
            throw new Error("Not implemented");
          }

          const isMatch = suggestions.some((template) =>
            isTemplateMatches(template, query),
          );

          return {
            status: "ambiguous",
            reasonCode: isMatch
              ? "UNKNOWN_PLACEHOLDER_VALUE"
              : "NO_TEMPLATE_MATCH",
            suggestions: suggestions.map((template) => ({
              template,
            })),
          };
        });

      const agent = new Agent({
        model,
        tools: {
          lookup: tool(lookup),
        },
        stopWhen: stepCountIs(4),
        maxOutputTokens: 200,
      });

      const result = await agent.generate({
        prompt,
        providerOptions,
      });

      const queries = lookupSpy.mock.calls.map(([params]) => params.query);

      const maxScore = queries.length
        ? Math.max(...queries.map((query) => matches[query] ?? 0))
        : 0;

      return {
        queries,
        maxScore,
        response: result.text,
      };
    };

    const result: TestScoreResult[] = [];
    let score = 0;

    do {
      const newSize = Math.min(Math.max(result.length * 2, minCount), maxCount);
      if (newSize === result.length) break;

      result.push(
        ...(await Promise.all(
          Array(newSize - result.length)
            .fill(null)
            .map(() => testScore()),
        )),
      );

      score = result
        .filter((s) => !!s.queries.length)
        .map((s) => s.maxScore)
        .reduce(
          (prev, acc, _i, all) => prev + acc / Math.max(all.length, minCount),
          0,
        );
    } while (score < minScore);

    ctx.onTestFailed(() => {
      console.log(`Given queries for "${prompt}":`, result);
    });

    expect(score).toBeGreaterThanOrEqual(minScore);
  });

const isTemplateMatches = (template: string, query: string): boolean =>
  new RegExp(
    "^" +
      template.replace(/\./g, "\\.").replace(/{[a-zA-Z0-9_]+}/g, "([^\\.]+)") +
      "$",
  ).test(query);
