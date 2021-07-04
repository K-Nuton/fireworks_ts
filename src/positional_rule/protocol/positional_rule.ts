import { Positional } from "../../positional/protocol/positional";

export type Rule = (direction: Positional, elapse: number) => number;
export interface PositionalRule {
    readonly x: Rule;
    readonly y: Rule;
    readonly z: Rule;
}
