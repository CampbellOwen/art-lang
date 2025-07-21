import { describe, it, expect } from "@jest/globals";
import { ok, error, isOk, isErr } from "../core.js";

describe("Core Result type", () => {
  describe("ok function", () => {
    it("should create an Ok result with correct type and value", () => {
      const result = ok(42);
      expect(result.type).toBe("ok");
      expect(result.value).toBe(42);
    });

    it("should work with string values", () => {
      const result = ok("hello");
      expect(result.type).toBe("ok");
      expect(result.value).toBe("hello");
    });

    it("should work with object values", () => {
      const obj = { name: "test", value: 123 };
      const result = ok(obj);
      expect(result.type).toBe("ok");
      expect(result.value).toBe(obj);
    });

    it("should work with array values", () => {
      const arr = [1, 2, 3];
      const result = ok(arr);
      expect(result.type).toBe("ok");
      expect(result.value).toBe(arr);
    });

    it("should work with null values", () => {
      const result = ok(null);
      expect(result.type).toBe("ok");
      expect(result.value).toBeNull();
    });
  });

  describe("error function", () => {
    it("should create an Err result with correct type and value", () => {
      const err = new Error("Something went wrong");
      const result = error(err);
      expect(result.type).toBe("error");
      expect(result.value).toBe(err);
    });

    it("should work with string error values", () => {
      const result = error("failure message");
      expect(result.type).toBe("error");
      expect(result.value).toBe("failure message");
    });

    it("should work with array of errors", () => {
      const errors = [new Error("Error 1"), new Error("Error 2")];
      const result = error(errors);
      expect(result.type).toBe("error");
      expect(result.value).toBe(errors);
    });
  });

  describe("isOk function", () => {
    it("should return true for Ok results", () => {
      const result = ok("success");
      expect(isOk(result)).toBe(true);
    });

    it("should return false for Err results", () => {
      const result = error("failure");
      expect(isOk(result)).toBe(false);
    });

    it("should provide type narrowing for Ok results", () => {
      const result = ok(42);
      if (isOk(result)) {
        // TypeScript should know this is Ok<number>
        expect(result.value).toBe(42);
      }
    });
  });

  describe("isErr function", () => {
    it("should return true for Err results", () => {
      const result = error("failure");
      expect(isErr(result)).toBe(true);
    });

    it("should return false for Ok results", () => {
      const result = ok("success");
      expect(isErr(result)).toBe(false);
    });

    it("should provide type narrowing for Err results", () => {
      const result = error("test error");
      if (isErr(result)) {
        // TypeScript should know this is Err<string>
        expect(result.value).toBe("test error");
      }
    });
  });

  describe("Result type combinations", () => {
    it("should handle complex Ok values", () => {
      const complexValue = {
        expressions: [
          { type: "number", value: 42 },
          { type: "string", value: "hello" },
          { type: "list", elements: [] },
        ],
      };
      const result = ok(complexValue);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.expressions).toHaveLength(3);
        expect(result.value.expressions[0]).toEqual({
          type: "number",
          value: 42,
        });
      }
    });

    it("should handle complex error values", () => {
      const errors = [
        new Error("Parse error at position 5"),
        new Error("Unexpected token: ')'"),
        new Error("Missing closing parenthesis"),
      ];
      const result = error(errors);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.value).toHaveLength(3);
        expect(result.value[0].message).toBe("Parse error at position 5");
        expect(result.value[1].message).toBe("Unexpected token: ')'");
        expect(result.value[2].message).toBe("Missing closing parenthesis");
      }
    });
  });

  describe("Type safety", () => {
    it("should maintain type information through transformations", () => {
      const numResult = ok(123);
      const strResult = ok("test");

      expect(isOk(numResult)).toBe(true);
      expect(isOk(strResult)).toBe(true);

      if (isOk(numResult) && isOk(strResult)) {
        // Both should be accessible with proper typing
        expect(typeof numResult.value).toBe("number");
        expect(typeof strResult.value).toBe("string");
      }
    });

    it("should work with generic Result types", () => {
      type ParseResult = {
        ast: unknown[];
        position: number;
      };

      const parseSuccess: ParseResult = { ast: [], position: 10 };
      const result = ok(parseSuccess);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.ast).toEqual([]);
        expect(result.value.position).toBe(10);
      }
    });
  });
});
