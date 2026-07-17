import fs from "node:fs/promises"
import { SettingsService } from "./SettingsService"
import path from "node:path";

export class NotesService {
    static async read(filePath: string) {
       return await fs.readFile(filePath, "utf-8")
    }

    static async write(filePath: string, content: string) {
        if (filePath == null || filePath === "") {
            throw new TypeError("path must be a non-empty string")
        }
        console.log("This is hit")
        await fs.writeFile(filePath, content)
    }

    static async create(type: string) {
    try {
        const settings = await SettingsService.load();

        if (!settings.vaultPath) {
            throw new Error("Vault path is not configured.");
        }

        const isFolder = type === "folder";

        let count = 0;

        while (true) {
            const name = isFolder
                ? (count === 0
                    ? "New Folder"
                    : `New Folder (${count})`)
                : (count === 0
                    ? `Untitled${type}`
                    : `Untitled (${count})${type}`);

            const fullPath = path.join(settings.vaultPath, name);

            try {
                if (isFolder) {
                    await fs.mkdir(fullPath);
                } else {
                    await fs.writeFile(fullPath, "", {
                        flag: "wx",
                    });
                }

                return {
                    message: "Success",
                    path: fullPath,
                    name,
                };
            } catch (err: any) {
                if (err.code === "EEXIST") {
                    count++;
                    continue;
                }

                throw err;
            }
        }
    } catch (err: any) {
        console.error(err);

        return {
            message: "Failed",
            error: err.message,
        };
    }
}

    static async delete(type: "file" | "folder", targetPath: string) {
        try {
            if (type == "file") {
               await fs.unlink(targetPath);
               console.log("File Delete");
            } else if (type == "folder") {
                await fs.rm(targetPath, { recursive: true, force: true });
                console.log('Folder deleted successfully!');
            }

            return { message: "Success" };
        } catch (err: any) {
            console.error(err);
            return { message: "Failed", error: err?.message };
        }
    }

    static async rename(oldPath: string, newName: string) {
        try {
            if (!oldPath) {
                throw new Error("Invalid path");
            }

            if (!newName.trim()) {
                throw new Error("Name cannot be empty");
            }
            const parent = path.dirname(oldPath);
            const ext = path.extname(oldPath);

            const isFile = ext !== "";
            const finalName = isFile
                ? `${newName}${ext}`
                : newName;

            const newPath = path.join(parent, finalName);

            await fs.rename(oldPath, newPath);

            return {
                message: "Success",
                path: newPath,
            };
        } catch (err: any) {
            console.error(err);

            return {
                message: "Failed",
                error: err.message,
            };
        }
    }
}