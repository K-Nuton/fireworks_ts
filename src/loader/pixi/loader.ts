import { Sprite } from "pixi.js";

import { Skelton } from "../../ideal/protocol/skelton";
import { FireSprite } from "./firesprite";

export const load = (skeltons: Skelton[]): Sprite[] => skeltons.map(FireSprite.fromSkelton).map(fs => fs.sprites).flat();
