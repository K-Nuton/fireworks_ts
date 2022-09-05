import { Graphics, Sprite } from "../pixi/pixi";

import { delayed_cache } from "../utils/helper";
import { create_transmitter, Receiver } from "../utils/transmitter";

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

const [scaler, observer] = create_transmitter<number>();
export const on_resize: Receiver<[number, number]> = ([w, h]) => scaler.transmit(
    Math.max(2, Math.min(5, Math.min(w, h) / 100)) / CIRCLE().width
);

export function to_sprite({ before_animate, on_next_frame, after_animate, scale = 1 }: Skelton): Sprite {
    const sprite = Sprite.from(CIRCLE());

    sprite.anchor.set(0.5);
    sprite.alpha = 0;

    before_animate.subscribe(({ x, y, color, alpha }: Skelton) => {
        sprite.position.set(x, y);
        sprite.tint = MASK ^ color;
        sprite.alpha = alpha;
    });

    on_next_frame.subscribe(({ x, y }: Skelton) => sprite.position.set(x, y));
    after_animate.subscribe(({ alpha }: Skelton) => sprite.alpha = alpha);

    observer.subscribe(base_scale => sprite.scale.set(base_scale * scale));
    sprite.scale.set(2 / CIRCLE().width);

    return sprite;
}
