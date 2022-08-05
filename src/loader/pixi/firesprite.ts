import { Graphics, Sprite } from "pixi.js";

import { delayed_cache } from "../../utils/helper";
import { transmitter, Receiver } from "../../utils/transmitter";

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

const MASK = 0xffffff;

const [handler, observer] = transmitter<number>();
export const on_resize: Receiver<[number, number]> = ([w, h]): void => handler.transmit(
    Math.max(2, Math.min(5, Math.min(w, h) / 100)) / CIRCLE().width
);

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

        observer.subscribe(this.scale.set.bind(this.scale));
        this.scale.set(2 / CIRCLE().width);
    }

    private before_animate({ x, y, color, alpha }: Skelton): void {
        this.position.set(x, y);
        this.tint = MASK ^ color;
        this.alpha = alpha;
    }

    private on_next_frame({ x, y, alpha }: Skelton): void {
        if (this.alpha !== alpha) {
            this.alpha = alpha;
        }

        this.position.set(x, y);
    }

    private after_animate({ alpha }: Skelton): void {
        this.alpha = alpha;
    }
}
