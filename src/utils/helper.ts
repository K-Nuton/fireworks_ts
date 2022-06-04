export const rand_range = (min: number, max: number): number => (
    Math.floor(Math.random() * Math.floor(max - min)) + min);

export const random_color = (): number => rand_range(0, 0xffffff);
export const true_or_false = (): boolean => !!rand_range(0, 2);

type Generator<T> = () => T;
export const delayed_cache = <T,>(generator: Generator<T>): Generator<T> => {
    let cache: T;
    return () => cache ?? (cache = generator());
}

const padd_hex = (len: number) => (num: number) => `${'0'.repeat(len)}${num.toString(16)}`.slice(-len);
const padd_hex_6 = padd_hex(6);
const padd_hex_2 = padd_hex(2);

const parseInt16 = (hexs: string) => Number.parseInt(hexs, 16);

export const get_reversed_color = (color: number): number => parseInt16([...Array(3)].fill(padd_hex_6(color))
    .map((h, i) => h.substring(i * 2, (i + 1) * 2))
    .map(parseInt16)
    .reduce((pre, cur) => `${pre}${padd_hex_2(255 - cur)}`, ''));