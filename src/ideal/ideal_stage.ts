import { create_transmitter, Receiver } from "../utils/transmitter";
import { delayed_cache } from "../utils/helper";

import { on_resized as resize_newton, Newton } from "../positional_rule/impl/newton";
import { on_resized as resize_launcher } from "./impl/launcher_skelton";
import { on_resized as resize_shell } from "./composition/ideal_shell";

import { IdealFirework } from "./composition/ideal_firework";

export const FIREWOKS_AMOUNT = 20;
const fireworks = delayed_cache(() => [...Array(FIREWOKS_AMOUNT)].map(() => new IdealFirework(Newton)));

const [resizer, observer] = create_transmitter<[number, number]>();
observer.subscribe(resize_newton, resize_launcher, resize_shell);

export const skeltons = delayed_cache(() => fireworks().map(f => f.skeltons).flat());

export const amount = (num: number): void => {
    if (num < 1 || num > FIREWOKS_AMOUNT) {
        console.warn('num should be between 1 and 20.');
        return;
    }

    fireworks().forEach((f, i) => i < num ? f.show() : f.hide());
};

export const on_resize: Receiver<[number, number]> = resizer.transmit;
export const reset = (): void => fireworks().forEach(f => f.reset());
export const next = (delta: number): void => fireworks().forEach(f => f.next(delta));
