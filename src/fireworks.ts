import { ParticleContainer } from "pixi.js";

import { create_transmitter } from "./utils/transmitter";
import { delayed_cache } from "./utils/helper";

import { on_resize as reset_pixi_ctx, app } from "./context/pixi";
import { on_resize as resize_sprite } from "./loader/firesprite";
import { on_resize as reset_canvas_ctx, canvas, render, on_render } from "./context/canvas";
import { on_resize as resize_ideal, skeltons, next, amount } from "./ideal/ideal_stage";
import { to_sprite } from "./loader/firesprite";

import { reverse_color_filter } from "./context/reverse.filter";

import { FIREWOKS_AMOUNT } from "./ideal/ideal_stage";
import { PARTICLE_NUM } from "./ideal/composition/ideal_shell";

export const init = delayed_cache(() => {
    console.log('Fireworks.js ver.1.1.5');

    app().stage.filters = [reverse_color_filter()];

    app().stage.addChild(new ParticleContainer(
        FIREWOKS_AMOUNT * (PARTICLE_NUM + 1) * 2,
        { tint: true, scale: true }
    )).addChild(...skeltons().map(to_sprite));

    const [resizer, observer] = create_transmitter<[number, number]>();
    observer.subscribe(reset_canvas_ctx, reset_pixi_ctx, resize_ideal, resize_sprite);

    on_render(delta => void (next(delta)) ?? app().view);
    app().ticker.add(scale => render((scale * app().ticker.deltaMS) / 1000));
    app().ticker.stop();

    return {
        start: () => app().ticker.start(),
        stop: () => app().ticker.stop(),
        amount,
        resize: (w: number, h: number) => resizer.transmit([w, h]),
        view: canvas()
    } as const;
});
