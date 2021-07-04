import { ParticleContainer } from "pixi.js";

import { Station } from "./utils/broadcast";
import { delayed_cache } from "./utils/helper";

import { on_resize as on_resize_p, app } from "./context/pixi";
import { on_resize as on_resize_s } from "./loader/pixi/firesprite";
import { on_resize as on_resize_c, canvas, render, on_render } from "./context/canvas";
import { on_resize as on_resize_i, skeltons, next, amount } from "./ideal/ideal_stage";
import { load } from "./loader/pixi/loader";

import { PARTICLE_NUM } from "./ideal/composition/ideal_shell";
import { FIREWOKS_AMOUNT } from "./ideal/ideal_stage";

export const init = delayed_cache(() => {
    app().stage.addChild(new ParticleContainer(
        FIREWOKS_AMOUNT * (PARTICLE_NUM * 2 + 1) * 2,
        { tint: true, scale: true }
    ))
    .addChild(...load(skeltons()));

    const caster = Symbol();
    const resizer = new Station<[number, number]>(
        caster,
        on_resize_c,
        on_resize_i,
        on_resize_p,
        on_resize_s
    );

    on_render(delta => void (next(delta)) ?? app().view);
    app().ticker.add(scale => render((scale * app().ticker.deltaMS) / 1000));
    app().ticker.stop();

    return {
        start: () => app().ticker.start(),
        stop: () => app().ticker.stop(),
        amount,
        resize: (w: number, h: number) => resizer.broadcast([w, h]).by(caster),
        view: canvas()
    } as const;
});
