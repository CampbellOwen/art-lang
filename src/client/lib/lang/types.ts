export type Expr =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "symbol"; value: string }
  | { type: "list"; elements: Expr[] };

export type Program = Expr[];
