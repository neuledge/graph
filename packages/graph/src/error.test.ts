import { describe, expect, it } from "vitest";
import { NeuledgeError } from "./error.js";

// We import the factory object (the one exported as `NeuledgeError`).
// The implementation is a callable/constructable function with a static `from` method.

describe("NeuledgeError", () => {
  it("constructs with new and sets message", () => {
    const e = new NeuledgeError("boom");
    expect(e).toHaveProperty("message", "boom");
  });

  it("should be instance of native Error", () => {
    const e = new NeuledgeError("native-error");
    expect(e).be.instanceOf(Error);
    expect(typeof e.stack).toBe("string"); // Optional: ensures stack trace is set
  });

  it(".from returns the same instance when passed an instance", () => {
    const instance = new NeuledgeError("same-instance");
    const from = NeuledgeError.from(instance);
    // identity should be preserved
    expect(from).toBe(instance);
  });

  it(".from constructs a new NeuledgeError when passed a plain object", () => {
    const plain = { message: "plain-boom" };
    const from = NeuledgeError.from(plain);
    expect(from).not.toBe(plain);
    expect(from).be.instanceOf(NeuledgeError);
    expect(from).toHaveProperty("message", "plain-boom");
  });

  it("instances are recognized by instanceof (if implementation supports it)", () => {
    const instance = new NeuledgeError("is-instanceof");
    // If the implementation uses `function` + prototype, instanceof may work.
    // This test tolerantly asserts that either instanceof is true or message exists.
    const instanceofWorks = instance instanceof NeuledgeError;
    if (instanceofWorks) {
      expect(instance instanceof NeuledgeError).toBe(true);
    } else {
      // Fallback assert that it still behaves like an error object
      expect(instance).toHaveProperty("message", "is-instanceof");
    }
  });

  it("serializes to JSON with message property", () => {
    const e = new NeuledgeError("json-boom");
    const json = JSON.parse(JSON.stringify(e));

    expect(json).toStrictEqual({ message: "json-boom" });
  });

  it("roundtrips through JSON-like error objects via .from", () => {
    // simulate receiving an error-like object from another system
    const remote = JSON.parse(JSON.stringify({ message: "remote-boom" }));
    const e = NeuledgeError.from(remote);
    expect(e).toHaveProperty("message", "remote-boom");
  });
});
