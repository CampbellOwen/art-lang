import { PeekableIterator, error, isErr, isOk, ok, type Result } from "./core";
import type { Expr, List, Num, Program } from "./types";

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
    errors.push(new Error(`Unexpected end of input at position ${location}`));
    return error(errors);
  }

  if (next === "(") {
    return parse_list(it);
  }
  if (isNumber(next) || (next === "-" && isNumber(it.peek(1) ?? ""))) {
    return parse_number(it);
  }
  errors.push(
    new Error(`Unexpected character ${next} at position ${location}`),
  );
  it.next();

  return error(errors);
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
