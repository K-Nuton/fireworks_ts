import { rand_range, true_or_false } from "../../utils/helper";

import { PositionalRule } from "../../positional_rule/protocol/positional_rule";

import { Animator } from "../../animator/protocol/animator";
import { Skelton } from "../protocol/skelton";

import { SkeltonLauncher } from "../impl/skelton_launcher";
import { IdealShell } from "./ideal_shell";

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
