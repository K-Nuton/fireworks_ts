import { Application, Graphics, ParticleContainer, Sprite } from "pixi.js";

/* eslint-disable @typescript-eslint/no-namespace */
namespace broadcast {
    type Validator = { 
        readonly by: (caster: symbol) => void; 
    };

    export type Receiver<T> = (state: T) => void;

    export class Station<T> {
        private receivers = new Set<Receiver<T>>();
        private caster: symbol;
 
        private cb: () => void = () => void(0);
        private validator: Validator = {
            by: (caster: symbol) => {
                if (this.caster !== caster) {
                    throw new Error('Only Station owner could execute Station.clear, Station.broadcast.');
                }
                this.cb();
            }
        } as const;

        public constructor(caster: symbol, ...receivers: Receiver<T>[]) {
            this.caster = caster;
            this.receivers.add = this.receivers.add.bind(this.receivers);
            this.receivers.delete = this.receivers.delete.bind(this.receivers);
            this.receivers.clear = this.receivers.clear.bind(this.receivers);

            this.subscribe(...receivers);
        }

        public subscribe(...receivers: Receiver<T>[]): void {
            receivers.forEach(this.receivers.add);
        }

        public unsubscribe(...receivers: Receiver<T>[]): void {
            receivers.forEach(this.receivers.delete);
        }

        public clear(): Validator {
            this.cb = this.receivers.clear;
            return this.validator;
        }

        public broadcast(state: T): Validator {
            this.cb = () => this.receivers.forEach(broadcast => broadcast(state)); 
            return this.validator;
        }
    }
}


namespace utils {
    export const rand_range = (min: number, max: number): number => Math.floor(Math.random() * Math.floor(max - min)) + min;
    export const random_color = (): number => rand_range(0, 0xffffff);

    export const true_or_false = (): boolean => !!rand_range(0, 2);

    type Generator<T> = () => T;
    export const delayed_cache = <T,>(generator: Generator<T>): Generator<T> => {
        let cache: T;
        return () => cache ?? (cache = generator());
    }
}


namespace global_rect {
    import Station = broadcast.Station;

    const caster = Symbol();
    export const resizer = new Station<[number, number]>(caster);

    let id: number;
    window.addEventListener('resize', function (this: Window) {
        this.clearTimeout(id);

        id = this.setTimeout(
            () => this.requestAnimationFrame(() => resizer.broadcast([this.innerWidth, this.innerHeight]).by(caster)),
            100
        );
    });

    export const resize = (): void => resizer.broadcast([window.innerWidth, window.innerHeight]).by(caster);
}


namespace positional {
    export interface Positional {
        readonly x: number;
        readonly y: number;
        readonly z: number;
    }
}


namespace Point {
    import Positional = positional.Positional;

    export const of = (x: number, y: number, z: number): Positional => ({ x, y, z } as const);
    export const from = ({ x, y, z }: Positional): Positional => of(x, y, z);
    export const ZERO = of(0, 0, 0);
}


namespace Vec3 {
    import Positional = positional.Positional;

    export const decompose = (theta: number, phi: number, radius: number): Positional => Point.of(
        Math.sin(theta) * Math.cos(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(theta) * radius
    );

    export const BASIS = Point.of(1, 1, 1);
}


namespace rule {
    import Positional = positional.Positional;

    export type Rule = (direction: Positional, elapse: number) => number;
    export interface PositionalRule {
        readonly x: Rule;
        readonly y: Rule;
        readonly z: Rule;
    }
}


namespace newton {
    import Receiver = broadcast.Receiver;
    import PositionalRule = rule.PositionalRule;
    import Rule = rule.Rule;

    let g = 1, r = 1, c = 1;
    export const on_resized: Receiver<[number, number]> = ([,h]): void => {
        g = -h * (1 / 20);
        c = Math.pow((r = 2), -2);
    };

    const x_rule: Rule = (v, t) => (v.x / r) * (1 - Math.pow(Math.E, -r * t));
    const y_rule: Rule = (v, t) => ((-g * t) / r) + c * (g + r * v.y) * (1 - Math.pow(Math.E, -r * t));
    const z_rule: Rule = (v, t) => (v.z / r) * (1 - Math.pow(Math.E, -r * t));

    export const Newton = new (class implements PositionalRule {
        public get x(): Rule { return x_rule; }
        public get y(): Rule { return y_rule; }
        public get z(): Rule { return z_rule; }
    })();
}


namespace animator {
    import Station = broadcast.Station;

