import { rand_range } from "../../utils/helper";

import { Station } from "../../utils/broadcast";
import { PositionalRule } from "../../positional_rule/protocol/positional_rule";
import { Skelton } from "../protocol/skelton";

import { Molecule } from "../../molecule/molecule";

const caster = Symbol();
const get_life = (): number => 2.5 * (rand_range(93, 101) / 100);

export class SkeltonStar extends Molecule implements Skelton {
    public static emerge(rule: PositionalRule): SkeltonStar {
        return new SkeltonStar(rule);
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

    private before = new Station<SkeltonStar>(caster)
    public get before_animate(): Station<SkeltonStar> {
        return this.before;
    }

    private update = new Station<SkeltonStar>(caster);
    public get on_next_frame(): Station<SkeltonStar> {
        return this.update;
    }

    private after = new Station<SkeltonStar>(caster);
    public get after_animate(): Station<SkeltonStar> {
        return this.after;
    }

    private constructor(rule: PositionalRule) {
        super(rule);
    }

    public next(delta: number): void {
        if (this.is_dead) return;

        super.next(delta);

        if (this.is_dead) {
            this.a = 0;
            this.after.broadcast(this).by(caster);
            return;
        }

        this.update.broadcast(this).by(caster);
    }

    public reset(): void {
        super.reset();
        this.a = 1;
        this.life = get_life();
        this.before.broadcast(this).by(caster);
    }
}
