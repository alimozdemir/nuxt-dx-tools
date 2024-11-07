import type { IDialogPlugin } from "./types/DialogPlugin";

declare module '#app' {
    interface NuxtApp {
        $dialog: IDialogPlugin,
    }
}

export {}