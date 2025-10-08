const {contextBridge, ipcRenderer} = require("electron");
console.log("ipcRenderer");

contextBridge.exposeInMainWorld("ContentBridge", {
  sendToParent: data => ipcRenderer.invoke("window.setting.toParent", data),
  onMessagefromParent: func => ipcRenderer.on("window.setting.fromParent", (event, ...args) => func(...args)),
});
