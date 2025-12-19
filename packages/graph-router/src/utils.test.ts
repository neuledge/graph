import { describe, expect, it } from "vitest";
import { normalizePath } from "./utils.js";

describe("normalizePath", () => {
  it("should handle dot-separated camelCase", () => {
    expect(normalizePath("USA.NewJersy")).toBe("usa.new_jersy");
  });

  it("should convert spaces to underscores", () => {
    expect(normalizePath("San Fransisco")).toBe("san_fransisco");
  });

  it("should handle simple space-separated words", () => {
    expect(normalizePath("hello world")).toBe("hello_world");
  });

  it("should handle dot-separated camelCase words", () => {
    expect(normalizePath("Hi.There")).toBe("hi.there");
  });

  it("should handle multiple spaces", () => {
    expect(normalizePath("hello   world")).toBe("hello_world");
  });

  it("should handle leading and trailing whitespace", () => {
    expect(normalizePath("  hello world  ")).toBe("hello_world");
  });

  it("should handle camelCase without dots", () => {
    expect(normalizePath("camelCaseString")).toBe("camel_case_string");
  });

  it("should handle PascalCase", () => {
    expect(normalizePath("PascalCaseString")).toBe("pascal_case_string");
  });

  it("should handle already normalized strings", () => {
    expect(normalizePath("already_normalized")).toBe("already_normalized");
  });

  it("should handle mixed dots, spaces, and camelCase", () => {
    expect(normalizePath("My.Project Name")).toBe("my.project_name");
  });

  it("should handle empty string", () => {
    expect(normalizePath("")).toBe("");
  });

  it("should handle single word", () => {
    expect(normalizePath("hello")).toBe("hello");
  });

  it("should handle all uppercase", () => {
    expect(normalizePath("USA")).toBe("usa");
  });

  it("should handle consecutive uppercase letters (acronyms)", () => {
    expect(normalizePath("XMLParser")).toBe("xml_parser");
  });

  it("should handle HTML-like acronyms", () => {
    expect(normalizePath("HTMLElement")).toBe("html_element");
  });

  it("should handle mixed acronyms", () => {
    expect(normalizePath("parseHTMLString")).toBe("parse_html_string");
  });

  it("should convert hyphens to underscores", () => {
    expect(normalizePath("hello-world")).toBe("hello_world");
  });

  it("should convert multiple hyphens to single underscore", () => {
    expect(normalizePath("hello---world")).toBe("hello_world");
  });

  it("should convert commas to underscores", () => {
    expect(normalizePath("hello,world")).toBe("hello_world");
  });

  it("should convert special characters to underscores", () => {
    expect(normalizePath("hello@world#test!")).toBe("hello_world_test");
  });

  it("should handle leading special characters", () => {
    expect(normalizePath("---hello")).toBe("hello");
  });

  it("should handle trailing special characters", () => {
    expect(normalizePath("hello!!!")).toBe("hello");
  });

  it("should preserve Hebrew letters", () => {
    expect(normalizePath("שלום עולם")).toBe("שלום_עולם");
  });

  it("should preserve mixed English and Hebrew", () => {
    expect(normalizePath("Hello.שלום World")).toBe("hello.שלום_world");
  });

  it("should handle Hebrew with special characters", () => {
    expect(normalizePath("אבג-דהו")).toBe("אבג_דהו");
  });

  it("should preserve numbers", () => {
    expect(normalizePath("test123")).toBe("test123");
  });

  it("should handle mixed numbers and letters", () => {
    expect(normalizePath("file-2024.backup")).toBe("file_2024.backup");
  });

  it("should handle mixed special characters", () => {
    expect(normalizePath("hello@#$%world")).toBe("hello_world");
  });

  it("should handle dots with special characters", () => {
    expect(normalizePath("hello...world")).toBe("hello.world");
  });

  it("should handle complex mixed input", () => {
    expect(normalizePath("My-Project_Name.Version2!")).toBe(
      "my_project_name.version2",
    );
  });
});
