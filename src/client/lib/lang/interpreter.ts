import { Expr, Symbol } from "./types";

export class SymbolTable {
  private symbolTable: Map<string, Expr>;
  private parent: SymbolTable | null;

  constructor(parent: SymbolTable | null = null) {
    this.symbolTable = new Map();
    this.parent = parent;
  }

  lookup(sym: Symbol): Expr | undefined {
    // First check the current scope
    const value = this.symbolTable.get(sym.value);
    if (value !== undefined) {
      return value;
    }

    // If not found, check parent scopes recursively
    if (this.parent) {
      return this.parent.lookup(sym);
    }

    return undefined;
  }

  set(sym: Symbol, expr: Expr) {
    this.symbolTable.set(sym.value, expr);
  }

  // Enter a new scope by creating a child symbol table
  enterScope(): SymbolTable {
    return new SymbolTable(this);
  }

  // Exit the current scope and return the parent
  exitScope(): SymbolTable | null {
    return this.parent;
  }

  // Check if a symbol exists in the current scope only (not parent scopes)
  hasLocal(sym: Symbol): boolean {
    return this.symbolTable.has(sym.value);
  }

  // Get all symbols in the current scope
  getLocalSymbols(): string[] {
    return Array.from(this.symbolTable.keys());
  }
}
