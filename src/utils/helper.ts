export const rand_range = (min: number, max: number) => Math.floor(Math.random() * Math.floor(max - min)) + min;

export const random_color = () => rand_range(0, 0xffffff);
export const true_or_false = () => Math.random() < 0.5;

type Generator<T> = () => T;
export const delayed_cache = <T,>(generator: Generator<T>): Generator<T> => {
    let cache: T;
    return () => cache ?? (cache = generator());
}
