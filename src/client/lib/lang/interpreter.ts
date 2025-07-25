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

export function run(
  program: Program,
  canvas: Canvas = new MockCanvas(),
  canvasWidth: number = 800,
  canvasHeight: number = 600,
) {
  const symbolTable = new SymbolTable();

  // Pre-populate width and height variables
  const widthExpr: Num = { type: "number", value: canvasWidth };
  const heightExpr: Num = { type: "number", value: canvasHeight };
  const widthSymbol: Symbol = { type: "symbol", value: "width" };
  const heightSymbol: Symbol = { type: "symbol", value: "height" };

  symbolTable.set(widthSymbol, widthExpr);
  symbolTable.set(heightSymbol, heightExpr);

  const environment = { symbolTable, canvas };

  const results = program.map((expr) => evaluate(environment, expr));
  console.log(canvas);
  return results;
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
    case "while":
      return evaluate_while(environment, args);
    case "rgb":
      return evaluate_rgb(environment, args);
    case "stroke":
      return evaluate_stroke(environment, args);
    case "fill":
      return evaluate_fill(environment, args);
    case "noStroke":
      return evaluate_noStroke(environment, args);
    case "noFill":
      return evaluate_noFill(environment, args);
    case "rect":
      return evaluate_rect(environment, args);
    case "line":
      return evaluate_line(environment, args);
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

function evaluate_while(
  environment: Environment,
  args: Expr[],
): Result<Expr, LocatedError> {
  let counter = 0;
  if (args.length < 1) {
    return locatedError(
      "while requires at least 1 argument: (while condition expr1 expr2 ...)",
    );
  }

  const [conditionExpr, ...bodyExprs] = args;

  // Keep evaluating while condition is truthy
  while (true) {
    if (counter > 1000000) {
      return locatedError(
        "Infinite loop protection, passed 1 million iterations",
        args.at(0)?.location,
      );
    }
    // Evaluate the condition
    const conditionResult = evaluate(environment, conditionExpr);
    if (!isOk(conditionResult)) {
      return conditionResult;
    }

    const condition = conditionResult.value;
    if (!condition) {
      return locatedError(
        "Cannot evaluate condition for while statement",
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
          `Unsupported condition type for while: ${condition.type}`,
          conditionExpr.location,
        );
    }

    // If condition is false, break out of loop
    if (!isTruthy) {
      break;
    }

    // Evaluate all body expressions
    for (const bodyExpr of bodyExprs) {
      const result = evaluate(environment, bodyExpr);
      if (!isOk(result)) {
        return result;
      }
    }

    counter++;
  }

  // Return false when loop is done
  return ok({
    type: "boolean",
    value: false,
    location: conditionExpr.location,
  } as Bool);
}

function evaluate_rgb(
  environment: Environment,
  args: Expr[],
): Result<Expr, LocatedError> {
  if (args.length !== 3) {
    return locatedError("rgb requires exactly 3 arguments: (rgb r g b)");
  }

  const [rExpr, gExpr, bExpr] = args;

  // Evaluate red component
  const rResult = evaluate(environment, rExpr);
  if (!isOk(rResult)) {
    return rResult;
  }
  const r = rResult.value;
  if (!r || r.type !== "number") {
    return locatedError(
      `rgb red component must be a number, got ${r?.type || "undefined"}`,
      rExpr.location,
    );
  }

  // Evaluate green component
  const gResult = evaluate(environment, gExpr);
  if (!isOk(gResult)) {
    return gResult;
  }
  const g = gResult.value;
  if (!g || g.type !== "number") {
    return locatedError(
      `rgb green component must be a number, got ${g?.type || "undefined"}`,
      gExpr.location,
    );
  }

  // Evaluate blue component
  const bResult = evaluate(environment, bExpr);
  if (!isOk(bResult)) {
    return bResult;
  }
  const b = bResult.value;
  if (!b || b.type !== "number") {
    return locatedError(
      `rgb blue component must be a number, got ${b?.type || "undefined"}`,
      bExpr.location,
    );
  }

  // Clamp values to 0-255 range
  const clampedR = Math.max(0, Math.min(255, Math.floor(r.value)));
  const clampedG = Math.max(0, Math.min(255, Math.floor(g.value)));
  const clampedB = Math.max(0, Math.min(255, Math.floor(b.value)));

  // Create RGB color string
  const colorString = `rgb(${clampedR},${clampedG},${clampedB})`;

  const result: Str = {
    type: "string",
    value: colorString,
    location: rExpr.location,
  };

  return ok(result);
}

function evaluate_stroke(
  environment: Environment,
  args: Expr[],
): Result<Expr | undefined, LocatedError> {
  if (args.length !== 1) {
    return locatedError("stroke requires exactly 1 argument: (stroke color)");
  }

  const [colorExpr] = args;

  // Evaluate the color argument
  const colorResult = evaluate(environment, colorExpr);
  if (!isOk(colorResult)) {
    return colorResult;
  }

  const color = colorResult.value;
  if (!color || color.type !== "string") {
    return locatedError(
      `stroke requires a string color, got ${color?.type || "undefined"}`,
      colorExpr.location,
    );
  }

  // Set the strokeStyle on the canvas
  environment.canvas.strokeStyle = color.value;

  // Return undefined (no return value)
  return ok(undefined);
}

function evaluate_fill(
  environment: Environment,
  args: Expr[],
): Result<Expr | undefined, LocatedError> {
  if (args.length !== 1) {
    return locatedError("fill requires exactly 1 argument: (fill color)");
  }

  const [colorExpr] = args;

  // Evaluate the color argument
  const colorResult = evaluate(environment, colorExpr);
  if (!isOk(colorResult)) {
    return colorResult;
  }

  const color = colorResult.value;
  if (!color || color.type !== "string") {
    return locatedError(
      `fill requires a string color, got ${color?.type || "undefined"}`,
      colorExpr.location,
    );
  }

  // Set the fillStyle on the canvas
  environment.canvas.fillStyle = color.value;

  // Return undefined (no return value)
  return ok(undefined);
}

function evaluate_noStroke(
  environment: Environment,
  args: Expr[],
): Result<Expr | undefined, LocatedError> {
  if (args.length !== 0) {
    return locatedError("noStroke requires no arguments: (noStroke)");
  }

  // Set the strokeStyle to "none" to disable stroking
  environment.canvas.strokeStyle = "none";

  // Return undefined (no return value)
  return ok(undefined);
}

function evaluate_noFill(
  environment: Environment,
  args: Expr[],
): Result<Expr | undefined, LocatedError> {
  if (args.length !== 0) {
    return locatedError("noFill requires no arguments: (noFill)");
  }

  // Set the fillStyle to "none" to disable filling
  environment.canvas.fillStyle = "none";

  // Return undefined (no return value)
  return ok(undefined);
}

// NOTE: Drawing functions (rect, circle, etc.) should check for "none" values:
// - If strokeStyle === "none", skip calling canvas.stroke()
// - If fillStyle === "none", skip calling canvas.fill()
// - This allows shapes to be drawn with only fill, only stroke, or both

function evaluate_rect(
  environment: Environment,
  args: Expr[],
): Result<Expr | undefined, LocatedError> {
  if (args.length !== 4) {
    return locatedError(
      "rect requires exactly 4 arguments: (rect x y width height)",
    );
  }

  const [xExpr, yExpr, widthExpr, heightExpr] = args;

  // Evaluate x coordinate
  const xResult = evaluate(environment, xExpr);
  if (!isOk(xResult)) {
    return xResult;
  }
  const x = xResult.value;
  if (!x || x.type !== "number") {
    return locatedError(
      `rect x coordinate must be a number, got ${x?.type || "undefined"}`,
      xExpr.location,
    );
  }

  // Evaluate y coordinate
  const yResult = evaluate(environment, yExpr);
  if (!isOk(yResult)) {
    return yResult;
  }
  const y = yResult.value;
  if (!y || y.type !== "number") {
    return locatedError(
      `rect y coordinate must be a number, got ${y?.type || "undefined"}`,
      yExpr.location,
    );
  }

  // Evaluate width
  const widthResult = evaluate(environment, widthExpr);
  if (!isOk(widthResult)) {
    return widthResult;
  }
  const width = widthResult.value;
  if (!width || width.type !== "number") {
    return locatedError(
      `rect width must be a number, got ${width?.type || "undefined"}`,
      widthExpr.location,
    );
  }

  // Evaluate height
  const heightResult = evaluate(environment, heightExpr);
  if (!isOk(heightResult)) {
    return heightResult;
  }
  const height = heightResult.value;
  if (!height || height.type !== "number") {
    return locatedError(
      `rect height must be a number, got ${height?.type || "undefined"}`,
      heightExpr.location,
    );
  }

  // Draw the rectangle using path-based approach
  environment.canvas.beginPath();
  environment.canvas.rect(x.value, y.value, width.value, height.value);

  // Fill if fillStyle is not "none"
  if (environment.canvas.fillStyle !== "none") {
    environment.canvas.fill();
  }

  // Stroke if strokeStyle is not "none"
  if (environment.canvas.strokeStyle !== "none") {
    environment.canvas.stroke();
  }

  // Return undefined (no return value)
  return ok(undefined);
}

function evaluate_line(
  environment: Environment,
  args: Expr[],
): Result<Expr | undefined, LocatedError> {
  if (args.length !== 4) {
    return locatedError(
      "line requires exactly 4 arguments: (line x1 y1 x2 y2)",
    );
  }

  const [x1Expr, y1Expr, x2Expr, y2Expr] = args;

  // Evaluate x1 coordinate
  const x1Result = evaluate(environment, x1Expr);
  if (!isOk(x1Result)) {
    return x1Result;
  }
  const x1 = x1Result.value;
  if (!x1 || x1.type !== "number") {
    return locatedError(
      `line x1 coordinate must be a number, got ${x1?.type || "undefined"}`,
      x1Expr.location,
    );
  }

  // Evaluate y1 coordinate
  const y1Result = evaluate(environment, y1Expr);
  if (!isOk(y1Result)) {
    return y1Result;
  }
  const y1 = y1Result.value;
  if (!y1 || y1.type !== "number") {
    return locatedError(
      `line y1 coordinate must be a number, got ${y1?.type || "undefined"}`,
      y1Expr.location,
    );
  }

  // Evaluate x2 coordinate
  const x2Result = evaluate(environment, x2Expr);
  if (!isOk(x2Result)) {
    return x2Result;
  }
  const x2 = x2Result.value;
  if (!x2 || x2.type !== "number") {
    return locatedError(
      `line x2 coordinate must be a number, got ${x2?.type || "undefined"}`,
      x2Expr.location,
    );
  }

  // Evaluate y2 coordinate
  const y2Result = evaluate(environment, y2Expr);
  if (!isOk(y2Result)) {
    return y2Result;
  }
  const y2 = y2Result.value;
  if (!y2 || y2.type !== "number") {
    return locatedError(
      `line y2 coordinate must be a number, got ${y2?.type || "undefined"}`,
      y2Expr.location,
    );
  }

  // Draw the line using path-based approach
  environment.canvas.beginPath();
  environment.canvas.moveTo(x1.value, y1.value);
  environment.canvas.lineTo(x2.value, y2.value);

  // Only stroke if strokeStyle is not "none" (lines don't have fill)
  if (environment.canvas.strokeStyle !== "none") {
    environment.canvas.stroke();
  }

  // Return undefined (no return value)
  return ok(undefined);
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
