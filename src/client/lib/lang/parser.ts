import { PeekableIterator, error, isErr, isOk, ok, type Result } from "./core";
import type { Expr, List, Num, Program, Str, Symbol } from "./types";

function skipWhitespace(it: PeekableIterator<string>) {
  it.skipWhile((c) => c !== undefined && c.trim() === "");
}

function isNumber(str: string): boolean {
  return !Number.isNaN(Number(str)) && str.trim() !== "";
}

export function parse(input: string): Result<Program, Error[]> {
  const iterator = new PeekableIterator(Array.from(input));

  const errors: Error[] = [];
  const program: Expr[] = [];

  while (iterator.hasNext()) {
    const res = parse_inner(iterator);
    if (isOk(res)) {
      if (res.value) {
        program.push(res.value);
      } else {
        break;
      }
    } else {
      res.value.forEach((err) => errors.push(err));
      // Advance iterator to prevent infinite loop on persistent errors
      iterator.next();
    }
  }

  if (errors.length > 0) {
    return error(errors);
  }
  return ok(program);
}

function parse_inner(it: PeekableIterator<string>): Result<Expr, Error[]> {
  const errors: Error[] = [];
  const location = it.pos();

  if (!it.hasNext()) {
    errors.push(new Error(`Unexpected end of input at ${location}`));
    return error(errors);
  }

  skipWhitespace(it);

  const next = it.peek();
  if (next === undefined) {
    // End of input after whitespace is valid - return null to signal completion
    return ok(null as any);
  }

  if (next === "(") {
    return parse_list(it);
  }
  if (next === '"') {
    return parse_string(it);
  }
  if (isNumber(next) || (next === "-" && isNumber(it.peek(1) ?? ""))) {
    return parse_number(it);
  }

  // Everything else is treated as a symbol
  return parse_symbol(it);
}

function parse_list(it: PeekableIterator<string>): Result<List, Error[]> {
  const exprs: Expr[] = [];
  const errors: Error[] = [];
  const location = it.pos();

  const next = it.next();
  if (next !== "(") {
    errors.push(new Error(`Missing opening ( at position ${it.pos()}`));
    return error(errors);
  }

  while (true) {
    skipWhitespace(it);

    // Check if we've reached the end of the list
    if (it.peek() === ")") {
      it.next();
      break;
    }

    // If we've reached the end of input without closing paren, that's an error
    if (!it.hasNext()) {
      errors.push(
        new Error(`Unexpected end of input - missing closing parenthesis`),
      );
      break;
    }

    const res = parse_inner(it);
    if (isErr(res)) {
      errors.push(...res.value);
      break;
    }

    exprs.push(res.value);
  }

  if (errors.length > 0) {
    return error(errors);
  }

  const list: List = { type: "list", location, elements: exprs };

  return ok(list);
}

function parse_number(it: PeekableIterator<string>): Result<Num, Error[]> {
  const errors: Error[] = [];
  const location = it.pos();
  let numberStr = "";

  // Handle negative sign
  if (it.peek() === "-") {
    numberStr += it.next();
  }

  // Collect digits and decimal point
  while (it.hasNext()) {
    const char = it.peek();
    if (char === undefined) break;

    if (/[0-9.]/.test(char)) {
      numberStr += it.next();
    } else {
      break;
    }
  }

  if (!isNumber(numberStr)) {
    errors.push(
      new Error(`Invalid number format '${numberStr}' at position ${location}`),
    );
    return error(errors);
  }

  const num: Num = { type: "number", location, value: Number(numberStr) };
  return ok(num);
}

function parse_string(it: PeekableIterator<string>): Result<Str, Error[]> {
  const errors: Error[] = [];
  const location = it.pos();
  let stringValue = "";

  // Consume opening quote
  const openQuote = it.next();
  if (openQuote !== '"') {
    errors.push(new Error(`Missing opening " at position ${location}`));
    return error(errors);
  }

  // Collect characters until closing quote
  while (it.hasNext()) {
    const char = it.next();
    if (char === '"') {
      // Found closing quote
      const str: Str = { type: "string", location, value: stringValue };
      return ok(str);
    }
    if (char === undefined) {
      break;
    }
    stringValue += char;
  }

  // If we get here, we reached end of input without finding closing quote
  errors.push(new Error(`Unterminated string literal at position ${location}`));
  return error(errors);
}

function parse_symbol(it: PeekableIterator<string>): Result<Symbol, Error[]> {
  const errors: Error[] = [];
  const location = it.pos();
  let symbolValue = "";

  // Collect characters that are valid for symbols
  while (it.hasNext()) {
    const char = it.peek();
    if (char === undefined) break;

    // Stop at whitespace, parentheses, or quotes
    if (char.trim() === "" || char === "(" || char === ")" || char === '"') {
      break;
    }

    symbolValue += it.next();
  }

  if (symbolValue === "") {
    errors.push(new Error(`Empty symbol at position ${location}`));
    return error(errors);
  }

  const symbol: Symbol = { type: "symbol", location, value: symbolValue };
  return ok(symbol);
}
