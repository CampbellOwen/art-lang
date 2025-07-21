import { describe, it, expect } from "@jest/globals";
import { parse } from "../parser.js";
import { isErr, isOk } from "../core.js";

describe("Parser", () => {
  describe("Basic token parsing and error handling", () => {
    it("should return empty program for empty input", () => {
      const result = parse("");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should parse simple number input", () => {
      const result = parse("42");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toEqual({ type: "number", value: 42 });
      }
    });

    it("should parse string input", () => {
      const result = parse('"hello"');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toEqual({ type: "string", value: "hello" });
      }
    });

    it("should parse symbol input", () => {
      const result = parse("hello");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toEqual({ type: "symbol", value: "hello" });
      }
    });

    it("should parse simple list input", () => {
      const result = parse("(+ 1 2)");
      expect(isOk(result)).toBe(true);
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

    it("should parse complex nested input", () => {
      const result = parse("(define (square x) (* x x))");
      expect(isOk(result)).toBe(true);
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

  // These tests verify the expected parser behavior
  describe("Parser implementation requirements", () => {
    describe("Integer and floating point number literals", () => {
      it("should parse positive integers", () => {
        const result = parse("123");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "number", value: 123 });
        }
      });

      it("should parse negative integers", () => {
        const result = parse("-456");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "number", value: -456 });
        }
      });

      it("should parse floating point numbers", () => {
        const result = parse("3.14");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "number", value: 3.14 });
        }
      });
    });

    describe("String literals with double quotes", () => {
      it("should parse simple strings", () => {
        const result = parse('"hello"');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "string", value: "hello" });
        }
      });

      it("should parse empty strings", () => {
        const result = parse('""');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "string", value: "" });
        }
      });

      it("should parse strings with spaces", () => {
        const result = parse('"hello world"');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "string",
            value: "hello world",
          });
        }
      });
    });

    describe("Symbolic identifiers and operators", () => {
      it("should parse simple symbols", () => {
        const result = parse("hello");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "symbol", value: "hello" });
        }
      });

      it("should parse symbols with hyphens", () => {
        const result = parse("add-numbers");
        expect(isOk(result)).toBe(true);
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
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "symbol", value: "empty?" });
        }
      });

      it("should parse symbols with exclamation marks", () => {
        const result = parse("do-it!");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "symbol", value: "do-it!" });
        }
      });
    });

    describe("S-expressions (parenthesized lists)", () => {
      it("should parse empty lists", () => {
        const result = parse("()");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({ type: "list", elements: [] });
        }
      });

      it("should parse simple lists with one element", () => {
        const result = parse("(hello)");
        expect(isOk(result)).toBe(true);
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
        expect(isOk(result)).toBe(true);
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
        expect(isOk(result)).toBe(true);
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

    describe("Sequential expressions separated by whitespace", () => {
      it("should parse multiple expressions on separate lines", () => {
        const result = parse("42\nhello\n(+ 1 2)");
        expect(isOk(result)).toBe(true);
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
        expect(isOk(result)).toBe(true);
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

    describe("Complex nested structures and function definitions", () => {
      it("should parse function call with multiple arguments", () => {
        const result = parse("(circle 100 200 50)");
        expect(isOk(result)).toBe(true);
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
        expect(isOk(result)).toBe(true);
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

    describe("Syntax error detection and reporting", () => {
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

    describe("Robustness with complex nesting and whitespace", () => {
      it("should handle deeply nested structures", () => {
        const deeplyNested = "(((((hello)))))";
        const result = parse(deeplyNested);
        expect(isOk(result)).toBe(true);
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
        expect(isOk(result)).toBe(true);
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
        expect(isOk(result)).toBe(true);
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
