import { Receiver } from "../../utils/broadcast";
import { PositionalRule, Rule } from "../protocol/positional_rule";

let g = 1, r = 1, c = 1;
export const on_resized: Receiver<[number, number]> = (([, h]): void => {
    g = -h * (1 / 20);
    c = Math.pow((r = 2), -2);
});

const x_rule: Rule = (v, t) => (v.x / r) * (1 - Math.pow(Math.E, -r * t));
const y_rule: Rule = (v, t) => ((-g * t) / r) + c * (g + r * v.y) * (1 - Math.pow(Math.E, -r * t));
const z_rule: Rule = (v, t) => (v.z / r) * (1 - Math.pow(Math.E, -r * t));

export const Newton = new (class implements PositionalRule {
    public get x(): Rule { return x_rule; }
    public get y(): Rule { return y_rule; }
    public get z(): Rule { return z_rule; }
})();
