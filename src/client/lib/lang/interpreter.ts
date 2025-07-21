import { Canvas, MockCanvas } from "./canvas";
import { BUILTIN_SYMBOLS } from "./consts";
import { error, isOk, isSymbol, ok, Result } from "./core";
import { Environment, SymbolTable } from "./environment";
import { Bool, Expr, List, Num, Program, Str, Symbol } from "./types";

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
    case "boolean":
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
  // Handle built-in boolean literals
  if (symbol.value === "true") {
    const result: Bool = { type: "boolean", value: true };
    return ok(result);
  }

  if (symbol.value === "false") {
    const result: Bool = { type: "boolean", value: false };
    return ok(result);
  }

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
    case "-":
      return evaluate_subtract(environment, args);
    case "*":
      return evaluate_multiply(environment, args);
    case "/":
      return evaluate_divide(environment, args);
    case ">":
      return evaluate_greater_than(environment, args);
    case ">=":
      return evaluate_greater_equal(environment, args);
    case "<":
      return evaluate_less_than(environment, args);
    case "<=":
      return evaluate_less_equal(environment, args);
    case "=":
      return evaluate_equal(environment, args);
    default:
      return error(new Error(`Unimplemented built-in function ${builtinName}`));
  }
}

function evaluate_add(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length === 0) {
    const result: Num = { type: "number", value: 0 };
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

  const result: Num = { type: "number", value: sum };
  return ok(result);
}

function evaluate_subtract(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length === 0) {
    const result: Num = { type: "number", value: 0 };
    return ok(result);
  }

  if (args.length === 1) {
    // Unary minus: negate the single argument
    const evaluatedResult = evaluate(environment, args[0]);
    if (!isOk(evaluatedResult)) {
      return evaluatedResult;
    }

    const evaluated = evaluatedResult.value;
    if (!evaluated || evaluated.type !== "number") {
      return error(
        new Error(
          `Subtraction requires numbers, got ${evaluated?.type || "undefined"}`,
        ),
      );
    }

    const result: Num = {
      type: "number",
      value: -evaluated.value,
    };
    return ok(result);
  }

  // Binary subtraction: first - second - third - ...
  let result = 0;
  for (let i = 0; i < args.length; i++) {
    const evaluatedResult = evaluate(environment, args[i]);
    if (!isOk(evaluatedResult)) {
      return evaluatedResult;
    }

    const evaluated = evaluatedResult.value;
    if (!evaluated || evaluated.type !== "number") {
      return error(
        new Error(
          `Subtraction requires numbers, got ${evaluated?.type || "undefined"}`,
        ),
      );
    }

    if (i === 0) {
      result = evaluated.value;
    } else {
      result -= evaluated.value;
    }
  }

  const resultNum: Num = { type: "number", value: result };
  return ok(resultNum);
}

function evaluate_multiply(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length === 0) {
    const result: Num = { type: "number", value: 1 };
    return ok(result);
  }

  let product = 1;
  for (const arg of args) {
    const evaluatedResult = evaluate(environment, arg);
    if (!isOk(evaluatedResult)) {
      return evaluatedResult;
    }

    const evaluated = evaluatedResult.value;
    if (!evaluated || evaluated.type !== "number") {
      return error(
        new Error(
          `Multiplication requires numbers, got ${evaluated?.type || "undefined"}`,
        ),
      );
    }

    product *= evaluated.value;
  }

  const result: Num = { type: "number", value: product };
  return ok(result);
}

function evaluate_divide(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length === 0) {
    return error(new Error("Division requires at least one argument"));
  }

  if (args.length === 1) {
    // Reciprocal: 1 / arg
    const evaluatedResult = evaluate(environment, args[0]);
    if (!isOk(evaluatedResult)) {
      return evaluatedResult;
    }

    const evaluated = evaluatedResult.value;
    if (!evaluated || evaluated.type !== "number") {
      return error(
        new Error(
          `Division requires numbers, got ${evaluated?.type || "undefined"}`,
        ),
      );
    }

    if (evaluated.value === 0) {
      return error(new Error("Division by zero"));
    }

    const result: Num = {
      type: "number",
      value: 1 / evaluated.value,
    };
    return ok(result);
  }

  // Binary division: first / second / third / ...
  let result = 0;
  for (let i = 0; i < args.length; i++) {
    const evaluatedResult = evaluate(environment, args[i]);
    if (!isOk(evaluatedResult)) {
      return evaluatedResult;
    }

    const evaluated = evaluatedResult.value;
    if (!evaluated || evaluated.type !== "number") {
      return error(
        new Error(
          `Division requires numbers, got ${evaluated?.type || "undefined"}`,
        ),
      );
    }

    if (i === 0) {
      result = evaluated.value;
    } else {
      if (evaluated.value === 0) {
        return error(new Error("Division by zero"));
      }
      result /= evaluated.value;
    }
  }

  const resultNum: Num = { type: "number", value: result };
  return ok(resultNum);
}