    export interface Animator<T> {
        reset(): void;
        next(delta: number): void;
        readonly before_animate?: Station<T>;
        readonly on_next_frame?: Station<T>;
        readonly after_animate?: Station<T>;
    }
}


namespace skelton {
    import Animator = animator.Animator;
    import Positional = positional.Positional;

    export interface Skelton extends Positional, Animator<Positional> {
        color: number;
        alpha: number;
    }
}


namespace molecule {
    import Positional = positional.Positional;
    import PositionalRule = rule.PositionalRule;
    import Animator = animator.Animator;

    export class Molecule implements Positional, Animator<Molecule>{
        private rule: PositionalRule;

        private t = 0;
        private p = Point.ZERO;
        private v = Vec3.BASIS;

        public get elapse(): number {
            return this.t;
        }

        public set initial_position(position: Positional) {
            this.p = position;
        }

        public set direction(direction: Positional) {
            this.v = direction;
        }

        public get x(): number {
            return this.p.x + this.rule.x(this.v, this.t);
        }

        public get y(): number {
            return this.p.y + this.rule.y(this.v, this.t);
        }

        public get z(): number {
            return this.p.z + this.rule.z(this.v, this.t);
        }

        public constructor(rule: PositionalRule) {
            this.rule = rule;
        }

        public reset(): void {
            this.t = 0;
        }

        public next(delta: number): void {
            this.t += delta;
        }
    }
}


namespace skelton_star {
    import Station = broadcast.Station;
    import PositionalRule = rule.PositionalRule;
    import Skelton = skelton.Skelton;
    
    import Molecule = molecule.Molecule;
    
    const { rand_range } = utils;

    const get_life = (): number => 2.5 * (rand_range(93, 101) / 100);

    const caster = Symbol()

    export class SkeltonStar extends Molecule implements Skelton {
        public static emerge(rule: PositionalRule): SkeltonStar {
            return new SkeltonStar(rule);
        }

        private life = get_life();

        private c = 0xffffff;
        public set color(color: number) {
            if (color < 0) {
                this.c = 0;
            } else if (color > 0xffffff) {
                this.c = 0xffffff;
            } else {
                this.c = color;
            }
        }
        public get color(): number {
            return this.c;
        }

        private a = 0;
        public get alpha(): number {
            return this.a;
        }
        public set alpha(alpha: number) {
            if (alpha < 0) {
                this.a = 0;
            } else if (alpha > 1) {
                this.a = 1;
            } else {
                this.a = alpha;
            }
        }

        public get is_dead(): boolean {
            return this.elapse > this.life;
        }

        private before = new Station<SkeltonStar>(caster)
        public get before_animate(): Station<SkeltonStar> {
            return this.before;
        }

        private update = new Station<SkeltonStar>(caster);
        public get on_next_frame(): Station<SkeltonStar> {
            return this.update;
        }

        private after = new Station<SkeltonStar>(caster);
        public get after_animate(): Station<SkeltonStar> {
            return this.after;
        }

        private constructor(rule: PositionalRule) {
            super(rule);
        }

        public next(delta: number): void {
            if (this.is_dead) return;

            super.next(delta);

            this.is_dead ? void (this.a = 0) ?? this.after.broadcast(this).by(caster) : this.update.broadcast(this).by(caster);
        }

        public reset(): void {
            super.reset();
            this.a = 1;
            this.life = get_life();
            this.before.broadcast(this).by(caster);
        }
    }
}


namespace skelton_launcher {
    const { rand_range } = utils;
    
    import Positional = positional.Positional;
    import PositionalRule = rule.PositionalRule;
    import Skelton = skelton.Skelton;

    import Station = broadcast.Station;
    import Receiver = broadcast.Receiver;
    
    import Molecule = molecule.Molecule;

    const PI_HALF = Math.PI / 2;

    let [w, h] = [0, 0];
    export const on_resized: Receiver<[number, number]> = (rect): void => void ([w, h] = rect);

    const get_position = (): Positional => Point.of(w * (rand_range(100, 900) / 1000), h, 0);
    const get_direction = (): Positional => Vec3.decompose(PI_HALF, -PI_HALF, h * (rand_range(100, 200) / 100) * (6 / 10));

    const caster = Symbol();

    export class SkeltonLauncher extends Molecule implements Skelton {
        public static emerge(rule: PositionalRule): SkeltonLauncher {
            return new SkeltonLauncher(rule);
        }

        public get color(): number {
            return 0xffffff;
        }

        private a = 0;
        public get alpha(): number {
            return this.a;
        }
        public set alpha(alpha: number) {
            if (alpha < 0) {
                this.a = 0;
            } else if (alpha > 1) {
                this.a = 1;
            } else {
                this.a = alpha;
            }
        }

