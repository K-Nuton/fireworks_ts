export const rand_range = (min: number, max: number): number => (
    Math.floor(Math.random() * Math.floor(max - min)) + min);

export const random_color = (): number => rand_range(0, 0xffffff);
export const true_or_false = (): boolean => !!rand_range(0, 2);

type Generator<T> = () => T;
export const delayed_cache = <T,>(generator: Generator<T>): Generator<T> => {
    let cache: T;
    return () => cache ?? (cache = generator());
}
