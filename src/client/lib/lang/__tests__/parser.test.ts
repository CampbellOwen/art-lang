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
        expect(result.value[0]).toEqual({
          type: "number",
          location: 0,
          value: 42,
        });
      }
    });

    it("should parse string input", () => {
      const result = parse('"hello"');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toEqual({
          type: "string",
          location: 0,
          value: "hello",
        });
      }
    });

    it("should parse symbol input", () => {
      const result = parse("hello");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toEqual({
          type: "symbol",
          location: 0,
          value: "hello",
        });
      }
    });

    it("should parse simple list input", () => {
      const result = parse("(+ 1 2)");
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toEqual({
          type: "list",
          location: 0,
          elements: [
            { type: "symbol", location: 1, value: "+" },
            { type: "number", location: 3, value: 1 },
            { type: "number", location: 5, value: 2 },
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
          location: 0,
          elements: [
            { type: "symbol", location: 1, value: "define" },
            {
              type: "list",
              location: 8,
              elements: [
                { type: "symbol", location: 9, value: "square" },
                { type: "symbol", location: 16, value: "x" },
              ],
            },
            {
              type: "list",
              location: 19,
              elements: [
                { type: "symbol", location: 20, value: "*" },
                { type: "symbol", location: 22, value: "x" },
                { type: "symbol", location: 24, value: "x" },
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
          expect(result.value[0]).toEqual({
            type: "number",
            location: 0,
            value: 123,
          });
        }
      });

      it("should parse negative integers", () => {
        const result = parse("-456");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "number",
            location: 0,
            value: -456,
          });
        }
      });

      it("should parse floating point numbers", () => {
        const result = parse("3.14");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "number",
            location: 0,
            value: 3.14,
          });
        }
      });
    });

    describe("String literals with double quotes", () => {
      it("should parse simple strings", () => {
        const result = parse('"hello"');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "string",
            location: 0,
            value: "hello",
          });
        }
      });

      it("should parse empty strings", () => {
        const result = parse('""');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "string",
            location: 0,
            value: "",
          });
        }
      });

      it("should parse strings with spaces", () => {
        const result = parse('"hello world"');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "string",
            location: 0,
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
          expect(result.value[0]).toEqual({
            type: "symbol",
            location: 0,
            value: "hello",
          });
        }
      });

      it("should parse symbols with hyphens", () => {
        const result = parse("add-numbers");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "symbol",
            location: 0,
            value: "add-numbers",
          });
        }
      });

      it("should parse symbols with question marks", () => {
        const result = parse("empty?");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "symbol",
            location: 0,
            value: "empty?",
          });
        }
      });

      it("should parse symbols with exclamation marks", () => {
        const result = parse("do-it!");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "symbol",
            location: 0,
            value: "do-it!",
          });
        }
      });
    });

    describe("S-expressions (parenthesized lists)", () => {
      it("should parse empty lists", () => {
        const result = parse("()");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            location: 0,
            elements: [],
          });
        }
      });

      it("should parse nested empty lists", () => {
        const result = parse("(((())))");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            location: 0,
            elements: [
              {
                type: "list",
                location: 1,
                elements: [
                  {
                    type: "list",
                    location: 2,
                    elements: [
                      {
                        type: "list",
                        location: 3,
                        elements: [],
                      },
                    ],
                  },
                ],
              },
            ],
          });
        }
      });

      it("should parse simple lists with one element", () => {
        const result = parse("(hello)");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            location: 0,
            elements: [{ type: "symbol", location: 1, value: "hello" }],
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
            location: 0,
            elements: [
              { type: "symbol", location: 1, value: "+" },
              { type: "number", location: 3, value: 1 },
              { type: "number", location: 5, value: 2 },
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
            location: 0,
            elements: [
              { type: "symbol", location: 1, value: "+" },
              {
                type: "list",
                location: 3,
                elements: [
                  { type: "symbol", location: 4, value: "-" },
                  { type: "number", location: 6, value: 5 },
                  { type: "number", location: 8, value: 3 },
                ],
              },
              { type: "number", location: 11, value: 2 },
            ],
          });
        }
      });

      it("should parse a list of numbers", () => {
        const result = parse("(1 -5 3.14 0)");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            location: 0,
            elements: [
              { type: "number", location: 1, value: 1 },
              { type: "number", location: 3, value: -5 },
              { type: "number", location: 6, value: 3.14 },
              { type: "number", location: 11, value: 0 },
            ],
          });
        }
      });

      it("should parse a list with strings and numbers", () => {
        const result = parse('(1 "hello" 2 "world")');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            location: 0,
            elements: [
              { type: "number", location: 1, value: 1 },
              { type: "string", location: 3, value: "hello" },
              { type: "number", location: 11, value: 2 },
              { type: "string", location: 13, value: "world" },
            ],
          });
        }
      });

      it("should parse a list with various symbol types", () => {
        const result = parse("(+ add-numbers empty? do-it!)");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            location: 0,
            elements: [
              { type: "symbol", location: 1, value: "+" },
              { type: "symbol", location: 3, value: "add-numbers" },
              { type: "symbol", location: 15, value: "empty?" },
              { type: "symbol", location: 22, value: "do-it!" },
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
          expect(result.value[0]).toEqual({
            type: "number",
            location: 0,
            value: 42,
          });
          expect(result.value[1]).toEqual({
            type: "symbol",
            location: 3,
            value: "hello",
          });
          expect(result.value[2]).toEqual({
            type: "list",
            location: 9,
            elements: [
              { type: "symbol", location: 10, value: "+" },
              { type: "number", location: 12, value: 1 },
              { type: "number", location: 14, value: 2 },
            ],
          });
        }
      });

      it("should parse multiple expressions with whitespace", () => {
        const result = parse('  42   "hello"   (+ 1 2)  ');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(3);
          expect(result.value[0]).toEqual({
            type: "number",
            location: 2,
            value: 42,
          });
          expect(result.value[1]).toEqual({
            type: "string",
            location: 7,
            value: "hello",
          });
          expect(result.value[2]).toEqual({
            type: "list",
            location: 17,
            elements: [
              { type: "symbol", location: 18, value: "+" },
              { type: "number", location: 20, value: 1 },
              { type: "number", location: 22, value: 2 },
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
            location: 0,
            elements: [
              { type: "symbol", location: 1, value: "circle" },
              { type: "number", location: 8, value: 100 },
              { type: "number", location: 12, value: 200 },
              { type: "number", location: 16, value: 50 },
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
            location: 0,
            elements: [
              { type: "symbol", location: 1, value: "define" },
              {
                type: "list",
                location: 8,
                elements: [
                  { type: "symbol", location: 9, value: "square" },
                  { type: "symbol", location: 16, value: "x" },
                ],
              },
              {
                type: "list",
                location: 19,
                elements: [
                  { type: "symbol", location: 20, value: "*" },
                  { type: "symbol", location: 22, value: "x" },
                  { type: "symbol", location: 24, value: "x" },
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
          expect(current).toEqual({
            type: "symbol",
            location: 10,
            value: "hello",
          });
        }
      });

      it("should handle mixed types in lists", () => {
        const result = parse('(42 "hello" world (+ 1 2))');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value).toHaveLength(1);
          expect(result.value[0]).toEqual({
            type: "list",
            location: 0,
            elements: [
              { type: "number", location: 1, value: 42 },
              { type: "string", location: 4, value: "hello" },
              { type: "symbol", location: 12, value: "world" },
              {
                type: "list",
                location: 18,
                elements: [
                  { type: "symbol", location: 19, value: "+" },
                  { type: "number", location: 21, value: 1 },
                  { type: "number", location: 23, value: 2 },
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
          expect(result.value[0]).toEqual({
            type: "number",
            location: 11,
            value: 42,
          });
          expect(result.value[1]).toEqual({
            type: "string",
            location: 26,
            value: "hello",
          });
          expect(result.value[2]).toEqual({
            type: "list",
            location: 45,
            elements: [
              { type: "symbol", location: 46, value: "+" },
              { type: "number", location: 48, value: 1 },
              { type: "number", location: 63, value: 2 },
            ],
          });
        }
      });
    });
  });
});