        private before = new Station<SkeltonLauncher>(caster);
        public get before_animate(): Station<SkeltonLauncher> {
            return this.before;
        }

        private update = new Station<SkeltonLauncher>(caster);
        public get on_next_frame(): Station<SkeltonLauncher> {
            return this.update;
        }

        private after = new Station<SkeltonLauncher>(caster);
        public get after_animate(): Station<SkeltonLauncher> {
            return this.after;
        }

        private constructor(rule: PositionalRule) {
            super(rule);
        }

        public next(delta: number): void {
            const last_y = this.y;
            super.next(delta);

            last_y >= this.y ? this.update.broadcast(this).by(caster) : void (this.a = 0) ?? this.after.broadcast(this).by(caster);
        }

        public reset(): void {
            super.reset();
            this.a = 1;
            this.initial_position = get_position();
            this.direction = get_direction();
            this.before.broadcast(this).by(caster);
        }
    }
}


namespace ideal_shell {
    const { rand_range, random_color } = utils;

    import Positional = positional.Positional;
    import PositionalRule = rule.PositionalRule;
    import Animator = animator.Animator;
    
    import Station = broadcast.Station;
    import Receiver = broadcast.Receiver;
    
    import SkeltonStar = skelton_star.SkeltonStar;

    export const PARTICLE_NUM = 150;
    const RANDOM_LEVEL = 400;
    const GOLDEN_SPIRAL = Math.PI * (1 + Math.sqrt(5));
    const PI_HALF = Math.PI / 2;

    let shorter = 0;
    export const on_resized: Receiver<[number, number]> = ([w, h]): void => void (shorter = Math.min(w, h));
    const get_velocity = (): number => shorter * (8 / 10) * (rand_range(70, 111) / 100);

    const caster = Symbol();

    export class IdealShell implements Positional, Animator<IdealShell> {
        public static emerge(rule: PositionalRule, reduction = 1): IdealShell {
            return new IdealShell(rule, reduction);
        }

        private s: SkeltonStar[];
        public get stars(): SkeltonStar[] {
            return this.s;
        }

        private c = Point.ZERO;

        public get x(): number {
            return this.c.x;
        }

        public get y(): number {
            return this.c.y;
        }

        public get z(): number {
            return this.c.z;
        }

        public set alpha(alpha: number) {
            this.stars.forEach(s => s.alpha = alpha);
        }

        public set center(center: Positional) {
            this.c = center;
        }

        private before = new Station<IdealShell>(caster);
        public get before_animate(): Station<IdealShell> {
            return this.before;
        }

        private after = new Station<IdealShell>(caster);
        public get after_animate(): Station<IdealShell> {
            return this.after;
        }

        private reduction: number;

        private constructor(rule: PositionalRule, reduction = 1) {
            this.reduction = reduction;
            this.s = [...Array(PARTICLE_NUM)].map(() => SkeltonStar.emerge(rule));
        }

        public get is_dead(): boolean {
            return this.s.every(s => s.is_dead);
        }

        public reset(): void {
            const radius = get_velocity() * this.reduction;
            const color = random_color();

            let i = 0, t = Math.random(), r = 0;
            let theta: number, phi: number;
            let star: SkeltonStar;
            while (i < PARTICLE_NUM) {
                theta = Math.acos(1 - t / PARTICLE_NUM);
                r = rand_range(RANDOM_LEVEL - 1, RANDOM_LEVEL + 2) / RANDOM_LEVEL;

                if (theta > PI_HALF) {
                    t += r;
                    continue;
                }

                phi = GOLDEN_SPIRAL * t;
                t += r;

                star = this.s[i];
                star.initial_position = this;
                star.direction = Vec3.decompose(theta, phi, radius);
                star.color = color;

                i++;
            }

            this.s.forEach(star => star.reset());
            this.before.broadcast(this).by(caster);
        }

        public next(delta: number): void {
            this.s.forEach(star => star.next(delta));

            if (this.is_dead) {
                this.after.broadcast(this).by(caster);
            }
        }
    }
}


namespace ideal_firework {
    const { rand_range, true_or_false } = utils;

    import PositionalRule = rule.PositionalRule;

    import Animator = animator.Animator;
    import Skelton = skelton.Skelton;

    import SkeltonLauncher = skelton_launcher.SkeltonLauncher;
    import IdealShell = ideal_shell.IdealShell;

    const get_sleep_time_ms = (): number => rand_range(0, 5000);

