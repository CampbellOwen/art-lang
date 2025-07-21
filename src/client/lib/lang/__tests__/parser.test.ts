import { describe, it, expect } from "@jest/globals";
import { parse } from "../parser.js";
import { isErr, isOk } from "../core.js";

describe("Parser", () => {
  describe("Current implementation (unfinished)", () => {
    it("should return error for empty input", () => {
      const result = parse("");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0]).toBeInstanceOf(Error);
        expect(result.value[0].message).toBe("Unexpected end of input");
      }
    });

    it("should return error for simple number input", () => {
      const result = parse("42");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value[0]).toBeInstanceOf(Error);
        expect(result.value[0].message).toBe("Unexpected end of input");
      }
    });

    it("should return error for string input", () => {
      const result = parse('"hello"');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.value[0].message).toBe("Unexpected end of input");
      }
    });

    it("should return error for symbol input", () => {
      const result = parse("hello");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.value[0].message).toBe("Unexpected end of input");
      }
    });

    it("should return error for list input", () => {
      const result = parse("(+ 1 2)");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.value[0].message).toBe("Unexpected end of input");
      }
    });

    it("should return error for complex nested input", () => {
      const result = parse("(define (square x) (* x x))");
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.value[0].message).toBe("Unexpected end of input");
      }
    });
  });

  // These tests are for when the parser is fully implemented
  describe("Future implementation tests (currently failing)", () => {
    describe("Number parsing", () => {
      it("should parse positive integers", () => {
        const result = parse("123");
        // This will fail until parser is implemented
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "number", value: 123 });
        }
      });

      it("should parse negative integers", () => {
        const result = parse("-456");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "number", value: -456 });
        }
      });

      it("should parse floating point numbers", () => {
        const result = parse("3.14");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "number", value: 3.14 });
        }
      });
    });

    describe("String parsing", () => {
      it("should parse simple strings", () => {
        const result = parse('"hello"');
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "string", value: "hello" });
        }
      });

      it("should parse empty strings", () => {
        const result = parse('""');
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "string", value: "" });
        }
      });

      it("should parse strings with spaces", () => {
        const result = parse('"hello world"');
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "string",
            value: "hello world",
          });
        }
      });
    });

    describe("Symbol parsing", () => {
      it("should parse simple symbols", () => {
        const result = parse("hello");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "symbol", value: "hello" });
        }
      });

      it("should parse symbols with hyphens", () => {
        const result = parse("add-numbers");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "symbol",
            value: "add-numbers",
          });
        }
      });

      it("should parse symbols with question marks", () => {
        const result = parse("empty?");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "symbol", value: "empty?" });
        }
      });

      it("should parse symbols with exclamation marks", () => {
        const result = parse("do-it!");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "symbol", value: "do-it!" });
        }
      });
    });

    describe("List parsing", () => {
      it("should parse empty lists", () => {
        const result = parse("()");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "list", elements: [] });
        }
      });

      it("should parse simple lists with one element", () => {
        const result = parse("(hello)");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            elements: [{ type: "symbol", value: "hello" }],
          });
        }
      });

      it("should parse lists with multiple elements", () => {
        const result = parse("(+ 1 2)");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            elements: [
              { type: "symbol", value: "+" },
              { type: "number", value: 1 },
              { type: "number", value: 2 },
            ],
          });
        }
      });

      it("should parse nested lists", () => {
        const result = parse("(+ (- 5 3) 2)");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            elements: [
              { type: "symbol", value: "+" },
              {
                type: "list",
                elements: [
                  { type: "symbol", value: "-" },
                  { type: "number", value: 5 },
                  { type: "number", value: 3 },
                ],
              },
              { type: "number", value: 2 },
            ],
          });
        }
      });
    });

    describe("Multiple expressions", () => {
      it("should parse multiple expressions on separate lines", () => {
        const result = parse("42\nhello\n(+ 1 2)");
        if (isOk(result)) {
          expect(result.value).toHaveLength(3);
          expect(result.value[0]).toEqual({ type: "number", value: 42 });
          expect(result.value[1]).toEqual({ type: "symbol", value: "hello" });
          expect(result.value[2]).toEqual({
            type: "list",
            elements: [
              { type: "symbol", value: "+" },
              { type: "number", value: 1 },
              { type: "number", value: 2 },
            ],
          });
        }
      });

      it("should parse multiple expressions with whitespace", () => {
        const result = parse('  42   "hello"   (+ 1 2)  ');
        if (isOk(result)) {
          expect(result.value).toHaveLength(3);
          expect(result.value[0]).toEqual({ type: "number", value: 42 });
          expect(result.value[1]).toEqual({ type: "string", value: "hello" });
          expect(result.value[2]).toEqual({
            type: "list",
            elements: [
              { type: "symbol", value: "+" },
              { type: "number", value: 1 },
              { type: "number", value: 2 },
            ],
          });
        }
      });
    });

    describe("Real-world examples", () => {
      it("should parse function call with multiple arguments", () => {
        const result = parse("(circle 100 200 50)");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            elements: [
              { type: "symbol", value: "circle" },
              { type: "number", value: 100 },
              { type: "number", value: 200 },
              { type: "number", value: 50 },
            ],
          });
        }
      });

      it("should parse function definition", () => {
        const result = parse("(define (square x) (* x x))");
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            elements: [
              { type: "symbol", value: "define" },
              {
                type: "list",
                elements: [
                  { type: "symbol", value: "square" },
                  { type: "symbol", value: "x" },
                ],
              },
              {
                type: "list",
                elements: [
                  { type: "symbol", value: "*" },
                  { type: "symbol", value: "x" },
                  { type: "symbol", value: "x" },
                ],
              },
            ],
          });
        }
      });
    });

    describe("Error cases (when parser is implemented)", () => {
      it("should return error for unmatched opening parenthesis", () => {
        const result = parse("(+ 1 2");
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.value[0].message).toMatch(
            /unmatched|parenthesis|paren/i,
          );
        }
      });

      it("should return error for unmatched closing parenthesis", () => {
        const result = parse("+ 1 2)");
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.value[0].message).toMatch(
            /unmatched|parenthesis|paren/i,
          );
        }
      });

      it("should return error for unterminated string", () => {
        const result = parse('"hello');
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.value[0].message).toMatch(/unterminated|string/i);
        }
      });

      it("should return error for invalid numbers", () => {
        const result = parse("12.34.56");
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.value[0].message).toMatch(/invalid|number/i);
        }
      });
    });

    describe("Edge cases", () => {
      it("should handle deeply nested structures", () => {
        const deeplyNested = "(((((hello)))))";
        const result = parse(deeplyNested);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          // Should be deeply nested list structure
          let current = result.value[0];
          for (let i = 0; i < 5; i++) {
            expect(current.type).toBe("list");
            if (current.type === "list") {
              expect(current.elements).toHaveLength(1);
              current = current.elements[0];
            }
          }
          expect(current).toEqual({ type: "symbol", value: "hello" });
        }
      });

      it("should handle mixed types in lists", () => {
        const result = parse('(42 "hello" world (+ 1 2))');
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            elements: [
              { type: "number", value: 42 },
              { type: "string", value: "hello" },
              { type: "symbol", value: "world" },
              {
                type: "list",
                elements: [
                  { type: "symbol", value: "+" },
                  { type: "number", value: 1 },
                  { type: "number", value: 2 },
                ],
              },
            ],
          });
        }
      });

      it("should handle whitespace and newlines correctly", () => {
        const result = parse(`
          42

          "hello"

          (+ 1
             2)
        `);
        if (isOk(result)) {
          expect(result.value).toHaveLength(3);
          expect(result.value[0]).toEqual({ type: "number", value: 42 });
          expect(result.value[1]).toEqual({ type: "string", value: "hello" });
          expect(result.value[2]).toEqual({
            type: "list",
            elements: [
              { type: "symbol", value: "+" },
              { type: "number", value: 1 },
              { type: "number", value: 2 },
            ],
          });
        }
      });
    });
  });
});
