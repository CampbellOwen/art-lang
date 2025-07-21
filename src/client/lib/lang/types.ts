export type Expr =
  | { type: "number"; location: number; value: number }
  | { type: "string"; location: number; value: string }
  | { type: "symbol"; location: number; value: string }
  | { type: "list"; location: number; elements: Expr[] };

export type Program = Expr[];
