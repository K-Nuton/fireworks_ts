import { rand_range, random_color } from "../../utils/helper";
import { Station, Receiver } from "../../utils/broadcast";

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
export const on_resized: Receiver<[number, number]> = ([w, h]): void => void (shorter = Math.min(w, h));
const get_velocity = (): number => shorter * (8 / 10) * (rand_range(70, 111) / 100);

const caster = Symbol();

export class IdealShell implements Positional, Animator<IdealShell> {
    public static emerge(rule: PositionalRule, reduction = 1): IdealShell {
        return new IdealShell(rule, reduction);
    }

    private s: SkeltonStar[];
    public get stars(): SkeltonStar[] {
        return this.s;
    }

    private c = Point.ZERO;

    public get x(): number {
        return this.c.x;
    }

    public get y(): number {
        return this.c.y;
    }

    public get z(): number {
        return this.c.z;
    }

    public set alpha(alpha: number) {
        this.stars.forEach(s => s.alpha = alpha);
    }

    public set center(center: Positional) {
        this.c = center;
    }

    private before = new Station<IdealShell>(caster);
    public get before_animate(): Station<IdealShell> {
        return this.before;
    }

    private after = new Station<IdealShell>(caster);
    public get after_animate(): Station<IdealShell> {
        return this.after;
    }

    private reduction: number;

    private constructor(rule: PositionalRule, reduction = 1) {
        this.reduction = reduction;
        this.s = [...Array(PARTICLE_NUM)].map(() => SkeltonStar.emerge(rule));
    }

    public get is_dead(): boolean {
        return this.s.every(s => s.is_dead);
    }

    public reset(): void {
        const radius = get_velocity() * this.reduction;
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

            star = this.s[i];
            star.initial_position = this;
            star.direction = Vec3.decompose(theta, phi, radius);
            star.color = color;

            i++;
        }

        this.s.forEach(star => star.reset());
        this.before.broadcast(this).by(caster);
    }

    public next(delta: number): void {
        this.s.forEach(star => star.next(delta));

        if (this.is_dead) {
            this.after.broadcast(this).by(caster);
        }
    }
}