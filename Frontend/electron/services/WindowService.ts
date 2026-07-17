import { BrowserWindow } from "electron";

export class WindowService {
    static minimize(window: BrowserWindow) {
        window.minimize();
    }

    static maximize(window: BrowserWindow) {
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    }

    static close(window: BrowserWindow) {
        window.close();
    }
}