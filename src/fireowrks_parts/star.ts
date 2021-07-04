import { Container } from "pixi.js";
import Point from "../math/point";
import { rand_range } from "../math/random";
import SimplePoint from "../math/simple_point";
import Vec3 from "../math/vec3";
import Animationable from "../sprite/animationable";
import FireParticle from "../sprite/fire_particle";

export default class Star implements Animationable, Point {
    public static BASE_VELOCITY: number;

    public static PARTICLE_NUM = 150;
    
    private static RANDOM_LEVEL = 400;
    private static GOLDEN_SPIRAL = Math.PI * (1 + Math.sqrt(5));

    private stars: FireParticle[];
    private center = new SimplePoint();
    private reduction_ratio: number;

    public set color(color: number) {
        for (let i = 0, len = this.stars.length; i < len; ++i) {
            this.stars[i].tint = color;
        }
    }

    public get x(): number {
        return this.center.x;
    }

    public get y(): number {
        return this.center.y;
    }

    public get z(): number {
        return this.center.z;
    }

    public constructor(reductant_ratio = 1) {
        this.reduction_ratio = reductant_ratio;
        this.stars = [...Array(Star.PARTICLE_NUM)]
            .map(() => new FireParticle(reductant_ratio));

        this.place_stars_in_hemisphere();
    }

    public setCenter(center: Point): Star {
        [this.center.x, this.center.y, this.center.z]
            = [center.x, center.y, center.z];

        this.place_stars_in_hemisphere();

        return this;
    }

    public step(): void {
        for (let i = 0, len = this.stars.length; i < len; ++i) {
            this.stars[i].step();
        }
    }

    public appear(): Star {
        for (let i = 0, len = this.stars.length; i < len; ++i) {
            this.stars[i].appear();
        }

        return this;
    }

    public disappear(): Star {
        for (let i = 0, len = this.stars.length; i < len ;++i) {
            this.stars[i].disappear();
        }

        return this;
    }

    private place_stars_in_hemisphere(): void {
        const velocity = Star.BASE_VELOCITY * (rand_range(70, 111) / 100) * this.reduction_ratio;
        let i = 0, t = Math.random(), r = 0;
        let theta, phi;

        while (i < Star.PARTICLE_NUM) {
            theta = Math.acos(1 - t / Star.PARTICLE_NUM);
            r = rand_range(Star.RANDOM_LEVEL - 1, Star.RANDOM_LEVEL + 2) / Star.RANDOM_LEVEL;

            if (theta > Vec3.PI_HALF) {
                t += r;
                continue;
            }

            phi = Star.GOLDEN_SPIRAL * t;
            t += r;

            this.stars[i]
                .setStartPoint(this.center)
                .setVector(theta, phi, velocity);
            i++;
        }
    }

    public addTo(container: Container): void {
        for (let i = 0, len = this.stars.length; i < len; ++i) {
            this.stars[i].addTo(container);
        }
    }

    public removeFrom(container: Container): void {
        for (let i = 0, len = this.stars.length; i < len; i++) {
            this.stars[i].removeFrom(container);
        }
    }
}
