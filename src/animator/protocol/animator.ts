import { Observer } from "../../utils/transmitter";

export interface Animator<T> {
    reset(): void;
    next(delta: number): void;
    readonly before_animate?: Observer<T>;
    readonly on_next_frame?: Observer<T>;
    readonly after_animate?: Observer<T>;
}
