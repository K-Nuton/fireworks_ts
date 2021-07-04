import SimplePoint from "../math/simple_point";
import FireParticle from "./fire_particle";
import { rand_range } from "../math/random";
import Vec3 from "../math/vec3";

export default class FireLauncher extends FireParticle {
    public static BASE: number;
    public static RANGE: number;
    public static VELOCITY: number;

    public static get RANDOM_X(): number {
        return rand_range(FireLauncher.RANGE * 0.1, FireLauncher.RANGE * 0.9);
    }

    public constructor() {
        super(1);

        this.life = 10000;
        this.init();
    }

    public init(): void {
        this.setStartPoint(new SimplePoint(FireLauncher.RANDOM_X, FireLauncher.BASE, 0))
            .setVector(
                Vec3.PI_HALF, -Vec3.PI_HALF, rand_range(FireLauncher.VELOCITY, FireLauncher.VELOCITY * 2.5)
            );
    }

}
