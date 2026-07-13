import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electron", {

    vault:{
        choose: () => ipcRenderer.invoke("vault:choose"),
    },

    notes:{
        save: () => ipcRenderer.invoke("notes:save"),
        read: () => ipcRenderer.invoke("notes:read"),
    },
    settings: {
        get: () => ipcRenderer.invoke("settings:get"),
        save: (settings) =>
            ipcRenderer.invoke("settings:save", settings),
    }
})