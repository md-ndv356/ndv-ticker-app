const {contextBridge, ipcRenderer} = require("electron");
console.log("ipcRenderer");

contextBridge.exposeInMainWorld("ContentBridge", {
  getApplicationState: () => ipcRenderer.invoke("global.getApplicationState"),
  getConfig: () => ipcRenderer.invoke("global.config.get"),
  setConfig: data => ipcRenderer.invoke("global.config.set", data)
});
