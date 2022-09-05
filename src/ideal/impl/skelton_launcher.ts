import { rand_range } from "../../utils/helper";
import { create_transmitter, Observer, Receiver, Emitter } from "../../utils/transmitter";

import { PositionalRule } from "../../positional_rule/protocol/positional_rule";

import { Point } from "../../positional/basic_impl/point";
import { Vec3 } from "../../positional/basic_impl/vec3";

import { Skelton } from "../protocol/skelton";

import { Molecule } from "../../molecule/molecule";

const PI_HALF = Math.PI / 2;

let [w, h] = [0, 0];
export const on_resized: Receiver<[number, number]> = rect => [w, h] = rect;

const random_position = () => Point.of(w * (rand_range(100, 900) / 1000), h, 0);
const random_direction = () => Vec3.decompose(PI_HALF, -PI_HALF, h * (rand_range(100, 200) / 100) * 0.8);

export class SkeltonLauncher extends Molecule implements Skelton {
    static emerge(rule: PositionalRule): SkeltonLauncher {
        return new SkeltonLauncher(rule);
    }

    readonly color = 0xffffff;

    private _alpha = 0;
    get alpha(): number { return this._alpha; }
    set alpha(alpha: number) { this._alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha; }

    private readonly preparation: Emitter<SkeltonLauncher>;
    readonly before_animate: Observer<SkeltonLauncher>;

    private readonly update: Emitter<SkeltonLauncher>;
    readonly on_next_frame: Observer<SkeltonLauncher>;

    private readonly death: Emitter<SkeltonLauncher>;
    readonly after_animate: Observer<SkeltonLauncher>;

    private constructor(rule: PositionalRule) {
        super(rule);

        [this.preparation, this.before_animate] = create_transmitter<SkeltonLauncher>();
        [this.update, this.on_next_frame] = create_transmitter<SkeltonLauncher>();
        [this.death, this.after_animate] = create_transmitter<SkeltonLauncher>();
    }

    next(delta: number): void {
        const last_y = this.y;
        super.next(delta);

        if (last_y < this.y) {
            this._alpha = 0;
            this.death.transmit(this);
            return;
        }

        this.update.transmit(this);
    }

    reset(): void {
        super.reset();

        this._alpha = 1;
        this.initial_position = random_position();
        this.direction = random_direction();

        this.preparation.transmit(this);
    }
}
