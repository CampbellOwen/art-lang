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
      const expr: Num = { type: "number", location: 0, value: 42 };

      const result = evaluate(environment, expr);

      expect(result).toEqual(ok(expr));
    });

    it("should evaluate string literals", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const expr: Expr = { type: "string", location: 0, value: "hello" };

      const result = evaluate(environment, expr);

      expect(result).toEqual(ok(expr));
    });

    it("should evaluate symbols from symbol table", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const symbol: Symbol = { type: "symbol", location: 0, value: "x" };
      const value: Num = { type: "number", location: 0, value: 10 };

      environment.symbolTable.set(symbol, value);

      const result = evaluate(environment, symbol);

      expect(result).toEqual(ok(value));
    });

    it("should return error for undefined symbols", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const symbol: Symbol = {
        type: "symbol",
        location: 0,
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
          location: 0,
          elements: [
            { type: "symbol", value: "+" },
            { type: "number", value: 2 },
            { type: "number", value: 3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", location: 0, value: 5 }));
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
          location: 0,
          elements: [{ type: "symbol", location: 0, value: "+" }],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(ok({ type: "number", location: 0, value: 0 }));
    });

    it("should add negative numbers", () => {
      const program: List[] = [
        {
          type: "list",
          location: 0,
          elements: [
            { type: "symbol", location: 0, value: "+" },
            { type: "number", location: 0, value: -5 },
            { type: "number", location: 0, value: 3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(
        ok({ type: "number", location: 0, value: -2 }),
      );
    });

    it("should add decimal numbers", () => {
      const program: List[] = [
        {
          type: "list",
          location: 0,
          elements: [
            { type: "symbol", location: 0, value: "+" },
            { type: "number", location: 0, value: 1.5 },
            { type: "number", location: 0, value: 2.3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(
        ok({ type: "number", location: 0, value: 3.8 }),
      );
    });

    it("should evaluate symbol arguments before adding", () => {
      const environment = { symbolTable: new SymbolTable(), canvas };
      const xSymbol: Symbol = { type: "symbol", location: 0, value: "x" };
      const ySymbol: Symbol = { type: "symbol", location: 0, value: "y" };

      environment.symbolTable.set(xSymbol, {
        type: "number",
        location: 0,
        value: 10,
      });
      environment.symbolTable.set(ySymbol, {
        type: "number",
        location: 0,
        value: 20,
      });

      const expr: List = {
        type: "list",
        location: 0,
        elements: [
          { type: "symbol", location: 0, value: "+" },
          xSymbol,
          ySymbol,
        ],
      };

      const result = evaluate(environment, expr);

      expect(result).toEqual(ok({ type: "number", location: 0, value: 30 }));
    });

    it("should return error when adding non-numbers", () => {
      const program: List[] = [
        {
          type: "list",
          location: 0,
          elements: [
            { type: "symbol", location: 0, value: "+" },
            { type: "number", location: 0, value: 5 },
            { type: "string", location: 0, value: "hello" },
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
      const symbol: Symbol = { type: "symbol", location: 0, value: "text" };

      environment.symbolTable.set(symbol, {
        type: "string",
        location: 0,
        value: "not a number",
      });

      const expr: List = {
        type: "list",
        location: 0,
        elements: [
          { type: "symbol", location: 0, value: "+" },
          { type: "number", location: 0, value: 5 },
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
          location: 0,
          elements: [
            { type: "symbol", location: 0, value: "+" },
            { type: "number", location: 0, value: 5 },
            { type: "symbol", location: 0, value: "undefined_var" },
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

  describe("list evaluation", () => {
    it("should return error for empty list", () => {
      const program: List[] = [
        {
          type: "list",
          location: 0,
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
          location: 0,
          elements: [
            { type: "symbol", location: 0, value: "unknown_function" },
            { type: "number", location: 0, value: 1 },
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
          location: 0,
          elements: [
            { type: "symbol", location: 0, value: "-" },
            { type: "number", location: 0, value: 5 },
            { type: "number", location: 0, value: 3 },
          ],
        },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("error");
      if (results[0].type === "error") {
        expect(results[0].value.message).toBe(
          "Unimplemented built-in function -",
        );
      }
    });
  });

  describe("program execution", () => {
    it("should execute multiple expressions", () => {
      const program: Expr[] = [
        { type: "number", location: 0, value: 42 },
        {
          type: "list",
          location: 0,
          elements: [
            { type: "symbol", location: 0, value: "+" },
            { type: "number", location: 0, value: 1 },
            { type: "number", location: 0, value: 2 },
          ],
        },
        { type: "string", location: 0, value: "done" },
      ];

      const results = run(program, canvas);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(
        ok({ type: "number", location: 0, value: 42 }),
      );
      expect(results[1]).toEqual(ok({ type: "number", location: 0, value: 3 }));
      expect(results[2]).toEqual(
        ok({ type: "string", location: 0, value: "done" }),
      );
    });
  });
});
