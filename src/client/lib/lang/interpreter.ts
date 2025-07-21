import { Canvas, MockCanvas } from "./canvas";
import { BUILTIN_SYMBOLS } from "./consts";
import { error, isSymbol, ok, Result } from "./core";
import { Environment, SymbolTable } from "./environment";
import { Expr, List, Program, Symbol } from "./types";

export function run(program: Program, canvas: Canvas = new MockCanvas()) {
  const environment = { symbolTable: new SymbolTable(), canvas };

  return program.map((expr) => evaluate(environment, expr));
}

export function evaluate(
  environment: Environment,
  expr: Expr,
): Result<Expr | undefined, Error> {
  switch (expr.type) {
    case "list":
      return evaluate_list(environment, expr);
    case "symbol":
      return evaluate_symbol(environment, expr);
    default:
      return error(new Error(`Unimplemented expr ${expr}`));
  }
}

function evaluate_list(
  environment: Environment,
  list: List,
): Result<Expr | undefined, Error> {
  if (list.elements.length === 0) {
    return error(new Error("Cannot evaluate empty list"));
  }

  const first = list.elements[0];
  if (isSymbol(first) && BUILTIN_SYMBOLS.includes(first.value)) {
    const [_, ...args] = list.elements;
    return evaluate_builtin(environment, first.value, args);
  }

  return error(new Error(`Cannot evaluate list ${list}`));
}

function evaluate_symbol(
  environment: Environment,
  symbol: Symbol,
): Result<Expr, Error> {
  const { symbolTable } = environment;

  const val = symbolTable.lookup(symbol);
  if (val !== undefined) {
    return ok(val);
  }
  return error(new Error(`Symbol ${symbol} undefined`));
}

function evaluate_builtin(
  environment: Environment,
  builtinName: string,
  args: Expr[],
): Result<Expr | undefined, Error> {
  return error(
    new Error(
      `Unimplemented built-in function ${builtinName} with args ${args}`,
    ),
  );
}
