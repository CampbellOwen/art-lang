import { error, type Result } from "./core";
import type { Program } from "./types";

export function parse(_input: string): Result<Program, Error[]> {
  return error([new Error("unimplemented")]);
}
