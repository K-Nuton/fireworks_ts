import { rand_range } from "../../utils/helper";
import { create_transmitter, Observer, Receiver, Emitter } from "../../utils/transmitter";

import { PositionalRule } from "../../positional_rule/protocol/positional_rule";

import { Point } from "../../positional/basic_impl/point";
import { Vec3 } from "../../positional/basic_impl/vec3";

import { Skelton } from "../protocol/skelton";

const PI_HALF = Math.PI / 2;

let [w, h] = [0, 0];
export const on_resized: Receiver<[number, number]> = rect => [w, h] = rect;

const random_position = () => Point.of(w * (rand_range(100, 900) / 1000), h, 0);
const random_direction = () => Vec3.decompose(PI_HALF, -PI_HALF, h * (rand_range(100, 200) / 100) * 0.8);

export class LauncherSkelton implements Skelton {
    static emerge(rule: PositionalRule): LauncherSkelton {
        return new LauncherSkelton(rule);
    }

    private readonly rule: PositionalRule;

    readonly color = 0xffffff;

    private opacity = 0;
    get alpha(): number {
        return this.opacity;
    }
    set alpha(alpha: number) {
        this.opacity = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
    }

    private center = Point.ZERO;
    private vector = Vec3.BASIS;
    private elapse = 0;

    get x(): number {
        return this.center.x + this.rule.x(this.vector, this.elapse);
    }

    get y(): number {
        return this.center.y + this.rule.y(this.vector, this.elapse);
    }

    get z(): number {
        return this.center.z + this.rule.z(this.vector, this.elapse);
    }

    private readonly preparation: Emitter<Skelton>;
    readonly before_animate: Observer<Skelton>;

    private readonly update: Emitter<Skelton>;
    readonly on_next_frame: Observer<Skelton>;

    private readonly death: Emitter<Skelton>;
    readonly after_animate: Observer<Skelton>;

    private constructor(rule: PositionalRule) {
        this.rule = rule;

        [this.preparation, this.before_animate] = create_transmitter<Skelton>();
        [this.update, this.on_next_frame] = create_transmitter<Skelton>();
        [this.death, this.after_animate] = create_transmitter<Skelton>();
    }

    next(delta: number): void {
        const last_y = this.y;

        this.elapse += delta;

        if (last_y < this.y) {
            this.opacity = 0;
            this.death.transmit(this);
            return;
        }

        this.update.transmit(this);
    }

    reset(): void {
        this.elapse = 0;

        this.opacity = 1;
        this.center = random_position();
        this.vector = random_direction();

        this.preparation.transmit(this);
    }
}
