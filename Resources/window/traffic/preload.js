const {contextBridge, ipcRenderer} = require("electron");
console.log("ipcRenderer");

contextBridge.exposeInMainWorld("ContentBridge", {
  getSocketPort: () => ipcRenderer.invoke("HTTPRequest.getSocketPort")
});
