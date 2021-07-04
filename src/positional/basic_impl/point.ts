import { Positional } from "../protocol/positional";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Point {
    export const of = (x: number, y: number, z: number): Positional => ({ x, y, z } as const);
    export const from = ({ x, y, z }: Positional): Positional => of(x, y, z);
    export const ZERO = of(0, 0, 0);
}
