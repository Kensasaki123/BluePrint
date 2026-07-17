import { app } from "electron";
import path from "node:path";
import fs from "node:fs/promises";

export interface Settings {
    vaultPath: string | null;
}

export class SettingsService {
    private static getSettingsPath() { 
        return path.join(
            app.getPath("userData"), // this returns the path where our OS stores userData or FIle Data
            "settings.json" // this appends setting.json to that path where we store our stuff
        );
    }

    static async load(): Promise<Settings>{ // Typscript could infer what type is being returned, so there was really no need to write what's being returned
        try {
            const settingsPath = this.getSettingsPath(); // calls the above static function and gets the path

            const data = await fs.readFile(settingsPath, "utf-8") // reads the files inside as utf-8

            return JSON.parse(data) as Settings; // returns the info as the object, vault path is already defined above and most probably the json also have a vaultPath field in it
        } catch (error: any) {
            if (error.code === "ENOENT") { // this error means if the file doesnt exist, it will return a pre made object with vaultPath empty.
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

    static async delete(): Promise<void> {
        try {
            const settingsPath = this.getSettingsPath();
            await fs.unlink(settingsPath);
        } catch (err: any) {
            if (err.code === 'ENOENT') return; // file doesn't exist
            throw err;
        }
    }
}
