
export type Receiver<T> = (state: T) => unknown;

export type Observer<T> = {
    subscribe(...receivers: Receiver<T>[]): void;
    unsbscribe(...receivers: Receiver<T>[]): void;
};

export type StateHandler<T> = {
    transmit(state: T): void;
    clear(): void;
};

export function create_transmitter<T>(): [StateHandler<T>, Observer<T>] {
    const { subscribe, unsbscribe, transmit, clear } = new Transmitter<T>();

    return [{ transmit, clear } as const, { subscribe, unsbscribe } as const];
}

class Transmitter<T> {
    private readonly receivers = new Set<Receiver<T>>();

    constructor() {
        this.subscribe = this.subscribe.bind(this);
        this.unsbscribe = this.unsbscribe.bind(this);
        this.clear = this.clear.bind(this);
        this.transmit = this.transmit.bind(this);
    }

    subscribe(...receivers: Receiver<T>[]): void {
        receivers.forEach(receiver => this.receivers.add(receiver));
    }

    unsbscribe(...receivers: Receiver<T>[]): void {
        receivers.forEach(receiver => this.receivers.delete(receiver));
    }

    clear(): void {
        this.receivers.clear();
    }

    transmit(state: T): void {
        this.receivers.forEach(transmit => transmit(state));
    }
}
