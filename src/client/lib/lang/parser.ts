import type { Result } from "./core";
import type { Program } from "./types";

export function parse(_input: string): Result<Program, Error[]> {
  return { type: "error", value: [new Error("Unimplemented")] };
}
