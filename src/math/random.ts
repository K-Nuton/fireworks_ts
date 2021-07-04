export function rand_range(min: number, max: number): number {
    return Math.floor(Math.random() * Math.floor(max -min)) + min;
}

export function random_color(): number {
    return rand_range(0, 16777215);
}

export function longerRect(): number {
    return (window.innerWidth >= window.innerHeight ? window.innerWidth : window.innerHeight);
}

export function shorterRect(): number {
    return (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight);
}
