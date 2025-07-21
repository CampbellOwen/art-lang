export type Expr =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "symbol"; value: string }
  | { type: "list"; elements: Expr[] };

export type Program = Expr[];

export type Ok<T> = { type: "ok"; value: T };
export type Err<E> = { type: "error"; value: E };
export type Result<T, E> = Ok<T> | Err<E>;
