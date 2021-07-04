import { Graphics, Sprite } from "pixi.js";

import { delayed_cache } from "../../utils/helper";
import { Station, Receiver } from "../../utils/broadcast";

import { Skelton } from "../../ideal/protocol/skelton";

import { app } from "../../context/pixi";

const CIRCLE = delayed_cache(() => app().renderer.generateTexture(
    new Graphics()
        .beginFill(0xffffff, 1)
        .drawCircle(0, 0, 500)
        .endFill()
));

const caster = Symbol();
const handler = new Station<number>(caster);
export const on_resize: Receiver<[number, number]> = ([w, h]): void => handler.broadcast(
    Math.max(2, Math.min(5, Math.min(w, h) / 100))
).by(caster);

export class FireSprite extends Sprite {
    public static fromSkelton(core: Skelton): FireSprite {
        return new FireSprite(core);
    }

    private highlight = new Sprite(CIRCLE());

    public get sprites(): [Sprite, Sprite] {
        return [this, this.highlight];
    }

    private constructor(core: Skelton) {
        super(CIRCLE());

        this.tint = core.color;
        this.anchor.set(0.5);
        this.alpha = 0;

        this.highlight.anchor.set(0.5);
        this.highlight.alpha = 0;

        this.position.scope = this;
        this.position.cb = function (this: FireSprite): void {
            this.highlight.position.set(this.x, this.y);
        };

        this.scale.scope = this;
        this.scale.cb = function (this: FireSprite): void {
            this.highlight.scale.set(this.scale.x * 0.6);
        };

        core.before_animate.subscribe(this.before_animate.bind(this));
        core.on_next_frame.subscribe(this.on_next_frame.bind(this));
        core.after_animate.subscribe(this.after_animate.bind(this));

        handler.subscribe(this.on_scale_changed.bind(this));
        this.on_scale_changed(2);
    }

    private before_animate({ x, y, color }: Skelton): void {
        this.position.set(x, y);
        this.tint = color;
        this.alpha = this.highlight.alpha = 0;
    }

    private on_next_frame({ x, y, alpha }: Skelton): void {
        if (alpha === 0 && this.alpha === 0) {
            return;
        }

        this.position.set(x, y);

        if (this.alpha !== alpha) {
            this.alpha = this.highlight.alpha = alpha;
        }
    }

    private after_animate({ alpha }: Skelton): void {
        this.alpha = this.highlight.alpha = alpha;
    }

    private on_scale_changed(scale: number): void {
        this.scale.set(scale / CIRCLE().width);
    }
}
