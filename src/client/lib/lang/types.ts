export type Num = { type: "number"; location?: number; value: number };
export type Str = { type: "string"; location?: number; value: string };
export type Bool = { type: "boolean"; location?: number; value: boolean };
export type Symbol = { type: "symbol"; location?: number; value: string };
export type List = { type: "list"; location?: number; elements: Expr[] };

export type Expr = Num | Str | Bool | Symbol | List;

export type Program = Expr[];
