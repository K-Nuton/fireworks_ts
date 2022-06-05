export const rand_range = (min: number, max: number): number => (
    Math.floor(Math.random() * Math.floor(max - min)) + min);

export const random_color = (): number => rand_range(0, 0xffffff);
export const true_or_false = (): boolean => !!rand_range(0, 2);

type Generator<T> = () => T;
export const delayed_cache = <T,>(generator: Generator<T>): Generator<T> => {
    let cache: T;
    return () => cache ?? (cache = generator());
}

const mask_xor = (mask: number) => (num: number) => mask ^ (mask & num);
const xor_r = mask_xor(0xff0000);
const xor_g = mask_xor(0x00ff00);
const xor_b = mask_xor(0x0000ff);

export const get_reversed_color = (c: number): number => xor_r(c) | xor_g(c) | xor_b(c);
