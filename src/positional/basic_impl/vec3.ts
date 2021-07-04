import { Positional } from "../protocol/positional";
import { Point } from "./point";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Vec3 {
    export const decompose = (theta: number, phi: number, radius: number): Positional => Point.of(
        Math.sin(theta) * Math.cos(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(theta) * radius
    );

    export const BASIS = Point.of(1, 1, 1);
}