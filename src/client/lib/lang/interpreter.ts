import { Expr, Symbol } from "./types";

export class Environment {
  private symbolTable: Map<string, Expr>;

  constructor() {
    this.symbolTable = new Map();
  }

  lookup(sym: Symbol): Expr | undefined {
    return this.symbolTable.get(sym.value);
  }

  set(sym: Symbol, expr: Expr) {
    this.symbolTable.set(sym.value, expr);
  }
}
