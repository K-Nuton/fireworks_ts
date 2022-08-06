import { Positional } from "../positional/protocol/positional";
import { PositionalRule } from "../positional_rule/protocol/positional_rule";
import { Animator } from "../animator/protocol/animator";

import { Point } from "../positional/basic_impl/point";
import { Vec3 } from "../positional/basic_impl/vec3";

export class Molecule implements Positional, Animator<Molecule>{
    private readonly rule: PositionalRule;

    private t = 0;
    private p = Point.ZERO;
    private v = Vec3.BASIS;

    get elapse(): number { return this.t; }

    set initial_position(position: Positional) { this.p = position; }
    set direction(direction: Positional) { this.v = direction; }

    get x(): number { return this.p.x + this.rule.x(this.v, this.t); }
    get y(): number { return this.p.y + this.rule.y(this.v, this.t); }
    get z(): number { return this.p.z + this.rule.z(this.v, this.t); }

    constructor(rule: PositionalRule) {
        this.rule = rule;
    }

    reset(): void {
        this.t = 0;
    }

    next(delta: number): void {
        this.t += delta;
    }
}
