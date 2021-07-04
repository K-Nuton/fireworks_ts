import Point from './point';

export default class SimplePoint implements Point {
    private _x: number;
    private _y: number;
    private _z: number;

    public constructor(x=0, y=0, z=0) {
        [this._x, this._y, this._z] = [x, y, z];
    }

    public get x(): number {
        return this._x;
    }

    public set x(x: number) {
        this._x = x;
    }

    public get y(): number {
        return this._y;
    }

    public set y(y: number) {
        this._y = y;
    }

    public get z(): number {
        return this._z;
    }

    public set z(z: number) {
        this._z = z;
    }
}
