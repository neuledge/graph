import type { NeuledgeGraphTemplateParams } from "./match.js";

export const normalizePath = (path: string) =>
  path.split(/\.+/g).filter(Boolean).map(encodePathPart).join(".");

export const encodePathPart = (value: string): string =>
  value
    // Clean special characters but keep letters (any language), numbers and dots
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    // Trim spaces on the begining and ending of the string
    .trim()
    // Replace spaces with underscores
    .replace(/\s+/g, "_")
    // Insert underscore before uppercase letter followed by lowercase (for acronyms)
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    // Insert underscores before uppercase letters that follow lowercase letters
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    // Convert everything to lowercase
    .toLowerCase();

export const decodePathPart = (pathPart: string): string =>
  pathPart.replaceAll("_", " ");

export const buildPath = <Template extends string>(
  template: Template,
  params: NeuledgeGraphTemplateParams<Template>,
): string => {
  return Object.entries(params).reduce(
    (path, [name, value]) =>
      path.replaceAll(`{${name}}`, encodePathPart(value as string)),
    template as string,
  );
};
