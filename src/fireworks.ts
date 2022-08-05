import { ParticleContainer } from "pixi.js";

import { transmitter } from "./utils/transmitter";
import { delayed_cache } from "./utils/helper";

import { on_resize as on_resize_p, app } from "./context/pixi";
import { on_resize as on_resize_s } from "./loader/firesprite";
import { on_resize as on_resize_c, canvas, render, on_render } from "./context/canvas";
import { on_resize as on_resize_i, skeltons, next, amount } from "./ideal/ideal_stage";
import { to_sprite } from "./loader/firesprite";

import { reverse_color_filter } from "./context/reverse.filter";

import { FIREWOKS_AMOUNT } from "./ideal/ideal_stage";
import { PARTICLE_NUM } from "./ideal/composition/ideal_shell";

export const init = delayed_cache(() => {
    console.log('Fireworks.js ver.1.1.4');

    app().stage.filters = [reverse_color_filter()];

    app().stage.addChild(new ParticleContainer(
        FIREWOKS_AMOUNT * (PARTICLE_NUM + 1) * 2,
        { tint: true, scale: true }
    )).addChild(...skeltons().map(to_sprite));

    const [resizer, rect_observer] = transmitter<[number, number]>();
    rect_observer.subscribe(on_resize_c, on_resize_i, on_resize_p, on_resize_s);

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
