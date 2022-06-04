import { Graphics, Sprite } from "pixi.js";

import { delayed_cache, get_reversed_color } from "../../utils/helper";
import { Station, Receiver } from "../../utils/broadcast";

import { Skelton } from "../../ideal/protocol/skelton";

import { app } from "../../context/pixi";

const CIRCLE = delayed_cache(() => app().renderer.generateTexture(
    new Graphics()
        .beginFill(0xffffff, 1)
        .drawCircle(0, 0, 500)
        .endFill()
        .beginFill(0x000000, 1)
        .drawCircle(0, 0, 300)
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

    private constructor(core: Skelton) {
        super(CIRCLE());

        this.anchor.set(0.5);
        this.alpha = 0;

        core.before_animate.subscribe(this.before_animate.bind(this));
        core.on_next_frame.subscribe(this.on_next_frame.bind(this));
        core.after_animate.subscribe(this.after_animate.bind(this));

        handler.subscribe(this.on_scale_changed.bind(this));
        this.on_scale_changed(2);
    }

    private before_animate({ x, y, color }: Skelton): void {
        this.position.set(x, y);
        this.tint = get_reversed_color(color);
        this.alpha = 0;
    }

    private on_next_frame({ x, y, alpha }: Skelton): void {
        if (alpha === 0 && this.alpha === 0) {
            return;
        }

        this.position.set(x, y);

        if (this.alpha !== alpha) {
            this.alpha = alpha;
        }
    }

    private after_animate({ alpha }: Skelton): void {
        this.alpha = alpha;
    }

    private on_scale_changed(scale: number): void {
        this.scale.set(scale / CIRCLE().width);
    }
}
