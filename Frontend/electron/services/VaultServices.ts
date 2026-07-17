import fs from "node:fs/promises"
import { SettingsService } from "./SettingsService"
import nodePath from "node:path"
import path from "node:path"

export interface Setting {
    vaultPath: String | null
}

export type treeNode = {
    name: string,
    path: string,
    extension: string,
    type: "file" | "folder",
    children?: treeNode[]
}

async function buildTree(dir: string): Promise<treeNode[]> {
    const entries = await fs.readdir(dir, {
        withFileTypes: true
    })

    return Promise.all(
        entries.map(async (entry): Promise<treeNode> => {
            const fullPath = nodePath.join(dir, entry.name)

            if(entry.isDirectory()) {
                return{
                name: entry.name,
                path: fullPath,
                extension: "",
                type: "folder",
                children: await buildTree(fullPath)
            }}

            return{
                name: entry.name,
                path: fullPath,
                extension: path.extname(entry.name).toLowerCase(),
                type: "file"
            }
        })
    )
}

export class VaultServices {
    static async getTree() {

    const settings = await SettingsService.load();

     if(!settings.vaultPath) {
        throw new Error("Vault path not configured")

     }
     return buildTree(settings.vaultPath)
    }
}