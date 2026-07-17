    // This file is the page, where we can expose context to the react app as well as in electron
    import { ipcRenderer, contextBridge } from 'electron'

    contextBridge.exposeInMainWorld("electron", { // "electron here is the name of the api key we'll be using in the app. for eg: window.electron.vault.choose()"
        
        vault:{ // another namespace window.electron.vault, everything beneath is a method
            choose: () => ipcRenderer.invoke("vault:choose"),
            getTree: () => ipcRenderer.invoke("vault:gettree")
        },
        
        notes:{ // another namespace window.electron.notes, everything beneath is a method
            save: (path: string | null, content: string) => ipcRenderer.invoke("notes:save", path, content),
            read: (path : string) => ipcRenderer.invoke("notes:read", path),
            create: (type: "folder" | string) => ipcRenderer.invoke("notes:create", type),
            delete: (type : "folder" | "file", path: string) => ipcRenderer.invoke("notes:delete", type, path),
            rename: (editingPath: any, editingName:any) => ipcRenderer.invoke("notes:rename", editingPath, editingName)
        },
        
        settings: { // another namespace window.electron.settings, everything beneath is a method
            get: () => ipcRenderer.invoke("settings:get"),
            save: (settings : any) =>
                ipcRenderer.invoke("settings:save", settings),
            delete: () => ipcRenderer.invoke("settings:delete")
        },
        window: {
            minimize: () => ipcRenderer.invoke("window:minimize"),
            maximize: () => ipcRenderer.invoke("window:maximize"),
            close: () => ipcRenderer.invoke("window:close"),
},
    })