import { rand_range, random_color } from "../../utils/helper";
import { create_transmitter, Observer, Receiver, Emitter } from "../../utils/transmitter";

import { Positional } from "../../positional/protocol/positional";
import { PositionalRule } from "../../positional_rule/protocol/positional_rule";

import { Animator } from "../../animator/protocol/animator";

import { Point } from "../../positional/basic_impl/point";
import { Vec3 } from "../../positional/basic_impl/vec3";

import { SkeltonStar } from "../impl/skelton_star";

export const PARTICLE_NUM = 150;
const RANDOM_LEVEL = 400;
const GOLDEN_SPIRAL = Math.PI * (1 + Math.sqrt(5));
const PI_HALF = Math.PI / 2;

let shorter = 0;
export const on_resized: Receiver<[number, number]> = ([w, h]) => shorter = Math.min(w, h);
const random_velovity = () => shorter * 0.8 * (rand_range(70, 111) / 100);

export class IdealShell implements Positional, Animator<IdealShell> {
    static emerge(rule: PositionalRule, reduction = 1): IdealShell {
        return new IdealShell(rule, reduction);
    }

    readonly stars: SkeltonStar[];

    center = Point.ZERO;

    get x(): number { return this.center.x; }
    get y(): number { return this.center.y; }
    get z(): number { return this.center.z; }

    get is_dead(): boolean { return this.stars.every(s => s.is_dead); }
    set alpha(alpha: number) { this.stars.forEach(s => s.alpha = alpha); }

    private readonly preparation: Emitter<IdealShell>;
    readonly before_animate: Observer<IdealShell>;

    private readonly death: Emitter<IdealShell>;
    readonly after_animate: Observer<IdealShell>;

    private readonly reduction: number;

    private constructor(rule: PositionalRule, reduction = 1) {
        this.reduction = reduction;
        this.stars = [...Array(PARTICLE_NUM)].map(() => SkeltonStar.emerge(rule, reduction));

        [this.preparation, this.before_animate] = create_transmitter<IdealShell>();
        [this.death, this.after_animate] = create_transmitter<IdealShell>();
    }

    reset(): void {
        const radius = random_velovity() * this.reduction;
        const color = random_color();

        let i = 0, t = Math.random(), r = 0;
        let theta: number, phi: number;
        let star: SkeltonStar;
        while (i < PARTICLE_NUM) {
            theta = Math.acos(1 - t / PARTICLE_NUM);
            r = rand_range(RANDOM_LEVEL - 1, RANDOM_LEVEL + 2) / RANDOM_LEVEL;

            if (theta > PI_HALF) {
                t += r;
                continue;
            }

            phi = GOLDEN_SPIRAL * t;
            t += r;

            star = this.stars[i];
            star.initial_position = this;
            star.direction = Vec3.decompose(theta, phi, radius);
            star.color = color;

            i++;
        }

        this.stars.forEach(star => star.reset());
        this.preparation.transmit(this);
    }

    next(delta: number): void {
        this.stars.forEach(star => star.next(delta));

        if (this.is_dead) {
            this.death.transmit(this);
        }
    }
}
