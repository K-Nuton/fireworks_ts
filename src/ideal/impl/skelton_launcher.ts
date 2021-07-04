import { rand_range } from "../../utils/helper";
import { Station, Receiver } from "../../utils/broadcast";

import { Positional } from "../../positional/protocol/positional";
import { PositionalRule } from "../../positional_rule/protocol/positional_rule";

import { Point } from "../../positional/basic_impl/point";
import { Vec3 } from "../../positional/basic_impl/vec3";

import { Skelton } from "../protocol/skelton";

import { Molecule } from "../../molecule/molecule";

const PI_HALF = Math.PI / 2;

let [w, h] = [0, 0];
export const on_resized: Receiver<[number, number]> = (rect): void => void ([w, h] = rect);

const get_position = (): Positional => Point.of(w * (rand_range(100, 900) / 1000), h, 0);
const get_direction = (): Positional => Vec3.decompose(PI_HALF, -PI_HALF, h * (rand_range(100, 200) / 100) * (6 / 10));

const caster = Symbol();

export class SkeltonLauncher extends Molecule implements Skelton {
    public static emerge(rule: PositionalRule): SkeltonLauncher {
        return new SkeltonLauncher(rule);
    }

    public get color(): number {
        return 0xffffff;
    }

    private a = 0;
    public get alpha(): number {
        return this.a;
    }
    public set alpha(alpha: number) {
        if (alpha < 0) {
            this.a = 0;
        } else if (alpha > 1) {
            this.a = 1;
        } else {
            this.a = alpha;
        }
    }

    private before = new Station<SkeltonLauncher>(caster);
    public get before_animate(): Station<SkeltonLauncher> {
        return this.before;
    }

    private update = new Station<SkeltonLauncher>(caster);
    public get on_next_frame(): Station<SkeltonLauncher> {
        return this.update;
    }

    private after = new Station<SkeltonLauncher>(caster);
    public get after_animate(): Station<SkeltonLauncher> {
        return this.after;
    }

    private constructor(rule: PositionalRule) {
        super(rule);
    }

    public next(delta: number): void {
        const last_y = this.y;
        super.next(delta);

        if (last_y < this.y) {
            this.a = 0;
            this.after.broadcast(this).by(caster);
            return;
        }

        this.update.broadcast(this).by(caster);
    }

    public reset(): void {
        super.reset();
        this.a = 1;
        this.initial_position = get_position();
        this.direction = get_direction();
        this.before.broadcast(this).by(caster);
    }
}
