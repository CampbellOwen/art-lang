import { describe, it, expect, beforeEach } from "@jest/globals";
import { run, evaluate } from "../interpreter.js";
import { MockCanvas } from "../canvas.js";
import { SymbolTable } from "../environment.js";
import { Expr, Symbol, Num, List } from "../types.js";
import { ok } from "../core.js";

describe("Interpreter", () => {
  let canvas: MockCanvas;

  beforeEach(() => {
    canvas = new MockCanvas(400, 300);
  });

  describe("evaluate basic expressions", () => {
    it("should evaluate number literals", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const expr: Num = { type: "number", value: 42 };

      const result = evaluate(environment, expr);

      expect(result).toEqual(ok(expr));
    });

    it("should evaluate string literals", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const expr: Expr = { type: "string", value: "hello" };

      const result = evaluate(environment, expr);

      expect(result).toEqual(ok(expr));
    });

    it("should evaluate symbols from symbol table", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const symbol: Symbol = { type: "symbol", value: "x" };
      const value: Num = { type: "number", value: 10 };

      environment.symbolTable.set(symbol, value);

      const result = evaluate(environment, symbol);

      expect(result).toEqual(ok(value));
    });

    it("should return error for undefined symbols", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const symbol: Symbol = {
        type: "symbol",

        value: "undefined",
      };

      const result = evaluate(environment, symbol);

      expect(result.type).toBe("error");
      if (result.type === "error") {
        expect(result.value.message).toBe("Symbol undefined undefined");
      }
    });
  });

  describe("+ built-in function", () => {
    it("should add two numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "+" },
            { type: "number", value: 2 },
            { type: "number", value: 3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: 5 }));
    });

    it("should add multiple numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "+" },
            { type: "number", value: 1 },
            { type: "number", value: 2 },
            { type: "number", value: 3 },
            { type: "number", value: 4 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: 10 }));
    });

    it("should return 0 for addition with no arguments", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [{ type: "symbol", value: "+" }],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: 0 }));
    });

    it("should add negative numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "+" },
            { type: "number", value: -5 },
            { type: "number", value: 3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: -2 }));
    });

    it("should add decimal numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "+" },
            { type: "number", value: 1.5 },
            { type: "number", value: 2.3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: 3.8 }));
    });

    it("should evaluate symbol arguments before adding", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const xSymbol: Symbol = { type: "symbol", value: "x" };
      const ySymbol: Symbol = { type: "symbol", value: "y" };

      environment.symbolTable.set(xSymbol, {
        type: "number",

        value: 10,
      });
      environment.symbolTable.set(ySymbol, {
        type: "number",

        value: 20,
      });

      const expr: List = {
        type: "list",

        elements: [{ type: "symbol", value: "+" }, xSymbol, ySymbol],
      };

      const result = evaluate(environment, expr);

      expect(result).toEqual(ok({ type: "number", value: 30 }));
    });

    it("should return error when adding non-numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "+" },
            { type: "number", value: 5 },
            { type: "string", value: "hello" },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("error");
      if (results[0].type === "error") {
        expect(results[0].value.message).toBe(
          "Addition requires numbers, got string",
        );
      }
    });

    it("should return error when symbol evaluates to non-number", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const symbol: Symbol = { type: "symbol", value: "text" };

      environment.symbolTable.set(symbol, {
        type: "string",

        value: "not a number",
      });

      const expr: List = {
        type: "list",

        elements: [
          { type: "symbol", value: "+" },
          { type: "number", value: 5 },
          symbol,
        ],
      };

      const result = evaluate(environment, expr);

      expect(result.type).toBe("error");
      if (result.type === "error") {
        expect(result.value.message).toBe(
          "Addition requires numbers, got string",
        );
      }
    });

    it("should return error when symbol is undefined", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "+" },
            { type: "number", value: 5 },
            { type: "symbol", value: "undefined_var" },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("error");
      if (results[0].type === "error") {
        expect(results[0].value.message).toBe("Symbol undefined_var undefined");
      }
    });
  });

  describe("- built-in function", () => {
    it("should subtract two numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "-" },
            { type: "number", value: 5 },
            { type: "number", value: 3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: 2 }));
    });

    it("should subtract multiple numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "-" },
            { type: "number", value: 10 },
            { type: "number", value: 3 },
            { type: "number", value: 2 },
            { type: "number", value: 1 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: 4 }));
    });

    it("should return 0 for subtraction with no arguments", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [{ type: "symbol", value: "-" }],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: 0 }));
    });

    it("should negate a single number (unary minus)", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "-" },
            { type: "number", value: 5 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: -5 }));
    });

    it("should work with negative numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "-" },
            { type: "number", value: -5 },
            { type: "number", value: 3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: -8 }));
    });

    it("should work with decimal numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "-" },
            { type: "number", value: 5.7 },
            { type: "number", value: 2.2 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", value: 3.5 }));
    });

    it("should evaluate symbol arguments before subtracting", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const xSymbol: Symbol = { type: "symbol", value: "x" };
      const ySymbol: Symbol = { type: "symbol", value: "y" };

      environment.symbolTable.set(xSymbol, {
        type: "number",

        value: 10,
      });
      environment.symbolTable.set(ySymbol, {
        type: "number",

        value: 3,
      });

      const expr: List = {
        type: "list",

        elements: [{ type: "symbol", value: "-" }, xSymbol, ySymbol],
      };

      const result = evaluate(environment, expr);

      expect(result).toEqual(ok({ type: "number", value: 7 }));
    });

    it("should return error when subtracting non-numbers", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "-" },
            { type: "number", value: 5 },
            { type: "string", value: "hello" },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("error");
      if (results[0].type === "error") {
        expect(results[0].value.message).toBe(
          "Subtraction requires numbers, got string",
        );
      }
    });

    it("should return error for unary minus with non-number", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "-" },
            { type: "string", value: "not a number" },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("error");
      if (results[0].type === "error") {
        expect(results[0].value.message).toBe(
          "Subtraction requires numbers, got string",
        );
      }
    });

    it("should return error when symbol evaluates to non-number", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const symbol: Symbol = { type: "symbol", value: "text" };

      environment.symbolTable.set(symbol, {
        type: "string",

        value: "not a number",
      });

      const expr: List = {
        type: "list",

        elements: [
          { type: "symbol", value: "-" },
          { type: "number", value: 5 },
          symbol,
        ],
      };

      const result = evaluate(environment, expr);

      expect(result.type).toBe("error");
      if (result.type === "error") {
        expect(result.value.message).toBe(
          "Subtraction requires numbers, got string",
        );
      }
    });
  });

  describe("list evaluation", () => {
    it("should return error for empty list", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("error");
      if (results[0].type === "error") {
        expect(results[0].value.message).toBe("Cannot evaluate empty list");
      }
    });

    it("should return error for unknown built-in function", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "unknown_function" },
            { type: "number", value: 1 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("error");
      if (results[0].type === "error") {
        expect(results[0].value.message).toContain("Cannot evaluate list");
      }
    });

    it("should return error for unimplemented built-in function", () => {
      const program: List[] = [
        {
          type: "list",

          elements: [
            { type: "symbol", value: "animate" },
            { type: "number", value: 5 },
            { type: "number", value: 3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("error");
      if (results[0].type === "error") {
        expect(results[0].value.message).toBe(
          "Unimplemented built-in function animate",
        );
      }
    });
  });

  describe("program execution", () => {
    it("should execute multiple expressions", () => {
      const program: Expr[] = [
        { type: "number", value: 42 },
        {
          type: "list",

          elements: [
            { type: "symbol", value: "+" },
            { type: "number", value: 1 },
            { type: "number", value: 2 },
          ],
        },
        { type: "string", value: "done" },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(ok({ type: "number", value: 42 }));
      expect(results[1]).toEqual(ok({ type: "number", value: 3 }));
      expect(results[2]).toEqual(ok({ type: "string", value: "done" }));
    });
  });
});
