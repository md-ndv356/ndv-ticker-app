const {contextBridge, ipcRenderer} = require("electron");
console.log("ipcRenderer");

contextBridge.exposeInMainWorld("ContentBridge", {
  getApplicationState: () => ipcRenderer.invoke("global.getApplicationState"),
  getConfig: () => ipcRenderer.invoke("global.config.get"),
  setConfig: data => ipcRenderer.invoke("global.config.set", data),
  openExternal: url => ipcRenderer.invoke("openInDefaultBrowser", url),
  setWindowOpacity: value => ipcRenderer.invoke("global.config.opacity", value),

  openEditor: () => ipcRenderer.invoke("window.event.openRichEditor"),
  sendToChild: data => ipcRenderer.invoke("window.setting.toChild", data),
  onMessageFromChild: func => ipcRenderer.on("window.setting.fromChild", (event, ...args) => func(...args)),

  // Development helpers
  isDev: () => ipcRenderer.invoke("app.isDev"),
  // getSystemInfo: () => ipcRenderer.invoke("system.getInfo"),
  getVersion: () => ipcRenderer.invoke("app.getVersion"),

  sendError: (data) => ipcRenderer.invoke("ErrorHandler.windowError", data),

  // Debug functionality
  // showDevTools: () => ipcRenderer.invoke("debug.showDevTools"),
  // clearCache: () => ipcRenderer.invoke("debug.clearCache"),
  // sendTestData: (data) => ipcRenderer.invoke("debug.sendTestData", data),
});