    export class IdealFirework implements Animator<IdealFirework> {
        private launcher: SkeltonLauncher;
        private shell: IdealShell;
        private sub_shell: IdealShell;

        private update: (delta: number) => void = () => void (0);
        private id: NodeJS.Timeout;

        private is_hidden = true;

        public get skeltons(): Skelton[] {
            return [this.launcher, ...this.sub_shell.stars, ...this.shell.stars];
        }

        public constructor(rule: PositionalRule) {
            this.launcher = SkeltonLauncher.emerge(rule);
            this.shell = IdealShell.emerge(rule);
            this.sub_shell = IdealShell.emerge(rule);

            this.launcher.after_animate.subscribe(this.after_launcher_animate.bind(this));
            this.shell.after_animate.subscribe(this.after_shell_animate.bind(this));

            this.reset();
        }

        public reset(): void {
            clearTimeout(this.id);

            this.id = setTimeout(() => {
                this.launcher.reset();
                this.is_hidden && void (this.launcher.alpha = 0);
                this.update = delta => this.launcher.next(delta);
            }, get_sleep_time_ms());
        }

        public next(delta: number): void {
            this.update(delta);
        }

        private after_launcher_animate(launcher: SkeltonLauncher) {
            this.shell.center = launcher;
            this.sub_shell.center = launcher;

            this.update = delta => {
                this.shell.next(delta);
                this.sub_shell.next(delta);
            };

            this.shell.reset();
            this.sub_shell.reset();

            this.is_hidden && void (this.shell.alpha = 0);
            (this.is_hidden || true_or_false()) && void (this.sub_shell.alpha = 0);
        }

        private after_shell_animate(): void {
            this.reset();
        }

        public hide(): void {
            this.is_hidden = true;
        }

        public show(): void {
            this.is_hidden = false;
        }
    }
}


namespace ideal_fireworks {
    import Station = broadcast.Station;
    import Receiver = broadcast.Receiver;

    import IdealFirework = ideal_firework.IdealFirework;

    const { delayed_cache } = utils;

    const { on_resized: n_resize, Newton } = newton;
    const { on_resized: l_resize } = skelton_launcher;
    const { on_resized: s_resize } = ideal_shell;

    export const FIREWOKS_AMOUNT = 20;

    const fireworks = delayed_cache(() => [...Array(FIREWOKS_AMOUNT)].map(() => new IdealFirework(Newton)));

    const caster = Symbol();
    const handler = new Station<[number, number]>(caster, n_resize, l_resize, s_resize);

    export const skeltons = delayed_cache(() => fireworks().map(f => f.skeltons).flat());

    export const amount = (num: number): void => {
        if (num < 1 || num > FIREWOKS_AMOUNT) {
            console.warn('num should be between 1 and 20.');
            return;
        }

        fireworks().forEach((f, i) => i < num ? f.show() : f.hide());
    }

    export const on_resize: Receiver<[number, number]> = new_rect => handler.broadcast(new_rect).by(caster);
    export const reset = (): void => fireworks().forEach(f => f.reset());
    export const next = (delta: number): void => fireworks().forEach(f => f.next(delta));
}


namespace pixi_context {
    const { delayed_cache } = utils;

    import Receiver = broadcast.Receiver;

    export const app = delayed_cache(() => {
        const app = new Application({
            resolution: 1,
            antialias: true,
            autoDensity: true,
            backgroundColor: 0,
            backgroundAlpha: 0
        });
        app.ticker.autoStart = false;

        return app;
    });

    export const on_resize: Receiver<[number, number]> = ([w, h]): void => app().renderer.resize(w, h);
}


namespace canvas_context {
    const { delayed_cache } = utils;
    
    import Receiver = broadcast.Receiver;

    const ctx = delayed_cache(() => {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.style.display = 'block';
        return ctx;
    });

    const BLACK = 'rgba(0, 0, 0, 1)';
    const RESIDUAL = 'rgba(0, 0, 0, 0.1)';

    export const canvas = (): HTMLCanvasElement => ctx().canvas;

    let get_frame: (delta: number) => HTMLCanvasElement;
    export const on_render = (on_render: (delta: number) => HTMLCanvasElement): void => void (get_frame = on_render);

    export const render = (delta: number): void => {
        ctx().fillRect(0, 0, canvas().width, canvas().height);
        ctx().drawImage(get_frame(delta), 0, 0);
    };

