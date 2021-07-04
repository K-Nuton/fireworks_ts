import { Station } from "./broadcast";

const caster = Symbol();
export const resizer = new Station<[number, number]>(caster);
export const resize = (): void => resizer.broadcast([window.innerWidth, window.innerHeight]).by(caster);

let id: number;
window.addEventListener('resize', function(this: Window) {
    this.clearTimeout(id);

    id = this.setTimeout(
        () => this.requestAnimationFrame(() => resizer.broadcast([this.innerWidth, this.innerHeight])),
        100
    );
});
