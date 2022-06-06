import { filters } from "pixi.js";
import { delayed_cache } from "../utils/helper";

export const reverse_color_filter = delayed_cache(() => {
    const reverse_color_filter = new filters.ColorMatrixFilter();
    reverse_color_filter.matrix = [
        -1, 0, 0, 0, 1,
         0,-1, 0, 0, 1,
         0, 0,-1, 0, 1,
         0, 0, 0, 1, 0,
    ];

    return reverse_color_filter;
});
