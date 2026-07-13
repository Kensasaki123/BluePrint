import { app } from "electron"
import path from "node:path"
import fs from "node:fs/promises"

export interface Settings {
    vaultPath: string | null;
}

export class SettingsService {
    private static getSettingsPath() {
        return path.join(
            app.getPath("userData"),
            "settings.json"
        );
    }

    static async load(): Promise<Settings>{
        try {
            const settingsPath = this.getSettingsPath();

            const data = await fs.readFile(settingsPath, "utf-8")

            return JSON.parse(data) as Settings;
        } catch (error: any) {
            if (error.code === "ENOENT") {
                return {
                    vaultPath: null,
                };
            }
            throw error;
        }
    }

    static async save(settings: Settings): Promise<void> {
        const settingsPath = this.getSettingsPath();
        const json = JSON.stringify(settings, null, 2);
        await fs.writeFile(settingsPath, json, "utf-8")
    }
}
