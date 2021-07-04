import { Application } from "pixi.js";

import { Receiver } from "../utils/broadcast";
import { delayed_cache } from "../utils/helper";

export const app = delayed_cache(() => new Application({
    resolution: 1,
    antialias: true,
    autoDensity: true,
    backgroundColor: 0,
    backgroundAlpha: 0
}));

export const on_resize: Receiver<[number, number]> = rect => app().renderer.resize(...rect);
