import { Graphics, Sprite } from "pixi.js";

import { delayed_cache } from "../utils/helper";
import { transmitter, Receiver } from "../utils/transmitter";

import { Skelton } from "../ideal/protocol/skelton";

import { app } from "../context/pixi";

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

export function to_sprite({
    before_animate,
    on_next_frame,
    after_animate,
    scale
}: Skelton): Sprite {
    const sprite = Sprite.from(CIRCLE());

    sprite.anchor.set(0.5);
    sprite.alpha = 0;

    before_animate.subscribe(({ x, y, color, alpha }: Skelton) => {
        sprite.position.set(x, y);
        sprite.tint = MASK ^ color;
        sprite.alpha = alpha;
    });

    on_next_frame.subscribe(({ x, y, alpha }: Skelton) => {
        if (sprite.alpha !== alpha) {
            sprite.alpha = alpha;
        }

        sprite.position.set(x, y);
    });

    after_animate.subscribe(({ alpha }: Skelton) => sprite.alpha = alpha);

    observer.subscribe(base_scale => sprite.scale.set(base_scale * (scale ?? 1)));
    sprite.scale.set(2 / CIRCLE().width);

    return sprite;
}
