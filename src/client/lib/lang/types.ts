export type Num = { type: "number"; location?: number; value: number };
export type Str = { type: "string"; location?: number; value: string };
export type Symbol = { type: "symbol"; location?: number; value: string };
export type List = { type: "list"; location?: number; elements: Expr[] };

export type Expr = Num | Str | Symbol | List;

export type Program = Expr[];
