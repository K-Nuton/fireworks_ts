import * as PIXI from "pixi.js"

import { Receiver } from "../utils/broadcast";
import { delayed_cache } from "../utils/helper";

export const app = delayed_cache(() => {
    const app = new PIXI.Application({
        resolution: 1,
        autoDensity: true,
        backgroundColor: 0,
        backgroundAlpha: 0
    });

    const color_matrix_filter = new PIXI.filters.ColorMatrixFilter();
    color_matrix_filter.matrix = [
        -1, 0, 0, 0, 1,
         0,-1, 0, 0, 1,
         0, 0,-1, 0, 1,
         0, 0, 0, 1, 0
    ];

    app.stage.filters = [color_matrix_filter];

    return app;
});

export const on_resize: Receiver<[number, number]> = rect => app().renderer.resize(...rect);
