import { Application, ParticleContainer, Renderer } from 'pixi.js';
import Firework from './fireowrks_parts/firework';
import Star from './fireowrks_parts/star';
import ActivePoint from './math/active_point';
import FireLauncher from './sprite/fire_launcher';
import FireParticle from './sprite/fire_particle';

export default class Fireworks {
    private static BACK_GROUND_COLOR = 'rgb(0, 0, 0)';
    private static RESIDUAL = 'rgba(0, 0, 0, 0.1)';
    private static MAX_FIREWORKS_NUM = 20;

    private app = new Application({
        resolution: 1,
        antialias: true,
        autoDensity: true,
        backgroundColor: 0,
        backgroundAlpha: 0
    });

    private container = new ParticleContainer(
        Fireworks.MAX_FIREWORKS_NUM * (Star.PARTICLE_NUM * 4 + 2),
        { tint: true }
    );

    private ctx = document.createElement("canvas").getContext('2d');

    private fireworks: Firework[] = [];

    private _width: number;
    private _height: number;
    private _amount = 0;

    public get dom(): HTMLCanvasElement {
        return this.ctx.canvas;
    }

    public constructor({ width, height, amount }: Option) {
        FireParticle.RENDERER = this.app.renderer as Renderer;

        this.dom.style.margin = "0";
        this.dom.style.padding = "0";
        this.dom.style.display = "block";

        this.amount = amount;
        this.resize(width, height);

        this.app.ticker.add(this.render.bind(this));
        this.stop();
    }

    public start(): void {
        if (!this.app.ticker.started) {
            this.app.ticker.start();
        }
    }

    public stop(): void {
        if (this.app.ticker.started) {
            this.app.ticker.stop();
        }
    }

    public resize(width: number, height: number): void {
        if (this._width == width && this._height == height) {
            return;
        }

        this._width = width;
        this._height = height;

        this.stop();

        FireParticle.RADIUS = Math.min(width, height) / 250;

        ActivePoint.GRAVITY = -this._height * (1 / 20);
        Star.BASE_VELOCITY = Math.min(width, height) * (2 / 3);

        FireLauncher.VELOCITY = this._height * (2 / 3);
        FireLauncher.BASE = this._height;
        FireLauncher.RANGE = this._width;

        this.ctx.canvas.width = this._width;
        this.ctx.canvas.height = this._height;

        this.clearCanvas();

        this.app.renderer.resize(this._width, this._height);

        for (let i = 0, len = this._amount; i < len; ++i) {
            this.fireworks[i].removeFrom(this.container);
            this.fireworks[i] = new Firework().addTo(this.container);
        }

        this.app.stage.addChild(this.container);
    }

    public set amount(amount: number) {
        if (amount === this._amount) {
            return;
        }

        if (amount < 1) {
            return;
        }

        if (amount > 20) {
            return;
        }

        this.stop();

        const addNum = amount - this._amount;
        this._amount = amount;

        if (addNum > 0) {
            for (let i = 0; i < addNum; ++i) {
                this.fireworks.push(new Firework().addTo(this.container));
            }

            return;
        }

        const popNum = -addNum;
        for (let i = 0; i < popNum; ++i) {
            this.fireworks.pop().removeFrom(this.container);
        }
    }

    private render(): void {
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (let i = 0, len = this.fireworks.length; i < len; ++i) {
            this.fireworks[i].step();
        }

        this.ctx.drawImage(this.app.view, 0, 0);
    }

    private clearCanvas() {
        this.ctx.fillStyle = Fireworks.BACK_GROUND_COLOR;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = Fireworks.RESIDUAL;
    }
}

type Option = {
    width: number;
    height: number;
    amount: number;
}