function evaluate_greater_than(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length < 2) {
    return error(new Error("Greater than (>) requires at least 2 arguments"));
  }

  for (let i = 0; i < args.length - 1; i++) {
    const leftResult = evaluate(environment, args[i]);
    if (!isOk(leftResult)) {
      return leftResult;
    }

    const rightResult = evaluate(environment, args[i + 1]);
    if (!isOk(rightResult)) {
      return rightResult;
    }

    const left = leftResult.value;
    const right = rightResult.value;

    if (!left || !right || left.type !== "number" || right.type !== "number") {
      return error(
        new Error(
          `Comparison requires numbers, got ${left?.type || "undefined"} and ${right?.type || "undefined"}`,
        ),
      );
    }

    if (!(left.value > right.value)) {
      const result: Bool = { type: "boolean", value: false };
      return ok(result);
    }
  }

  const result: Bool = { type: "boolean", value: true };
  return ok(result);
}

function evaluate_greater_equal(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length < 2) {
    return error(
      new Error("Greater than or equal (>=) requires at least 2 arguments"),
    );
  }

  for (let i = 0; i < args.length - 1; i++) {
    const leftResult = evaluate(environment, args[i]);
    if (!isOk(leftResult)) {
      return leftResult;
    }

    const rightResult = evaluate(environment, args[i + 1]);
    if (!isOk(rightResult)) {
      return rightResult;
    }

    const left = leftResult.value;
    const right = rightResult.value;

    if (!left || !right || left.type !== "number" || right.type !== "number") {
      return error(
        new Error(
          `Comparison requires numbers, got ${left?.type || "undefined"} and ${right?.type || "undefined"}`,
        ),
      );
    }

    if (!(left.value >= right.value)) {
      const result: Bool = { type: "boolean", value: false };
      return ok(result);
    }
  }

  const result: Bool = { type: "boolean", value: true };
  return ok(result);
}

function evaluate_less_than(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length < 2) {
    return error(new Error("Less than (<) requires at least 2 arguments"));
  }

  for (let i = 0; i < args.length - 1; i++) {
    const leftResult = evaluate(environment, args[i]);
    if (!isOk(leftResult)) {
      return leftResult;
    }

    const rightResult = evaluate(environment, args[i + 1]);
    if (!isOk(rightResult)) {
      return rightResult;
    }

    const left = leftResult.value;
    const right = rightResult.value;

    if (!left || !right || left.type !== "number" || right.type !== "number") {
      return error(
        new Error(
          `Comparison requires numbers, got ${left?.type || "undefined"} and ${right?.type || "undefined"}`,
        ),
      );
    }

    if (!(left.value < right.value)) {
      const result: Bool = { type: "boolean", value: false };
      return ok(result);
    }
  }

  const result: Bool = { type: "boolean", value: true };
  return ok(result);
}

function evaluate_less_equal(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length < 2) {
    return error(
      new Error("Less than or equal (<=) requires at least 2 arguments"),
    );
  }

  for (let i = 0; i < args.length - 1; i++) {
    const leftResult = evaluate(environment, args[i]);
    if (!isOk(leftResult)) {
      return leftResult;
    }

    const rightResult = evaluate(environment, args[i + 1]);
    if (!isOk(rightResult)) {
      return rightResult;
    }

    const left = leftResult.value;
    const right = rightResult.value;

    if (!left || !right || left.type !== "number" || right.type !== "number") {
      return error(
        new Error(
          `Comparison requires numbers, got ${left?.type || "undefined"} and ${right?.type || "undefined"}`,
        ),
      );
    }

    if (!(left.value <= right.value)) {
      const result: Bool = { type: "boolean", value: false };
      return ok(result);
    }
  }

  const result: Bool = { type: "boolean", value: true };
  return ok(result);
}

function evaluate_equal(
  environment: Environment,
  args: Expr[],
): Result<Expr, Error> {
  if (args.length < 2) {
    return error(new Error("Equality (=) requires at least 2 arguments"));
  }

  const firstResult = evaluate(environment, args[0]);
  if (!isOk(firstResult)) {
    return firstResult;
  }
  const first = firstResult.value;
  if (!first) {
    return error(new Error("Cannot evaluate first argument for equality"));
  }

  for (let i = 1; i < args.length; i++) {
    const argResult = evaluate(environment, args[i]);
    if (!isOk(argResult)) {
      return argResult;
    }

    const arg = argResult.value;
    if (!arg) {
      return error(new Error(`Cannot evaluate argument ${i} for equality`));
    }

    // Check if types are different
    if (first.type !== arg.type) {
      const result: Bool = { type: "boolean", value: false };
      return ok(result);
    }

    // Compare values based on type
    let isEqual = false;
    switch (first.type) {
      case "number":
        isEqual = first.value === (arg as Num).value;
        break;
      case "string":
        isEqual = first.value === (arg as Str).value;
        break;
      case "boolean":
        isEqual = first.value === (arg as Bool).value;
        break;
      default:
        return error(
          new Error(`Equality comparison not supported for type ${first.type}`),
        );
    }

    if (!isEqual) {
      const result: Bool = { type: "boolean", value: false };
      return ok(result);
    }
  }

  const result: Bool = { type: "boolean", value: true };
  return ok(result);
}
