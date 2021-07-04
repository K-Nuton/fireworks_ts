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

    public unsbscribe(...receivers: Receiver<T>[]): void {
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
