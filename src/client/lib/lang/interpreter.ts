import { Canvas, MockCanvas } from "./canvas";
import { BUILTIN_SYMBOLS } from "./consts";
import {
  isOk,
  isSymbol,
  ok,
  locatedError,
  Result,
  LocatedError,
  isErr,
} from "./core";
import { Environment, SymbolTable } from "./environment";
import { Bool, Expr, List, Num, Program, Str, Symbol } from "./types";

export function run(program: Program, canvas: Canvas = new MockCanvas()) {
  const environment = { symbolTable: new SymbolTable(), canvas };

  return program.map((expr) => evaluate(environment, expr));
}

export function evaluate(
  environment: Environment,
  expr: Expr,
): Result<Expr | undefined, LocatedError> {
  switch (expr.type) {
    case "list":
      return evaluate_list(environment, expr);
    case "symbol":
      return evaluate_symbol(environment, expr);
    case "number":
    case "string":
    case "boolean":
      return ok(expr);
  }
}

function evaluate_list(
  environment: Environment,
  list: List,
): Result<Expr | undefined, LocatedError> {
  if (list.elements.length === 0) {
    return locatedError("Cannot evaluate empty list", list.location);
  }

  const first = list.elements[0];
  if (isSymbol(first) && BUILTIN_SYMBOLS.includes(first.value)) {
    const [_, ...args] = list.elements;
    return evaluate_builtin(environment, first.value, args);
  }

  return locatedError(`Cannot evaluate list ${list}`, list.location);
}

function evaluate_symbol(
  environment: Environment,
  symbol: Symbol,
): Result<Expr, LocatedError> {
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
  return locatedError(`Symbol ${symbol.value} undefined`, symbol.location);
}

function evaluate_builtin(
  environment: Environment,
  builtinName: string,
  args: Expr[],
): Result<Expr | undefined, LocatedError> {
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
    case "if":
      return evaluate_if(environment, args);
    case "let":
      return evaluate_let(environment, args);
    case "set":
      return evaluate_set(environment, args);
    default:
      return locatedError(`Unimplemented built-in function ${builtinName}`);
  }
}

