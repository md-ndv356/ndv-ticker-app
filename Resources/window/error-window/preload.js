const {contextBridge, ipcRenderer} = require("electron");
console.log("ipcRenderer");

let targetID = process.argv.filter(arg => arg.startsWith("--preload-error-id="))[0].split("=")[1];
console.log("Error ID: " + targetID);
contextBridge.exposeInMainWorld("ContentBridge", {
  getErrorID: () => targetID,
  getErrorInfo: (id) => ipcRenderer.invoke("ErrorHandler.getErrorInfo", id),
  openInDefaultBrowser: (url) => ipcRenderer.invoke("openInDefaultBrowser", url)
});

