export type Ok<T> = { type: "ok"; value: T };
export type Err<E> = { type: "error"; value: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.type === "ok";
}
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.type === "error";
}

export function error<E>(e: E): Err<E> {
  return { type: "error", value: e };
}

export function ok<T>(value: T): Ok<T> {
  return { type: "ok", value };
}
