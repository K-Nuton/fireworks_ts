import { Container, Graphics, Renderer, Sprite, Texture } from 'pixi.js';
import { rand_range } from '../math/random';
import ActivePoint from '../math/active_point';
import SimplePoint from '../math/simple_point';
import Vec3 from '../math/vec3';
import Animationable from './animationable';
import Point from '../math/point';

export default class FireParticle extends Sprite implements Point, Animationable {
    public static RADIUS: number;
    private static TEXTURE: Texture = null;

    private static BASE_LIFE = 2500;
    private static HIGHLIGHT_RATIO = 0.6;
    private static HITHLIGHT_COLOR = 0xffffff;

    public static set RENDERER(renderer: Renderer) {
        if (null == this.TEXTURE) {
            this.TEXTURE = renderer.generateTexture(
                new Graphics()
                    .beginFill(0xffffff, 1)
                    .drawCircle(0, 0, 500)
                    .endFill()
            );
        }
    }

    private hightlight = new Sprite(FireParticle.TEXTURE);

    private _life: number = FireParticle.BASE_LIFE * (rand_range(93, 101) / 100);

    private time_appear = performance.now();

    private _point = new ActivePoint(new SimplePoint(), new Vec3());

    public get isAppear(): boolean {
        return 1 === this.alpha;
    }

    public get point(): ActivePoint {
        return this._point;
    }

    public set life(life: number) {
        this._life = life;
    }

    public constructor(scale: number) {
        super(FireParticle.TEXTURE);
        
        this.anchor.set(0.5);
        this.scale.set(FireParticle.RADIUS * scale * 2 / this.texture.width);

        this.hightlight.scale.set(FireParticle.RADIUS * scale * 2 / this.texture.width * FireParticle.HIGHLIGHT_RATIO);
        this.hightlight.tint = FireParticle.HITHLIGHT_COLOR;
        this.hightlight.anchor.set(0.5);
    }

    public setStartPoint(point: Point): FireParticle {
        this._point.setStartPoint(point);
        this.setPosition(point.x, point.y);
        return this;
    }

    public setVector(theta: number, phi: number, radius: number): FireParticle {
        this._point.setVector(theta, phi, radius);

        return this;
    }

    public step(): void {
        if (performance.now() - this.time_appear > this._life && this.isAppear) {
            this.disappear();
        }

        this._point.nextFrame();
        this.setPosition(this.point.x, this.point.y);
    }

    public disappear(): void {
        this.alpha = 0;
        this.hightlight.alpha = 0;
    }

    public appear(): void {
        this.alpha = 1;
        this.hightlight.alpha = 1;
        this.time_appear = performance.now();
    }

    public setPosition(x: number, y: number): void {
        this.position.set(x, y);
        this.hightlight.position.set(x, y);
    }

    public addTo(container: Container): void {
        container.addChild(this);
        container.addChild(this.hightlight);
    }

    public removeFrom(container: Container): void {
        container.removeChild(this);
        container.removeChild(this.hightlight);
    }

    public get z(): number {
        return 0;
    }
}
