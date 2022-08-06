import { Receiver } from "../../utils/transmitter";
import { PositionalRule } from "../protocol/positional_rule";

const r = 2, c = Math.pow(r, -2);
let g = 1;
export const on_resized: Receiver<[number, number]> = ([, h]) => g = h * -0.05;

export const Newton: PositionalRule = {
    x: ({ x }, t) => (x / r) * (1 - Math.pow(Math.E, -r * t)),
    y: ({ y }, t) => ((-g * t) / r) + c * (g + r * y) * (1 - Math.pow(Math.E, -r * t)),
    z: ({ z }, t) => (z / r) * (1 - Math.pow(Math.E, -r * t))
} as const;
