import * as PIXI from "pixi.js"

import { Receiver } from "../utils/transmitter";
import { delayed_cache } from "../utils/helper";

export const app = delayed_cache(() => new PIXI.Application({
    resolution: 1,
    autoDensity: true,
    backgroundColor: 0,
    backgroundAlpha: 0
}));

export const on_resize: Receiver<[number, number]> = ([w, h]) => {
    app().renderer.resize(w, h)
    app().stage.filterArea = new PIXI.Rectangle(0, 0, w, h);
};
