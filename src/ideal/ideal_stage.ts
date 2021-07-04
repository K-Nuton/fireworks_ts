import { Station, Receiver } from "../utils/broadcast";
import { delayed_cache } from "../utils/helper";

import { on_resized as n_resize, Newton } from "../positional_rule/impl/newton";
import { on_resized as l_resize } from "./impl/skelton_launcher";
import { on_resized as s_resize } from "./composition/ideal_shell";

import { IdealFirework } from "./composition/ideal_firework";

export const FIREWOKS_AMOUNT = 20;
const fireworks = delayed_cache(() => [...Array(FIREWOKS_AMOUNT)].map(() => new IdealFirework(Newton)));

const caster = Symbol()
const resizer = new Station<[number, number]>(caster, n_resize, l_resize, s_resize);

export const skeltons = delayed_cache(() => fireworks().map(f => f.skeltons).flat());

export const amount = (num: number): void => {
    if (num < 1 || num > FIREWOKS_AMOUNT) {
        console.warn('num should be between 1 and 20.');
        return;
    }

    fireworks().forEach((f, i) => i < num ? f.show() : f.hide());
}

export const on_resize: Receiver<[number, number]> = new_rect => resizer.broadcast(new_rect).by(caster);
export const reset = (): void => fireworks().forEach(f => f.reset());
export const next = (delta: number): void => fireworks().forEach(f => f.next(delta));
