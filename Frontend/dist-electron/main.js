import { app, ipcMain, dialog, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
class SettingsService {
  static getSettingsPath() {
    return path.join(
      app.getPath("userData"),
      // this returns the path where our OS stores userData or FIle Data
      "settings.json"
      // this appends setting.json to that path where we store our stuff
    );
  }
  static async load() {
    try {
      const settingsPath = this.getSettingsPath();
      const data = await fs.readFile(settingsPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return {
          vaultPath: null
        };
      }
      throw error;
    }
  }
  static async save(settings) {
    const settingsPath = this.getSettingsPath();
    const json = JSON.stringify(settings, null, 2);
    await fs.writeFile(settingsPath, json, "utf-8");
  }
  static async delete() {
    try {
      const settingsPath = this.getSettingsPath();
      await fs.unlink(settingsPath);
    } catch (err) {
      if (err.code === "ENOENT") return;
      throw err;
    }
  }
}
async function buildTree(dir) {
  const entries = await fs.readdir(dir, {
    withFileTypes: true
  });
  return Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return {
          name: entry.name,
          path: fullPath,
          extension: "",
          type: "folder",
          children: await buildTree(fullPath)
        };
      }
      return {
        name: entry.name,
        path: fullPath,
        extension: path.extname(entry.name).toLowerCase(),
        type: "file"
      };
    })
  );
}
class VaultServices {
  static async getTree() {
    const settings = await SettingsService.load();
    if (!settings.vaultPath) {
      throw new Error("Vault path not configured");
    }
    return buildTree(settings.vaultPath);
  }
}
class NotesService {
  static async read(filePath) {
    return await fs.readFile(filePath, "utf-8");
  }
  static async write(filePath, content) {
    if (filePath == null || filePath === "") {
      throw new TypeError("path must be a non-empty string");
    }
    console.log("This is hit");
    await fs.writeFile(filePath, content);
  }
  static async create(type) {
    try {
      const settings = await SettingsService.load();
      if (!settings.vaultPath) {
        throw new Error("Vault path is not configured.");
      }
      const isFolder = type === "folder";
      let count = 0;
      while (true) {
        const name = isFolder ? count === 0 ? "New Folder" : `New Folder (${count})` : count === 0 ? `Untitled${type}` : `Untitled (${count})${type}`;
        const fullPath = path.join(settings.vaultPath, name);
        try {
          if (isFolder) {
            await fs.mkdir(fullPath);
          } else {
            await fs.writeFile(fullPath, "", {
              flag: "wx"
            });
          }
          return {
            message: "Success",
            path: fullPath,
            name
          };
        } catch (err) {
          if (err.code === "EEXIST") {
            count++;
            continue;
          }
          throw err;
        }
      }
    } catch (err) {
      console.error(err);
      return {
        message: "Failed",
        error: err.message
      };
    }
  }
  static async delete(type, targetPath) {
    try {
      if (type == "file") {
        await fs.unlink(targetPath);
        console.log("File Delete");
      } else if (type == "folder") {
        await fs.rm(targetPath, { recursive: true, force: true });
        console.log("Folder deleted successfully!");
      }
      return { message: "Success" };
    } catch (err) {
      console.error(err);
      return { message: "Failed", error: err == null ? void 0 : err.message };
    }
  }
  static async rename(oldPath, newName) {
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
      const finalName = isFile ? `${newName}${ext}` : newName;
      const newPath = path.join(parent, finalName);
      await fs.rename(oldPath, newPath);
      return {
        message: "Success",
        path: newPath
      };
    } catch (err) {
      console.error(err);
      return {
        message: "Failed",
        error: err.message
      };
    }
  }
}
class WindowService {
  static minimize(window) {
    window.minimize();
  }
  static maximize(window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
  static close(window) {
    window.close();
  }
}
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    frame: false,
    // Removes the native title bar
    titleBarStyle: "hidden",
    // Optional
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.setMenuBarVisibility(false);
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
ipcMain.handle("vault:choose", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths[0];
});
ipcMain.handle("settings:get", async () => {
  return await SettingsService.load();
});
ipcMain.handle("settings:save", async (_, settings) => {
  await SettingsService.save(settings);
});
ipcMain.handle("settings:delete", async () => {
  await SettingsService.delete();
});
ipcMain.handle("vault:gettree", async () => {
  return await VaultServices.getTree();
});
ipcMain.handle("notes:read", async (_, path2) => {
  return await NotesService.read(path2);
});
ipcMain.handle("notes:save", async (_, path2, content) => {
  await NotesService.write(path2, content);
});
ipcMain.handle("notes:create", async (_, type) => {
  return NotesService.create(type);
});
ipcMain.handle("notes:delete", async (_, type, path2) => {
  return NotesService.delete(type, path2);
});
ipcMain.handle("notes:rename", async (_, editingPath, editingName) => {
  NotesService.rename(editingPath, editingName);
});
ipcMain.handle("window:minimize", (event) => {
  const win2 = BrowserWindow.fromWebContents(event.sender);
  if (win2) WindowService.minimize(win2);
});
ipcMain.handle("window:maximize", (event) => {
  const win2 = BrowserWindow.fromWebContents(event.sender);
  if (win2) WindowService.maximize(win2);
});
ipcMain.handle("window:close", (event) => {
  const win2 = BrowserWindow.fromWebContents(event.sender);
  if (win2) WindowService.close(win2);
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  console.log(app.getPath("userData"));
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
