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

const reversed_mask = (mask: number) => (num: number): number => mask ^ (mask & num);
const mask_r = reversed_mask(0xff0000);
const mask_g = reversed_mask(0x00ff00);
const mask_b = reversed_mask(0x0000ff);

export const reverse = (c: number): number => mask_r(c) | mask_g(c) | mask_b(c);
