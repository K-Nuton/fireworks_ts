import Point from './point';

export default class Vec3 implements Point {
    public static PI_HALF = Math.PI / 2;
    public static PI_QUARTER = Math.PI / 4;
    public static ROOT2 = Math.sqrt(2);

    private _x: number;
    private _y: number;
    private _z: number;

    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get z(): number { return this._z; }

    public constructor(
        theta: number = Vec3.PI_HALF, phi: number = Vec3.PI_QUARTER, radius: number = Vec3.ROOT2
    ) {
        this.decomposition(theta, phi, radius);
    }

    public decomposition(
        theta: number = Vec3.PI_HALF, phi: number = Vec3.PI_QUARTER, radius: number = Vec3.ROOT2
    ): void {
        this._x = radius * Math.sin(theta) * Math.cos(phi);
        this._y = radius * Math.sin(theta) * Math.sin(phi);
        this._z = radius * Math.cos(theta);
    }
}
