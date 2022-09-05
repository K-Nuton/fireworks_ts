import { rand_range } from "../../utils/helper";

import { create_transmitter, Observer, Emitter } from "../../utils/transmitter";
import { PositionalRule } from "../../positional_rule/protocol/positional_rule";
import { Skelton } from "../protocol/skelton";

import { Point } from "../../positional/basic_impl/point";
import { Vec3 } from "../../positional/basic_impl/vec3";
import { Positional } from "../../positional/protocol/positional";

const random_life = (): number => 2.5 * (rand_range(93, 101) / 100);

export class StarSkelton implements Skelton {
    static emerge(rule: PositionalRule, scale = 1): StarSkelton {
        return new StarSkelton(rule, scale);
    }

    private readonly rule: PositionalRule;

    private center = Point.ZERO;
    set initial_position(position: Positional) {
        this.center = position;
    }

    private vector = Vec3.BASIS;
    set direction(direction: Positional) {
        this.vector = direction;
    }

    get x(): number {
        return this.center.x + this.rule.x(this.vector, this.elapse);
    }

    get y(): number {
        return this.center.y + this.rule.y(this.vector, this.elapse);
    }

    get z(): number {
        return this.center.z + this.rule.z(this.vector, this.elapse);
    }

    private elapse = 0;
    private life = random_life();
    get is_dead(): boolean {
        return this.elapse > this.life;
    }

    private tint = 0xffffff;
    get color(): number {
        return this.tint;
    }
    set color(color: number) {
        this.tint = color < 0 ? 0 : color > 0xffffff ? 0xffffff : color;
    }

    private opacity = 0;
    get alpha(): number { return this.opacity; }
    set alpha(alpha: number) {
        this.opacity = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
        this.opacity === 0 && this.preparation.transmit(this);
    }

    private readonly preparation: Emitter<Skelton>;
    readonly before_animate: Observer<Skelton>;

    private readonly update: Emitter<Skelton>;
    readonly on_next_frame: Observer<Skelton>;

    private readonly death: Emitter<Skelton>;
    readonly after_animate: Observer<Skelton>;

    readonly scale: number;

    private constructor(rule: PositionalRule, scale = 1) {
        this.rule = rule;
        this.scale = scale;

        [this.preparation, this.before_animate] = create_transmitter<Skelton>();
        [this.update, this.on_next_frame] = create_transmitter<Skelton>();
        [this.death, this.after_animate] = create_transmitter<Skelton>();
    }

    next(delta: number): void {
        if (this.is_dead) return;

        this.elapse += delta;

        if (this.is_dead) {
            this.opacity = 0;
            this.death.transmit(this);
            return;
        }

        this.update.transmit(this);
    }

    reset(): void {
        this.elapse = 0;

        this.opacity = 1;
        this.life = random_life();

        this.preparation.transmit(this);
    }
}
