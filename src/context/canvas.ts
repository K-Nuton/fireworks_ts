import { Receiver } from "../utils/broadcast";
import { delayed_cache } from "../utils/helper";

const BLACK = 'rgba(0, 0, 0, 1)';
const RESIDUAL = 'rgba(0, 0, 0, 0.1)';

const ctx = delayed_cache(() => {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.style.display = 'block';
    ctx.canvas.style.margin = '0';
    ctx.canvas.style.padding = '0';

    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = RESIDUAL;

    return ctx;
});

export const canvas = (): HTMLCanvasElement => ctx().canvas;

let get_frame: (delta: number) => HTMLCanvasElement;
export const on_render = (on_render: (delta: number) => HTMLCanvasElement): void => void (get_frame = on_render);

export const render = (delta: number): void => {
    ctx().fillRect(0, 0, canvas().width, canvas().height);
    ctx().drawImage(get_frame(delta), 0, 0);
};

export const on_resize: Receiver<[number, number]> = ([w, h]): void => {
    [canvas().width, canvas().height] = [w, h];
    ctx().fillStyle = BLACK;
    ctx().fillRect(0, 0, w, h);
    ctx().fillStyle = RESIDUAL;
}
