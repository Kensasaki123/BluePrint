"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  vault: {
    choose: () => electron.ipcRenderer.invoke("vault:choose")
  },
  notes: {
    save: () => electron.ipcRenderer.invoke("notes:save"),
    read: () => electron.ipcRenderer.invoke("notes:read")
  },
  settings: {
    get: () => electron.ipcRenderer.invoke("settings:get"),
    save: (settings) => electron.ipcRenderer.invoke("settings:save", settings)
  }
});
