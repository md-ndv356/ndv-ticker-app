const {contextBridge, ipcRenderer} = require("electron");
console.log("ipcRenderer");

contextBridge.exposeInMainWorld("ContentBridge", {
  receive: (fun) => ipcRenderer.on("sendToWindow", (event, ...args) => fun(...args)),
  sendError: (data) => ipcRenderer.invoke("ErrorHandler.windowError", data),
  requestAppInfo: () => ipcRenderer.invoke("requestAppInfo"),
  requestUpdateCheck: () => new Promise((resolve, reject) => {
    ipcRenderer.invoke("updateCheck")
      .then((data)=>{resolve(data)})
      .catch((e)=>{reject(e)});
  }),
  syncTime: () => new Promise((resolve, reject) => {
    ipcRenderer.invoke("ntpHandler.syncTime")
      .then((data)=>{resolve(data)})
      .catch((e)=>{reject(e)});
  }),
  getVersions: (ver) => ipcRenderer.invoke("getVersions", ver),
  saveStatus: (value) => ipcRenderer.invoke("saveStatus", value),
  getConfigData: () => ipcRenderer.invoke("global.config.get"),
  allowClosing: () => ipcRenderer.invoke("window.main.closeable"),

  // 脆弱！！！！！！！！！！！！！！channelに任意の文字列を渡せる
  on: (channel, callback) => ipcRenderer.on(channel, (event, argv) => callback(event, argv)),

  // 秘密の関数
  setIsResizable: (value) => ipcRenderer.invoke("setIsResizable", value),
});
