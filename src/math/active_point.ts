import Point from './point';
import Vec3 from './vec3';

export default class ActivePoint implements Point {
    public static GRAVITY: number;

    private static AIR_RESISTANCE = 2;
    private static STEP_INTERVAL = 1 / 60;
    private static ROOT_MINUS2_RESISTANCE = Math.pow(ActivePoint.AIR_RESISTANCE, -2);

    private vector: Vec3;
    private start: Point;
    private elapse = 0;

    private staticVectorX: number;
    private staticVectorY: number;
    private staticVectorZ: number;

    private timeStatic: number;
    private timeStaticY: number;

    public constructor(startPoint: Point, direction: Vec3) {
        this.vector = direction;
        this.start = startPoint;
        this.setTimeStatic();
        this.setVectorStatic();
    }

    public get x(): number {
        return this.start.x + this.staticVectorX * this.timeStatic;
    }

    public get y(): number {
        return this.start.y + this.timeStaticY + this.staticVectorY * this.timeStatic;
    }

    public get z(): number {
        return this.start.z + this.staticVectorZ * this.timeStatic;
    }

    public nextFrame(): void {
        this.elapse += ActivePoint.STEP_INTERVAL;
        this.setTimeStatic();
    }

    public reset(): ActivePoint {
        this.elapse = 0;
        this.setTimeStatic();

        return this;
    }

    public setStartPoint(startPoint: Point): ActivePoint {
        this.start = startPoint;
        this.elapse = 0;
        return this;
    }

    public setVector(theta: number, phi: number, radius: number): void {
        this.vector.decomposition(theta, phi, radius);
        this.setVectorStatic();
    }

    private setVectorStatic(): void {
        this.staticVectorX = this.vector.x / ActivePoint.AIR_RESISTANCE;
        this.staticVectorY = ActivePoint.ROOT_MINUS2_RESISTANCE * (ActivePoint.GRAVITY + ActivePoint.AIR_RESISTANCE * this.vector.y);
        this.staticVectorZ = this.vector.z / ActivePoint.AIR_RESISTANCE;
    }

    private setTimeStatic() {
        this.timeStatic = 1 - Math.pow(Math.E, -ActivePoint.AIR_RESISTANCE * this.elapse);
        this.timeStaticY = (-ActivePoint.GRAVITY * this.elapse) / ActivePoint.AIR_RESISTANCE
    }
}
