import { Positional } from "../../positional/protocol/positional";
import { Animator } from "../../animator/protocol/animator";

export interface Skelton extends Positional, Animator<Positional> {
    color: number;
    alpha: number;
    scale?: number;
}