function evaluate_add(
  environment: Environment,
  args: Expr[],
): Result<Expr, LocatedError> {
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
      return locatedError(
        `Addition requires numbers, got ${evaluated?.type || "undefined"}`,
        arg.location,
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
): Result<Expr, LocatedError> {
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
      return locatedError(
        `Subtraction requires numbers, got ${evaluated?.type || "undefined"}`,
        args[0].location,
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
      return locatedError(
        `Subtraction requires numbers, got ${evaluated?.type || "undefined"}`,
        args[i].location,
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
): Result<Expr, LocatedError> {
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
      return locatedError(
        `Multiplication requires numbers, got ${evaluated?.type || "undefined"}`,
        arg.location,
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
): Result<Expr, LocatedError> {
  if (args.length === 0) {
    return locatedError("Division requires at least one argument");
  }

  if (args.length === 1) {
    // Reciprocal: 1 / arg
    const evaluatedResult = evaluate(environment, args[0]);
    if (!isOk(evaluatedResult)) {
      return evaluatedResult;
    }

    const evaluated = evaluatedResult.value;
    if (!evaluated || evaluated.type !== "number") {
      return locatedError(
        `Division requires numbers, got ${evaluated?.type || "undefined"}`,
        args[0].location,
      );
    }

    if (evaluated.value === 0) {
      return locatedError("Division by zero", args[0].location);
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
      return locatedError(
        `Division requires numbers, got ${evaluated?.type || "undefined"}`,
        args[i].location,
      );
    }

    if (i === 0) {
      result = evaluated.value;
    } else {
      if (evaluated.value === 0) {
        return locatedError("Division by zero", args[i].location);
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
): Result<Expr, LocatedError> {
  if (args.length < 2) {
    return locatedError("Greater than (>) requires at least 2 arguments");
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
      return locatedError(
        `Comparison requires numbers, got ${left?.type || "undefined"} and ${right?.type || "undefined"}`,
        args[i].location || args[i + 1].location,
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
): Result<Expr, LocatedError> {
  if (args.length < 2) {
    return locatedError(
      "Greater than or equal (>=) requires at least 2 arguments",
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
      return locatedError(
        `Comparison requires numbers, got ${left?.type || "undefined"} and ${right?.type || "undefined"}`,
        args[i].location || args[i + 1].location,
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
): Result<Expr, LocatedError> {
  if (args.length < 2) {
    return locatedError("Less than (<) requires at least 2 arguments");
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
      return locatedError(
        `Comparison requires numbers, got ${left?.type || "undefined"} and ${right?.type || "undefined"}`,
        args[i].location || args[i + 1].location,
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
): Result<Expr, LocatedError> {
  if (args.length < 2) {
    return locatedError(
      "Less than or equal (<=) requires at least 2 arguments",
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
      return locatedError(
        `Comparison requires numbers, got ${left?.type || "undefined"} and ${right?.type || "undefined"}`,
        args[i].location || args[i + 1].location,
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
): Result<Expr, LocatedError> {
  if (args.length < 2) {
    return locatedError("Equality (=) requires at least 2 arguments");
  }

  const firstResult = evaluate(environment, args[0]);
  if (!isOk(firstResult)) {
    return firstResult;
  }
  const first = firstResult.value;
  if (!first) {
    return locatedError(
      "Cannot evaluate first argument for equality",
      args[0].location,
    );
  }

  for (let i = 1; i < args.length; i++) {
    const argResult = evaluate(environment, args[i]);
    if (!isOk(argResult)) {
      return argResult;
    }

    const arg = argResult.value;
    if (!arg) {
      return locatedError(
        `Cannot evaluate argument ${i} for equality`,
        args[i].location,
      );
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
        return locatedError(
          `Equality comparison not supported for type ${first.type}`,
          args[0].location,
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

function evaluate_if(
  environment: Environment,
  args: Expr[],
): Result<Expr, LocatedError> {
  if (args.length !== 3) {
    return locatedError(
      "if requires exactly 3 arguments: (if condition true_expr false_expr)",
    );
  }

  const [conditionExpr, trueExpr, falseExpr] = args;

  // Evaluate the condition
  const conditionResult = evaluate(environment, conditionExpr);
  if (!isOk(conditionResult)) {
    return conditionResult;
  }

  const condition = conditionResult.value;
  if (!condition) {
    return locatedError(
      "Cannot evaluate condition for if statement",
      conditionExpr.location,
    );
  }

  // Determine truthiness of condition
  let isTruthy = false;
  switch (condition.type) {
    case "boolean":
      isTruthy = condition.value;
      break;
    case "number":
      isTruthy = condition.value !== 0;
      break;
    case "string":
      isTruthy = condition.value !== "";
      break;
    default:
      return locatedError(
        `Unsupported condition type for if: ${condition.type}`,
        conditionExpr.location,
      );
  }

  // Evaluate and return the appropriate branch
  if (isTruthy) {
    const result = evaluate(environment, trueExpr);
    if (!isOk(result)) {
      return result;
    }
    if (!result.value) {
      return locatedError(
        "if true branch produced no result",
        trueExpr.location,
      );
    }
    return ok(result.value);
  } else {
    const result = evaluate(environment, falseExpr);
    if (!isOk(result)) {
      return result;
    }
    if (!result.value) {
      return locatedError(
        "if false branch produced no result",
        falseExpr.location,
      );
    }
    return ok(result.value);
  }
}

function evaluate_let(
  environment: Environment,
  args: Expr[],
): Result<Expr | undefined, LocatedError> {
  if (args.length < 2) {
    return locatedError(
      "Not enough arguments to `let` statement",
      args.at(0)?.location,
    );
  }

  const [bindings, ...expressions] = args;
  const symbolTable = environment.symbolTable.enterScope();
  const scopedEnvironment = { symbolTable, canvas: environment.canvas };

  if (bindings.type !== "list") {
    return locatedError(
      "First argument to `let` must be a list",
      bindings.location,
    );
  }

  for (const binding of bindings.elements) {
    if (
      binding.type !== "list" ||
      binding.elements.length !== 2 ||
      binding.elements[0].type !== "symbol"
    ) {
      return locatedError(
        "Bindings must be of form (symbol expr)",
        binding.location,
      );
    }

    const [sym, expr] = binding.elements;
    const evaluated_expr = evaluate(scopedEnvironment, expr);
    if (isErr(evaluated_expr)) {
      return evaluated_expr;
    }

    if (evaluated_expr.value === undefined) {
      return locatedError(
        "Expression did not evaluate to an expression",
        expr.location,
      );
    }

    symbolTable.set(sym, evaluated_expr.value);
  }

  const results = expressions.map((exp) => evaluate(scopedEnvironment, exp));

  return (
    results.at(-1) ?? locatedError("Nothing to evaluate", args.at(0)?.location)
  );
}

function evaluate_set(
  environment: Environment,
  args: Expr[],
): Result<Expr, LocatedError> {
  if (args.length !== 2) {
    return locatedError("set requires 2 arguments", args.at(0)?.location);
  }

  const [first, second] = args;

  const symbol =
    first.type === "symbol" ? ok(first) : evaluate(environment, first);
  if (
    isErr(symbol) ||
    symbol.value === undefined ||
    symbol.value?.type !== "symbol" ||
    environment.symbolTable.lookup(symbol.value) === undefined
  ) {
    return locatedError(
      "The first argument to set must be a symbol in scope",
      first.location,
    );
  }

  const val = evaluate(environment, second);
  if (isErr(val) || val.value === undefined) {
    return locatedError(
      "The second argument to set must be an expression",
      second.location,
    );
  }

  environment.symbolTable.set(symbol.value, val.value);
  return ok(val.value);
}
