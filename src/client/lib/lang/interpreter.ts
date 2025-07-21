import { Canvas, MockCanvas } from "./canvas";
import { BUILTIN_SYMBOLS } from "./consts";
import { error, isOk, isSymbol, ok, Result } from "./core";
import { Environment, SymbolTable } from "./environment";
import { Expr, List, Num, Program, Symbol } from "./types";

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
    case "number":
    case "string":
      return ok(expr);
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
  return error(new Error(`Symbol ${symbol.value} undefined`));
}

function evaluate_builtin(
  environment: Environment,
  builtinName: string,
  args: Expr[],
): Result<Expr | undefined, Error> {
  switch (builtinName) {
    case "+":
      return evaluate_add(environment, args);
    default:
      return error(new Error(`Unimplemented built-in function ${builtinName}`));
  }
}

function evaluate_add(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length === 0) {
    const result: Num = { type: "number", location: 0, value: 0 };
    return ok(result);
  }

  let sum = 0;
  for (const arg of args) {
    const evaluatedResult = evaluate(environment, arg);
    if (!isOk(evaluatedResult)) {
      return evaluatedResult;
    }

    const evaluated = evaluatedResult.value;
    if (!evaluated || evaluated.type !== "number") {
      return error(
        new Error(
          `Addition requires numbers, got ${evaluated?.type || "undefined"}`,
        ),
      );
    }

    sum += evaluated.value;
  }

  const result: Num = { type: "number", location: 0, value: sum };
  return ok(result);
}
