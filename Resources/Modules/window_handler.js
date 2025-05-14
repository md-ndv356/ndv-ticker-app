/** ウィンドウ管理 */

const { ipcMain, BrowserWindow } = require("electron");
const path = require("path");

let Windows = { main: null, settings: null, info: null, traffic: null };

// handle: リサイズの設定を変更
ipcMain.handle("setIsResizable", (sender, isResizable) => {
  Windows.main.setResizable(isResizable);
});

const PreventClosing = event => { if (!event.sender.closeable){ event.preventDefault(); } };

const CreateMainWindow = (options) => {
  // Create a browser window.
  Windows.main = new BrowserWindow({
    width: 1212,
    height: 128,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../window/Main/main-preload.js')
    },
    resizable: false,
    frame: false
  });
  if (Object.hasOwn((options ?? {}), "closeable")) Windows.main.closeable = !!options?.closeable; else Windows.main.closeable = true;
  Windows.main.on("close", PreventClosing);
  Windows.main.on("closed", function() {
    Windows.main = null;
  });
  Windows.main.loadFile(path.join(__dirname, '../window/Main/main-window.html'));
  Windows.main.webContents.openDevTools();
  Windows.main.webContents.send("sendInitStat", {
    visible: true,
    stat: false
  });
};
const ShowSettingsWindow = () => {
  Windows.settings = new BrowserWindow({
    width: 875,
    height: 666,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../window/setting/preload.js')
    },
    resizable: true
  });
  Windows.settings.on('closed', function() {
    Windows.settings = null;
  });
  Windows.settings.loadFile(path.join(__dirname, '../window/setting/index.html'));
};
const ShowInfoWindow = () => {
  Windows.info = new BrowserWindow({
    width: 800,
    height: 450,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../window/info/preload.js')
    },
    resizable: true
  });
  Windows.info.on('closed', function() {
    Windows.info = null;
  });
  Windows.info.loadFile(path.join(__dirname, '../window/info/index.html'));
};
const ShowTrafficWindow = () => {
  Windows.traffic = new BrowserWindow({
    width: 800,
    height: 450,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../window/traffic/preload.js')
    },
    resizable: true
  });
  Windows.traffic.on('closed', function() {
    Windows.traffic = null;
  });
  Windows.traffic.loadFile(path.join(__dirname, '../window/traffic/index.html'));
};

module.exports = {
  open: function (name, options){
    switch (name) {
      case "main":
        if (!Windows.main) CreateMainWindow(options);
        break;
      case "settings":
        if (!Windows.settings) ShowSettingsWindow(options);
        break;
      case "information":
        if (!Windows.info) ShowInfoWindow(options);
        break;
      case "traffic":
        if (!Windows.traffic) ShowTrafficWindow(options);
        break;
    }
  },
  setCloseable: function (name, value){
    if (!Object.hasOwn(Windows, name)) return null;
    Windows[name].closeable = value;
  }
};