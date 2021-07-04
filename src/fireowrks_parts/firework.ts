import { Container } from "pixi.js";
import { random_color, rand_range } from "../math/random";
import Animationable from "../sprite/animationable";
import FireLauncher from "../sprite/fire_launcher";
import Star from "./star";

export default class Firework implements Animationable {
    private static SLEEP_BASE_TIME = 5000;
    private static BURST_TIME = 2500;

    private launcher = new FireLauncher();
    private star = new Star(1).disappear();
    private sub_star = new Star(0.7).disappear();

    private last_launcher_y: number;

    private time_start_burst: number;
    private time_start_sleep: number;

    private sleep_time_length: number;
    private show_sub_layer: boolean;

    private _step_func: () => void = this.sleep;

    public constructor() {
        this.switch_burst2sleep();
    }

    public get step(): () => void {
        return this._step_func;
    }

    public addTo(container: Container): Firework {
        this.star.addTo(container);
        this.sub_star.addTo(container);
        this.launcher.addTo(container);
        return this;
    }

    public removeFrom(container: Container): Firework {
        this.star.removeFrom(container);
        this.sub_star.removeFrom(container);
        this.launcher.removeFrom(container);
        
        return this;
    }

    private launch(): void {
        if (this.last_launcher_y < this.launcher.y) {
            this.switch_launch2burst();
            return;
        }

        this.last_launcher_y = this.launcher.y;
        this.launcher.step();
    }

    private burst(): void {
        if (performance.now() - this.time_start_burst > Firework.BURST_TIME) {
            this.switch_burst2sleep();
            return;
        }

        this.star.step();
        this.sub_star.step();
    }

    private sleep(): void {
        if (performance.now() - this.time_start_sleep > this.sleep_time_length) {
            this.switch_sleep2launch();
        }
    }

    private switch_launch2burst(): void {
        this.launcher.disappear();
        this.show_sub_layer = !!rand_range(0, 2);

        this.star.setCenter(this.launcher).color = random_color();
        this.sub_star.setCenter(this.launcher).color = random_color();

        this.star.appear();
        this.show_sub_layer && this.sub_star.appear();

        this.time_start_burst = performance.now();
        this._step_func = this.burst;
    }

    private switch_burst2sleep(): void {
        this.star.disappear();
        this.sub_star.disappear();
        this.launcher.disappear();
        
        this.sleep_time_length = rand_range(0, Firework.SLEEP_BASE_TIME);
        this.time_start_sleep = performance.now();

        this._step_func = this.sleep;
    }

    private switch_sleep2launch(): void {
        this.last_launcher_y = FireLauncher.BASE;

        this.launcher.init();
        this.launcher.appear();

        this._step_func = this.launch;
    }

}
