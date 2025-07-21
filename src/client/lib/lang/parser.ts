import { error, ok, type Result } from "./core";
import type { Expr, Program } from "./types";

export function parse(input: string): Result<Program, Error[]> {
  const iterator = Array.from(input).entries();

  const errors: Error[] = [];
  const program: Expr[] = [];

  let next;
  do {
    next = iterator.next();
    if (!next.value) {
    }
  } while (!next.done);

  if (errors.length > 0) {
    return error(errors);
  }

  return ok(program);
}
