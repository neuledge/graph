import { describe, expect, it } from "vitest";
import { NeuledgeGraphMatcher } from "./matcher.js";

describe("NeuledgeGraphMatcher", () => {
  it("matches exact template without params", () => {
    const matcher = new NeuledgeGraphMatcher("user.profile");
    const result = matcher.match({ path: "user.profile" });

    expect(result).toEqual({
      template: "user.profile",
      params: {},
    });
  });

  it("matches template with single param", () => {
    const matcher = new NeuledgeGraphMatcher("user.{id}");
    const result = matcher.match({ path: "user.123" });

    expect(result).toEqual({
      template: "user.{id}",
      params: { id: "123" },
    });
  });

  it("matches template with multiple params", () => {
    const matcher = new NeuledgeGraphMatcher("user.{userId}.post.{postId}");
    const result = matcher.match({ path: "user.abc.post.xyz" });

    expect(result).toEqual({
      template: "user.{userId}.post.{postId}",
      params: { userId: "abc", postId: "xyz" },
    });
  });

  it("returns null for non-matching path", () => {
    const matcher = new NeuledgeGraphMatcher("user.{id}");
    const result = matcher.match({ path: "post.123" });

    expect(result).toBeNull();
  });

  it("does not match across dots", () => {
    const matcher = new NeuledgeGraphMatcher("user.{id}.profile");
    const result = matcher.match({ path: "user.123.456.profile" });

    expect(result).toBeNull();
  });

  it("decodes params", () => {
    const matcher = new NeuledgeGraphMatcher("user.{id}");
    const result = matcher.match({ path: "user.hello_world" });

    expect(result?.params).toStrictEqual({ id: "hello world" });
  });

  it("throws error for duplicate param names", () => {
    expect(() => {
      new NeuledgeGraphMatcher("user.{id}.post.{id}");
    }).toThrowError(
      'Invalid template "user.{id}.post.{id}": Duplicate capture group name',
    );
  });

  it("handles templates with special regex characters", () => {
    const matcher = new NeuledgeGraphMatcher("file.{name}.v1(backup)");
    const result = matcher.match({ path: "file.my_file.v1(backup)" });

    expect(result).toEqual({
      template: "file.{name}.v1(backup)",
      params: { name: "my file" },
    });
  });
});
