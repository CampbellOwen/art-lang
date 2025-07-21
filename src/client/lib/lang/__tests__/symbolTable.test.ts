import { describe, it, expect, beforeEach } from "@jest/globals";
import { SymbolTable } from "../environment.js";
import { Symbol, Expr } from "../types.js";

describe("SymbolTable", () => {
  let symbolTable: SymbolTable;

  beforeEach(() => {
    symbolTable = new SymbolTable();
  });

  describe("constructor", () => {
    it("should create symbol table with no parent", () => {
      const table = new SymbolTable();
      expect(table.exitScope()).toBeNull();
    });

    it("should create symbol table with parent", () => {
      const parent = new SymbolTable();
      const child = new SymbolTable(parent);

      expect(child.exitScope()).toBe(parent);
    });
  });

  describe("basic operations", () => {
    it("should set and lookup symbols", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "testVar" };
      const expr: Expr = { type: "string", location: 0, value: "hello" };

      symbolTable.set(symbol, expr);
      const result = symbolTable.lookup(symbol);

      expect(result).toEqual(expr);
    });

    it("should return undefined for unknown symbols", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "unknown" };
      const result = symbolTable.lookup(symbol);

      expect(result).toBeUndefined();
    });

    it("should check local symbols", () => {
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
      const childTable = symbolTable.enterScope();

      expect(childTable).toBeInstanceOf(SymbolTable);
      expect(childTable).not.toBe(symbolTable);
      expect(childTable.exitScope()).toBe(symbolTable);
    });

    it("should access parent scope variables from child scope", () => {
      const symbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "parentVar",
      };
      const expr: Expr = { type: "string", location: 0, value: "parent" };

      symbolTable.set(symbol, expr);

      const childTable = symbolTable.enterScope();

      expect(childTable.lookup(symbol)).toEqual(expr);
    });

    it("should shadow parent variables in child scope", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "shadowed" };
      const parentExpr: Expr = { type: "number", location: 0, value: 1 };
      const childExpr: Expr = { type: "number", location: 0, value: 2 };

      symbolTable.set(symbol, parentExpr);

      const childTable = symbolTable.enterScope();
      childTable.set(symbol, childExpr);

      expect(symbolTable.lookup(symbol)).toEqual(parentExpr);
      expect(childTable.lookup(symbol)).toEqual(childExpr);
    });

    it("should exit scope and return to parent", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "test" };
      const parentExpr: Expr = { type: "string", location: 0, value: "parent" };
      const childExpr: Expr = { type: "string", location: 0, value: "child" };

      symbolTable.set(symbol, parentExpr);

      const childTable = symbolTable.enterScope();
      childTable.set(symbol, childExpr);

      const returnedTable = childTable.exitScope();

      expect(returnedTable).toBe(symbolTable);
      expect(returnedTable!.lookup(symbol)).toEqual(parentExpr);
    });

    it("should return null when exiting root scope", () => {
      const result = symbolTable.exitScope();

      expect(result).toBeNull();
    });

    it("should handle nested scopes", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "nested" };
      const rootExpr: Expr = { type: "number", location: 0, value: 1 };
      const level1Expr: Expr = { type: "number", location: 0, value: 2 };
      const level2Expr: Expr = { type: "number", location: 0, value: 3 };

      // Root level
      symbolTable.set(symbol, rootExpr);

      // Level 1
      const level1Table = symbolTable.enterScope();
      level1Table.set(symbol, level1Expr);

      // Level 2
      const level2Table = level1Table.enterScope();
      level2Table.set(symbol, level2Expr);

      // Check lookups at each level
      expect(symbolTable.lookup(symbol)).toEqual(rootExpr);
      expect(level1Table.lookup(symbol)).toEqual(level1Expr);
      expect(level2Table.lookup(symbol)).toEqual(level2Expr);

      // Exit scopes
      const backToLevel1 = level2Table.exitScope();
      expect(backToLevel1!.lookup(symbol)).toEqual(level1Expr);

      const backToRoot = backToLevel1!.exitScope();
      expect(backToRoot!.lookup(symbol)).toEqual(rootExpr);

      const shouldBeNull = backToRoot!.exitScope();
      expect(shouldBeNull).toBeNull();
    });
  });

  describe("local vs parent scope operations", () => {
    it("should distinguish between local and parent symbols", () => {
      const localSymbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "local",
      };
      const parentSymbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "parent",
      };
      const expr: Expr = { type: "number", location: 0, value: 42 };

      // Set in parent
      symbolTable.set(parentSymbol, expr);

      // Create child and set local
      const childTable = symbolTable.enterScope();
      childTable.set(localSymbol, expr);

      // Check hasLocal
      expect(childTable.hasLocal(localSymbol)).toBe(true);
      expect(childTable.hasLocal(parentSymbol)).toBe(false);

      // Both should be accessible via lookup
      expect(childTable.lookup(localSymbol)).toEqual(expr);
      expect(childTable.lookup(parentSymbol)).toEqual(expr);
    });

    it("should only return local symbols in getLocalSymbols", () => {
      const parentSymbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "parent",
      };
      const childSymbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "child",
      };
      const expr: Expr = { type: "string", location: 0, value: "test" };

      symbolTable.set(parentSymbol, expr);

      const childTable = symbolTable.enterScope();
      childTable.set(childSymbol, expr);

      const parentLocals = symbolTable.getLocalSymbols();
      const childLocals = childTable.getLocalSymbols();

      expect(parentLocals).toEqual(["parent"]);
      expect(childLocals).toEqual(["child"]);
    });

    it("should handle shadowing with hasLocal", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "shadowed" };
      const parentExpr: Expr = { type: "number", location: 0, value: 1 };
      const childExpr: Expr = { type: "number", location: 0, value: 2 };

      symbolTable.set(symbol, parentExpr);

      const childTable = symbolTable.enterScope();

      // Before shadowing
      expect(childTable.hasLocal(symbol)).toBe(false);
      expect(childTable.lookup(symbol)).toEqual(parentExpr);

      // After shadowing
      childTable.set(symbol, childExpr);
      expect(childTable.hasLocal(symbol)).toBe(true);
      expect(childTable.lookup(symbol)).toEqual(childExpr);
    });
  });

  describe("type safety", () => {
    it("should work with all expression types", () => {
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

    it("should handle symbol lookup across multiple levels", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "deep" };
      const expr: Expr = { type: "string", location: 0, value: "found" };

      // Set at root
      symbolTable.set(symbol, expr);

      // Go deep
      let currentTable = symbolTable;
      for (let i = 0; i < 5; i++) {
        currentTable = currentTable.enterScope();
      }

      // Should still find the symbol
      expect(currentTable.lookup(symbol)).toEqual(expr);
    });
  });

  describe("edge cases", () => {
    it("should handle empty symbol names", () => {
      const emptySymbol: Symbol = { type: "symbol", location: 0, value: "" };
      const expr: Expr = { type: "number", location: 0, value: 0 };

      symbolTable.set(emptySymbol, expr);
      expect(symbolTable.lookup(emptySymbol)).toEqual(expr);
    });

    it("should handle symbols with special characters", () => {
      const specialSymbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "$special-var!",
      };
      const expr: Expr = { type: "string", location: 0, value: "special" };

      symbolTable.set(specialSymbol, expr);
      expect(symbolTable.lookup(specialSymbol)).toEqual(expr);
    });

    it("should handle overwriting symbols", () => {
      const symbol: Symbol = { type: "symbol", location: 0, value: "mutable" };
      const expr1: Expr = { type: "number", location: 0, value: 1 };
      const expr2: Expr = { type: "number", location: 0, value: 2 };

      symbolTable.set(symbol, expr1);
      expect(symbolTable.lookup(symbol)).toEqual(expr1);

      symbolTable.set(symbol, expr2);
      expect(symbolTable.lookup(symbol)).toEqual(expr2);
    });
  });

  describe("complex scoping scenarios", () => {
    it("should handle multiple variables across scopes", () => {
      const x: Symbol = { type: "symbol", location: 0, value: "x" };
      const y: Symbol = { type: "symbol", location: 0, value: "y" };
      const z: Symbol = { type: "symbol", location: 0, value: "z" };

      const expr1: Expr = { type: "number", location: 0, value: 1 };
      const expr2: Expr = { type: "number", location: 0, value: 2 };
      const expr3: Expr = { type: "number", location: 0, value: 3 };

      // Root scope
      symbolTable.set(x, expr1);

      // Child scope
      const child = symbolTable.enterScope();
      child.set(y, expr2);

      // Grandchild scope
      const grandchild = child.enterScope();
      grandchild.set(z, expr3);

      // All should be accessible from grandchild
      expect(grandchild.lookup(x)).toEqual(expr1);
      expect(grandchild.lookup(y)).toEqual(expr2);
      expect(grandchild.lookup(z)).toEqual(expr3);

      // Only local symbols should be in local lists
      expect(symbolTable.getLocalSymbols()).toEqual(["x"]);
      expect(child.getLocalSymbols()).toEqual(["y"]);
      expect(grandchild.getLocalSymbols()).toEqual(["z"]);
    });

    it("should handle variable shadowing at multiple levels", () => {
      const symbol: Symbol = {
        type: "symbol",
        location: 0,
        value: "multilevel",
      };
      const rootExpr: Expr = { type: "string", location: 0, value: "root" };
      const childExpr: Expr = { type: "string", location: 0, value: "child" };
      const grandchildExpr: Expr = {
        type: "string",
        location: 0,
        value: "grandchild",
      };

      // Set at each level
      symbolTable.set(symbol, rootExpr);
      const child = symbolTable.enterScope();
      child.set(symbol, childExpr);
      const grandchild = child.enterScope();
      grandchild.set(symbol, grandchildExpr);

      // Each should see their own version
      expect(symbolTable.lookup(symbol)).toEqual(rootExpr);
      expect(child.lookup(symbol)).toEqual(childExpr);
      expect(grandchild.lookup(symbol)).toEqual(grandchildExpr);

      // Exit and verify restoration
      const backToChild = grandchild.exitScope();
      expect(backToChild!.lookup(symbol)).toEqual(childExpr);

      const backToRoot = backToChild!.exitScope();
      expect(backToRoot!.lookup(symbol)).toEqual(rootExpr);
    });
  });
});
