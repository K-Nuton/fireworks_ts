import { rand_range, true_or_false } from "../../utils/helper";

import { PositionalRule } from "../../positional_rule/protocol/positional_rule";

import { Animator } from "../../animator/protocol/animator";
import { Skelton } from "../protocol/skelton";

import { SkeltonLauncher } from "../impl/skelton_launcher";
import { IdealShell } from "./ideal_shell";

const sleep_time_ms = (): number => rand_range(0, 5000);

export class IdealFirework implements Animator<IdealFirework> {
    private readonly launcher: SkeltonLauncher;
    private readonly shell: IdealShell;
    private readonly sub_shell: IdealShell;

    private update: (delta: number) => void = () => void(0);

    private is_hidden = true;

    readonly skeltons: Skelton[];

    constructor(rule: PositionalRule) {
        this.launcher = SkeltonLauncher.emerge(rule);
        this.shell = IdealShell.emerge(rule);
        this.sub_shell = IdealShell.emerge(rule, 0.7);

        this.launcher.after_animate.subscribe(this.after_launcher_animate.bind(this));
        this.shell.after_animate.subscribe(this.after_shell_animate.bind(this));

        this.skeltons = [this.launcher, ...this.sub_shell.stars, ...this.shell.stars];
    }

    reset(): void {
        this.update = this.suspend(sleep_time_ms());
    }

    next(delta: number): void {
        this.update(delta);
    }

    hide(): void {
        this.is_hidden = true;
    }

    show(): void {
        this.is_hidden = false;
        this.reset();
    }

    private after_launcher_animate(launcher: SkeltonLauncher) {
        this.shell.center = launcher;
        this.sub_shell.center = launcher;

        this.update = delta => { this.shell.next(delta); this.sub_shell.next(delta); };

        this.shell.reset();
        this.sub_shell.reset();

        true_or_false() && (this.sub_shell.alpha = 0);
    }

    private after_shell_animate(): void {
        this.reset();
    }

    private suspend(sleep_time: number): (delta: number) => void {
        let elapse = 0;
        return delta => {
            if (this.is_hidden) {
                return;
            }

            if (sleep_time > (elapse += delta * 1000)) {
                return;
            }

            this.launcher.reset();
            this.update = delta => this.launcher.next(delta);
        };
    }
}
