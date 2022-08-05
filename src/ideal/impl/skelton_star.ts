import { rand_range } from "../../utils/helper";

import { transmitter, Observer, OBSERVER, HANDLER } from "../../utils/transmitter";
import { PositionalRule } from "../../positional_rule/protocol/positional_rule";
import { Skelton } from "../protocol/skelton";

import { Molecule } from "../../molecule/molecule";

const get_life = (): number => 2.5 * (rand_range(93, 101) / 100);

export class SkeltonStar extends Molecule implements Skelton {
    public static emerge(rule: PositionalRule, scale = 1): SkeltonStar {
        return new SkeltonStar(rule, scale);
    }

    private life = get_life();

    private c = 0xffffff;
    public set color(color: number) {
        if (color < 0) {
            this.c = 0;
        } else if (color > 0xffffff) {
            this.c = 0xffffff;
        } else {
            this.c = color;
        }
    }
    public get color(): number {
        return this.c;
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

    public get is_dead(): boolean {
        return this.elapse > this.life;
    }

    private readonly before = transmitter<SkeltonStar>();
    public get before_animate(): Observer<SkeltonStar> {
        return this.before[OBSERVER];
    }

    private readonly update = transmitter<SkeltonStar>();
    public get on_next_frame(): Observer<SkeltonStar> {
        return this.update[OBSERVER];
    }

    private readonly after = transmitter<SkeltonStar>();
    public get after_animate(): Observer<SkeltonStar> {
        return this.after[OBSERVER];
    }

    public readonly scale: number;

    private constructor(rule: PositionalRule, scale = 1) {
        super(rule);
        this.scale = scale;
    }

    public next(delta: number): void {
        if (this.is_dead) return;

        super.next(delta);

        if (this.is_dead) {
            this.a = 0;
            this.after[HANDLER].transmit(this);
            return;
        }

        this.update[HANDLER].transmit(this);
    }

    public reset(): void {
        super.reset();
        this.a = 1;
        this.life = get_life();
        this.before[HANDLER].transmit(this);
    }
}
