"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // "electron here is the name of the api key we'll be using in the app. for eg: window.electron.vault.choose()"
  vault: {
    // another namespace window.electron.vault, everything beneath is a method
    choose: () => electron.ipcRenderer.invoke("vault:choose"),
    getTree: () => electron.ipcRenderer.invoke("vault:gettree")
  },
  notes: {
    // another namespace window.electron.notes, everything beneath is a method
    save: (path, content) => electron.ipcRenderer.invoke("notes:save", path, content),
    read: (path) => electron.ipcRenderer.invoke("notes:read", path),
    create: (type) => electron.ipcRenderer.invoke("notes:create", type),
    delete: (type, path) => electron.ipcRenderer.invoke("notes:delete", type, path),
    rename: (editingPath, editingName) => electron.ipcRenderer.invoke("notes:rename", editingPath, editingName)
  },
  settings: {
    // another namespace window.electron.settings, everything beneath is a method
    get: () => electron.ipcRenderer.invoke("settings:get"),
    save: (settings) => electron.ipcRenderer.invoke("settings:save", settings),
    delete: () => electron.ipcRenderer.invoke("settings:delete")
  },
  window: {
    minimize: () => electron.ipcRenderer.invoke("window:minimize"),
    maximize: () => electron.ipcRenderer.invoke("window:maximize"),
    close: () => electron.ipcRenderer.invoke("window:close")
  }
});
