import { rand_range } from "../../utils/helper";

import { create_transmitter, Observer, StateHandler } from "../../utils/transmitter";
import { PositionalRule } from "../../positional_rule/protocol/positional_rule";
import { Skelton } from "../protocol/skelton";

import { Molecule } from "../../molecule/molecule";

const random_life = (): number => 2.5 * (rand_range(93, 101) / 100);

export class SkeltonStar extends Molecule implements Skelton {
    static emerge(rule: PositionalRule, scale = 1): SkeltonStar {
        return new SkeltonStar(rule, scale);
    }

    private life = random_life();

    private _color = 0xffffff;
    get color(): number { return this._color; }
    set color(color: number) { this._color = color < 0 ? 0 : color > 0xffffff ? 0xffffff : color; }

    private _alpha = 0;
    get alpha(): number { return this._alpha; }
    set alpha(alpha: number) { 
        this._alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
        this._alpha === 0 && this.preparation.transmit(this);
    }

    get is_dead(): boolean { return this.elapse > this.life; }

    private readonly preparation: StateHandler<SkeltonStar>;
    readonly before_animate: Observer<SkeltonStar>;

    private readonly update: StateHandler<SkeltonStar>;
    readonly on_next_frame: Observer<SkeltonStar>;

    private readonly death: StateHandler<SkeltonStar>;
    readonly after_animate: Observer<SkeltonStar>;

    readonly scale: number;

    private constructor(rule: PositionalRule, scale = 1) {
        super(rule);
        this.scale = scale;

        [this.preparation, this.before_animate] = create_transmitter<SkeltonStar>();
        [this.update, this.on_next_frame] = create_transmitter<SkeltonStar>();
        [this.death, this.after_animate] = create_transmitter<SkeltonStar>();
    }

    next(delta: number): void {
        if (this.is_dead) return;

        super.next(delta);

        if (this.is_dead) {
            this._alpha = 0;
            this.death.transmit(this);
            return;
        }

        this.update.transmit(this);
    }

    reset(): void {
        super.reset();

        this._alpha = 1;
        this.life = random_life();

        this.preparation.transmit(this);
    }
}