    export const on_resize: Receiver<[number, number]> = ([w, h]): void => {
        [canvas().width, canvas().height] = [w, h];
        ctx().fillStyle = BLACK;
        ctx().fillRect(0, 0, w, h);
        ctx().fillStyle = RESIDUAL;
    }
}


namespace firesprite {
    const { delayed_cache } = utils;
    const { app } = pixi_context;
    
    import Station = broadcast.Station;
    import Receiver = broadcast.Receiver;
    
    import Skelton = skelton.Skelton;

    const get_circle = delayed_cache(() => app().renderer.generateTexture(
        new Graphics()
            .beginFill(0xffffff, 1)
            .drawCircle(0, 0, 500)
            .endFill()
    ));

    const caster = Symbol();
    const handler = new Station<number>(caster);
    export const on_resize: Receiver<[number, number]> = ([w, h]): void => handler.broadcast(
        Math.max(2, Math.min(5, Math.min(w, h) / 100))
    ).by(caster);

    export class FireSprite extends Sprite {
        public static fromSkelton(core: Skelton): FireSprite {
            return new FireSprite(core);
        }

        private highlight = new Sprite(get_circle());

        public get sprites(): [Sprite, Sprite] {
            return [this, this.highlight];
        }

        private constructor(core: Skelton) {
            super(get_circle());

            this.tint = core.color;
            this.anchor.set(0.5);
            this.alpha = 0;

            this.highlight.anchor.set(0.5);
            this.highlight.alpha = 0;

            this.position.scope = this;
            this.position.cb = function (this: FireSprite): void {
                this.highlight.position.set(this.x, this.y);
            };

            this.scale.scope = this;
            this.scale.cb = function (this: FireSprite): void {
                this.highlight.scale.set(this.scale.x * 0.6);
            };

            core.before_animate.subscribe(this.before_animate.bind(this));
            core.on_next_frame.subscribe(this.on_next_frame.bind(this));
            core.after_animate.subscribe(this.after_animate.bind(this));

            handler.subscribe(this.on_scale_changed.bind(this));
            this.on_scale_changed(2);
        }

        private before_animate({ x, y, color }: Skelton): void {
            this.position.set(x, y);
            this.tint = color;
            this.alpha = this.highlight.alpha = 0;
        }

        private on_next_frame({ x, y, alpha }: Skelton): void {
            if (alpha === 0 && this.alpha === 0) {
                return;
            }

            this.position.set(x, y);

            if (this.alpha !== alpha) {
                this.alpha = this.highlight.alpha = alpha;
            }
        }

        private after_animate({ alpha }: Skelton): void {
            this.alpha = this.highlight.alpha = alpha;
        }

        private on_scale_changed(scale: number): void {
            this.scale.set(scale / get_circle().width);
        }
    }
}


namespace pixi_loader {
    import Skelton = skelton.Skelton;
    import FireSprite = firesprite.FireSprite;

    export const load = (skeltons: Skelton[]): Sprite[] => skeltons.map(FireSprite.fromSkelton).map(fp => fp.sprites).flat();
}


namespace fireworks {
    const { delayed_cache } = utils;
    const { on_resize: on_resize_p, app } = pixi_context;
    const { on_resize: on_resize_s } = firesprite;
    const { on_resize: on_resize_c, canvas, render, on_render } = canvas_context;
    const { on_resize: on_resize_f, skeltons, next, amount } = ideal_fireworks;
    const { load } = pixi_loader;
    
    const { PARTICLE_NUM } = ideal_shell;
    const FIREWOKS_AMOUNT = 20;

    import Station = broadcast.Station;

    export const init = delayed_cache(() => {
        app().stage.addChild(new ParticleContainer(
            FIREWOKS_AMOUNT * (PARTICLE_NUM * 2 + 1) * 2,
            { tint: true, scale: true }
        ))
        .addChild(...load(skeltons()));

        const caster = Symbol();
        const resizer = new Station<[number, number]>(
            caster,
            on_resize_c,
            on_resize_f,
            on_resize_p,
            on_resize_s
        );

        on_render(delta => void (next(delta)) ?? app().view);

        app().ticker.add(scale => render((scale * app().ticker.deltaMS) / 1000));
        app().ticker.stop();

        return {
            start: () => app().ticker.start(),
            stop: () => app().ticker.stop(),
            amount,
            resize: (w: number, h: number) => resizer.broadcast([w, h]).by(caster),
            view: canvas()
        } as const;
    });
}

const { init } = fireworks;
const { resizer, resize } = global_rect;

const hanabi = init();

document.getElementById('app').appendChild(hanabi.view)
resizer.subscribe(rect => hanabi.resize(...rect));
resize();

hanabi.amount(7);
hanabi.start();

