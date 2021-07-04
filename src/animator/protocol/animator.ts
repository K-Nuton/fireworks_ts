import { Station } from "../../utils/broadcast";

export interface Animator<T> {
    reset(): void;
    next(delta: number): void;
    readonly before_animate?: Station<T>;
    readonly on_next_frame?: Station<T>;
    readonly after_animate?: Station<T>;
}
