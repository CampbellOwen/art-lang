import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  Environment,
  createEnvironment,
  enterScope,
  exitScope,
} from "../environment.js";
import { MockCanvas } from "../canvas.js";
import { SymbolTable } from "../interpreter.js";
import { Symbol, Expr } from "../types.js";

describe("Environment", () => {
  let mockCanvas: MockCanvas;
  let environment: Environment;

  beforeEach(() => {
    mockCanvas = new MockCanvas(800, 600);
    environment = createEnvironment(mockCanvas);
  });

  describe("createEnvironment", () => {
    it("should create environment with canvas and new symbol table", () => {
      expect(environment.canvas).toBe(mockCanvas);
      expect(environment.symbolTable).toBeInstanceOf(SymbolTable);
    });

    it("should create environment with parent symbol table", () => {
      const parentTable = new SymbolTable();
      const symbol: Symbol = { type: "symbol", location: 0, value: "x" };
      const expr: Expr = { type: "number", location: 0, value: 42 };

      parentTable.set(symbol, expr);

      const childEnv = createEnvironment(mockCanvas, parentTable);

      // Should be able to access parent symbols
      expect(childEnv.symbolTable.lookup(symbol)).toEqual(expr);
    });
  });

  describe("symbol table operations", () => {
    it("should set and lookup symbols", () => {
      const { symbolTable } = environment;
      const symbol: Symbol = { type: "symbol", location: 0, value: "testVar" };
      const expr: Expr = { type: "string", location: 0, value: "hello" };

      symbolTable.set(symbol, expr);
      const result = symbolTable.lookup(symbol);

      expect(result).toEqual(expr);
    });

    it("should return undefined for unknown symbols", () => {
      const { symbolTable } = environment;
      const symbol: Symbol = { type: "symbol", location: 0, value: "unknown" };

      const result = symbolTable.lookup(symbol);

      expect(result).toBeUndefined();
    });

    it("should check local symbols", () => {
      const { symbolTable } = environment;
      const symbol: Symbol = { type: "symbol", location: 0, value: "local" };
      const expr: Expr = { type: "number", location: 0, value: 123 };

      symbolTable.set(symbol, expr);

      expect(symbolTable.hasLocal(symbol)).toBe(true);

      const unknownSymbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "notLocal",
      };
      expect(symbolTable.hasLocal(unknownSymbol)).toBe(false);
    });

    it("should get local symbol names", () => {
      const { symbolTable } = environment;
      const symbol1: Symbol = { type: "symbol", location: 0, value: "var1" };
      const symbol2: Symbol = { type: "symbol", location: 0, value: "var2" };
      const expr: Expr = { type: "number", location: 0, value: 1 };

      symbolTable.set(symbol1, expr);
      symbolTable.set(symbol2, expr);

      const localSymbols = symbolTable.getLocalSymbols();

      expect(localSymbols).toContain("var1");
      expect(localSymbols).toContain("var2");
      expect(localSymbols).toHaveLength(2);
    });
  });

  describe("scope management", () => {
    it("should enter new scope", () => {
      const childEnv = enterScope(environment);

      expect(childEnv.canvas).toBe(mockCanvas); // Same canvas
      expect(childEnv.symbolTable).not.toBe(environment.symbolTable); // Different symbol table
    });

    it("should access parent scope variables from child scope", () => {
      const { symbolTable } = environment;
      const symbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "parentVar",
      };
      const expr: Expr = { type: "string", location: 0, value: "parent" };

      symbolTable.set(symbol, expr);

      const childEnv = enterScope(environment);

      expect(childEnv.symbolTable.lookup(symbol)).toEqual(expr);
    });

    it("should shadow parent variables in child scope", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "shadowed" };
      const parentExpr: Expr = { type: "number", location: 0, value: 1 };
      const childExpr: Expr = { type: "number", location: 0, value: 2 };

      environment.symbolTable.set(symbol, parentExpr);

      const childEnv = enterScope(environment);
      childEnv.symbolTable.set(symbol, childExpr);

      expect(environment.symbolTable.lookup(symbol)).toEqual(parentExpr);
      expect(childEnv.symbolTable.lookup(symbol)).toEqual(childExpr);
    });

    it("should exit scope and return to parent", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "test" };
      const parentExpr: Expr = { type: "string", location: 0, value: "parent" };
      const childExpr: Expr = { type: "string", location: 0, value: "child" };

      environment.symbolTable.set(symbol, parentExpr);

      const childEnv = enterScope(environment);
      childEnv.symbolTable.set(symbol, childExpr);

      const returnedEnv = exitScope(childEnv);

      expect(returnedEnv).not.toBeNull();
      expect(returnedEnv!.symbolTable.lookup(symbol)).toEqual(parentExpr);
    });

    it("should return null when exiting root scope", () => {
      const result = exitScope(environment);

      expect(result).toBeNull();
    });

    it("should handle nested scopes", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "nested" };
      const rootExpr: Expr = { type: "number", location: 0, value: 1 };
      const level1Expr: Expr = { type: "number", location: 0, value: 2 };
      const level2Expr: Expr = { type: "number", location: 0, value: 3 };

      // Root level
      environment.symbolTable.set(symbol, rootExpr);

      // Level 1
      const level1Env = enterScope(environment);
      level1Env.symbolTable.set(symbol, level1Expr);

      // Level 2
      const level2Env = enterScope(level1Env);
      level2Env.symbolTable.set(symbol, level2Expr);

      // Check lookups at each level
      expect(environment.symbolTable.lookup(symbol)).toEqual(rootExpr);
      expect(level1Env.symbolTable.lookup(symbol)).toEqual(level1Expr);
      expect(level2Env.symbolTable.lookup(symbol)).toEqual(level2Expr);

      // Exit scopes
      const backToLevel1 = exitScope(level2Env);
      expect(backToLevel1!.symbolTable.lookup(symbol)).toEqual(level1Expr);

      const backToRoot = exitScope(backToLevel1!);
      expect(backToRoot!.symbolTable.lookup(symbol)).toEqual(rootExpr);

      const shouldBeNull = exitScope(backToRoot!);
      expect(shouldBeNull).toBeNull();
    });
  });

  describe("canvas operations", () => {
    it("should provide access to canvas", () => {
      const { canvas } = environment;
      expect(canvas).toBe(mockCanvas);
    });

    it("should allow canvas operations", () => {
      const { canvas } = environment;
      const color = { r: 255, g: 255, b: 255 };

      canvas.clear(color);

      const operations = mockCanvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "clear",
        args: [color],
      });
    });

    it("should get canvas dimensions", () => {
      const { canvas } = environment;

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it("should preserve canvas reference across scopes", () => {
      const childEnv = enterScope(environment);
      const grandchildEnv = enterScope(childEnv);

      expect(childEnv.canvas).toBe(mockCanvas);
      expect(grandchildEnv.canvas).toBe(mockCanvas);

      // Operations should affect the same canvas
      environment.canvas.clear();
      childEnv.canvas.drawLine(
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { r: 255, g: 0, b: 0 },
      );
      grandchildEnv.canvas.drawCircle({ x: 5, y: 5 }, 3, {
        r: 0,
        g: 255,
        b: 0,
      });

      const operations = mockCanvas.getOperations();
      expect(operations).toHaveLength(3);
      expect(operations[0].type).toBe("clear");
      expect(operations[1].type).toBe("drawLine");
      expect(operations[2].type).toBe("drawCircle");
    });
  });

  describe("destructuring usage patterns", () => {
    it("should allow easy destructuring of environment", () => {
      const { symbolTable, canvas } = environment;

      expect(symbolTable).toBeInstanceOf(SymbolTable);
      expect(canvas).toBe(mockCanvas);
    });

    it("should work with destructured components", () => {
      const { symbolTable, canvas } = environment;

      const symbol: Symbol = { type: "symbol", location: 0, value: "test" };
      const expr: Expr = { type: "number", location: 0, value: 42 };

      symbolTable.set(symbol, expr);
      canvas.drawLine({ x: 0, y: 0 }, { x: 10, y: 10 }, { r: 255, g: 0, b: 0 });

      expect(symbolTable.lookup(symbol)).toEqual(expr);
      expect(canvas.getOperations()).toHaveLength(1);
    });

    it("should allow independent use of components", () => {
      const env1 = createEnvironment(mockCanvas);
      const env2 = enterScope(env1);

      const { symbolTable: table1 } = env1;
      const { symbolTable: table2, canvas } = env2;

      const symbol: Symbol = { type: "symbol", location: 0, value: "shared" };
      const expr1: Expr = { type: "string", location: 0, value: "env1" };
      const expr2: Expr = { type: "string", location: 0, value: "env2" };

      table1.set(symbol, expr1);
      table2.set(symbol, expr2);

      expect(table1.lookup(symbol)).toEqual(expr1);
      expect(table2.lookup(symbol)).toEqual(expr2);
      expect(canvas).toBe(mockCanvas);
    });
  });

  describe("integration with different canvas instances", () => {
    it("should work with different canvas sizes", () => {
      const smallCanvas = new MockCanvas(400, 300);
      const { canvas } = createEnvironment(smallCanvas);

      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(300);
    });

    it("should isolate operations between different environments", () => {
      const canvas1 = new MockCanvas();
      const canvas2 = new MockCanvas();
      const env1 = createEnvironment(canvas1);
      const env2 = createEnvironment(canvas2);

      env1.canvas.clear();
      env2.canvas.drawLine(
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { r: 255, g: 0, b: 0 },
      );

      expect(canvas1.getOperations()).toHaveLength(1);
      expect(canvas1.getOperations()[0].type).toBe("clear");

      expect(canvas2.getOperations()).toHaveLength(1);
      expect(canvas2.getOperations()[0].type).toBe("drawLine");
    });
  });

  describe("type safety", () => {
    it("should work with all expression types", () => {
      const { symbolTable } = environment;

      const numberSymbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "num",
      };
      const stringSymbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "str",
      };
      const listSymbol: Symbol = { type: "symbol", location: 0, value: "list" };

      const numberExpr: Expr = { type: "number", location: 0, value: 42 };
      const stringExpr: Expr = { type: "string", location: 0, value: "hello" };
      const listExpr: Expr = {
        type: "list",
        location: 0,
        elements: [numberExpr, stringExpr],
      };

      symbolTable.set(numberSymbol, numberExpr);
      symbolTable.set(stringSymbol, stringExpr);
      symbolTable.set(listSymbol, listExpr);

      expect(symbolTable.lookup(numberSymbol)).toEqual(numberExpr);
      expect(symbolTable.lookup(stringSymbol)).toEqual(stringExpr);
      expect(symbolTable.lookup(listSymbol)).toEqual(listExpr);
    });
  });
});
