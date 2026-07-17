import { app, BrowserWindow } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { dialog, ipcMain } from "electron";
import { SettingsService } from './services/SettingsService';
import { VaultServices } from './services/VaultServices';
import { NotesService } from './services/NotesService';
import { WindowService } from './services/WindowService';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    frame: false,          // Removes the native title bar
    titleBarStyle: "hidden", // Optional
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
  win.setMenuBarVisibility(false)
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})


// The invoked call is handled here, first args of handle is the 
// IPC channel name that we previously set, second is the function that would do the work
ipcMain.handle("vault:choose", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (result.canceled) {
    return null
  }
  return result.filePaths[0]
})

ipcMain.handle("settings:get", async () => {
    return await SettingsService.load();
});

ipcMain.handle("settings:save", async (_, settings) => {
    await SettingsService.save(settings);
});

ipcMain.handle("settings:delete", async () => {
  await SettingsService.delete();
})

ipcMain.handle("vault:gettree", async () =>{

  return await VaultServices.getTree()
})

ipcMain.handle("notes:read", async (_, path: string) => {
  return await NotesService.read(path)
})

ipcMain.handle("notes:save", async (_, path: string, content: string) => {
  await NotesService.write(path, content)
})

ipcMain.handle("notes:create", async(_, type) => {
  return NotesService.create(type)
})

ipcMain.handle("notes:delete", async(_, type: "file" | "folder", path: string) => {
  return NotesService.delete(type, path)
}) 

ipcMain.handle("notes:rename", async(_, editingPath: any, editingName:any) => {
  NotesService.rename(editingPath, editingName)
})

ipcMain.handle("window:minimize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) WindowService.minimize(win);
});

ipcMain.handle("window:maximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) WindowService.maximize(win);
});

ipcMain.handle("window:close", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) WindowService.close(win);
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => { console.log(app.getPath("userData"));
createWindow()})
