export { Rectangle } from '@pixi/math';
export { Ticker } from '@pixi/ticker';
export { ParticleContainer } from '@pixi/particle-container';
export { Sprite } from '@pixi/sprite';
export { Application } from '@pixi/app';
export { Graphics } from '@pixi/graphics';
export { ColorMatrixFilter } from '@pixi/filter-color-matrix';

// Renderer plugins
import { extensions } from '@pixi/core';

import { BatchRenderer } from '@pixi/core';
import { ParticleRenderer } from '@pixi/particle-container';
import { TickerPlugin } from '@pixi/ticker';

extensions.add(BatchRenderer, ParticleRenderer, TickerPlugin);
