import { Bool, Expr, Symbol } from "./types";

export type LocatedError = {
  message: string;
  location?: number;
  length?: number;
};

export type Ok<T> = { type: "ok"; value: T };
export type Err<E> = { type: "error"; value: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.type === "ok";
}
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.type === "error";
}

export function error<E>(e: E): Err<E> {
  return { type: "error", value: e };
}

export function locatedError(
  message: string,
  location?: number,
  length?: number,
): Err<LocatedError> {
  return { type: "error", value: { message, location, length } };
}

export function ok<T>(value: T): Ok<T> {
  return { type: "ok", value };
}

export class PeekableIterator<T> {
  private items: T[];
  private position = 0;

  constructor(items: T[]) {
    this.items = items;
  }

  peek(offset = 0): T | undefined {
    if (this.position + offset >= this.items.length) {
      return undefined;
    }
    return this.items[this.position + offset];
  }

  next(): T | undefined {
    if (this.position >= this.items.length) {
      return undefined;
    }
    return this.items[this.position++];
  }

  skipWhile(pred: (item: T) => boolean) {
    while (
      pred(this.items[this.position]) &&
      this.position <= this.items.length
    ) {
      this.position++;
    }
  }

  hasNext(): boolean {
    return this.position < this.items.length;
  }

  pos(): number {
    return this.position;
  }
}

export function isSymbol(expr: Expr): expr is Symbol {
  return expr.type === "symbol";
}

export function isBool(expr: Expr): expr is Bool {
  return expr.type === "boolean";
}

export function debugPrint(expr: Expr): string {
  switch (expr.type) {
    case "string":
      return `"${expr.value}"`;
    case "number":
    case "symbol":
    case "boolean":
      return `${expr.value}`;
    case "list": {
      const subExprs = expr.elements.map(debugPrint);
      return `(${subExprs.join(" ")})`;
    }
  }
}
