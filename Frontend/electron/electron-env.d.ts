/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
    electron: {
        vault: {
            choose(): Promise<string | null>;
            getTree(): Promise<any>;
        };

        notes: {
            save(path: string | null, content: string): Promise<void>;
            read(path: string): Promise<any>;
            create(type: string);
            delete(type: "file" | "folder", path: string);
            rename(editingPath, editingName)
        };

        settings: {
            get(): Promise<any>;
            save(settings: any): Promise<void>;
            delete(): Promise<void>;
        };
        window: {
            minimize(): Promise<void>;
            maximize(): Promise<void>;
            close(): Promise<void>;
        };
    };
}
