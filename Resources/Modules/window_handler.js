/** ウィンドウ管理 */

const { ipcMain, BrowserWindow } = require("electron");
const path = require("path");

const windows = { main: null, settings: null, info: null, traffic: null, richedit: null };

// handle: リサイズの設定を変更
ipcMain.handle("setIsResizable", (sender, isResizable) => {
  windows.main.setResizable(isResizable);
});
ipcMain.handle("global.config.opacity", (sender, value) => {
  if (windows.main) windows.main.setOpacity(value);
});

ipcMain.handle("window.event.openRichEditor", (sender, data) => {
  if (!windows.settings) return;
  windows.richedit = new BrowserWindow({
    parent: windows.settings,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../window/rich-text-editor/preload.js")
    }
  });
  windows.richedit.on("closed", () => windows.richedit = null);
  windows.richedit.loadFile(path.join(__dirname, "../window/rich-text-editor/index.html"));
});
ipcMain.handle("window.setting.toParent", (sender, data) => {
  if (!windows.settings || !windows.richedit) return;
  windows.settings.webContents.send("window.setting.fromChild", data);
});
ipcMain.handle("window.setting.toChild", (sender, data) => {
  if (!windows.settings || !windows.richedit) return;
  windows.richedit.webContents.send("window.setting.fromParent", data);
});

// const PreventClosing = event => { if (!event.sender.closeable){ event.preventDefault(); } };

const CreateMainWindow = (options) => {
  // Create a browser window!
  windows.main = new BrowserWindow({
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
  if (Object.hasOwn((options ?? {}), "closeable")) windows.main.closeable = !!options?.closeable; else windows.main.closeable = true;
  // Windows.main.on("close", PreventClosing);
  windows.main.on("closed", () => windows.main = null);
  windows.main.loadFile(path.join(__dirname, '../window/Main/main-window.html'));
  windows.main.webContents.openDevTools();
  windows.main.webContents.send("sendInitStat", {
    visible: true,
    stat: false
  });
};
const ShowSettingsWindow = () => {
  windows.settings = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../window/setting/preload.js')
    },
    resizable: true,
    titleBarStyle: 'default',
    show: false
  });
  windows.settings.on('closed', function() {
    windows.settings = null;
  });
  windows.settings.loadFile(path.join(__dirname, '../window/setting/index_rev1.html'));
  windows.settings.once('ready-to-show', () => {
    windows.settings.show();
  });
};
const ShowInfoWindow = () => {
  windows.info = new BrowserWindow({
    width: 800,
    height: 450,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../window/setting/preload.js')
    },
    resizable: true
  });
  windows.info.on('closed', function() {
    windows.info = null;
  });
  windows.info.loadFile(path.join(__dirname, '../window/setting/index_new.html'));
};
const ShowTrafficWindow = () => {
  windows.traffic = new BrowserWindow({
    width: 800,
    height: 450,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../window/traffic/preload.js')
    },
    resizable: true
  });
  windows.traffic.on('closed', function() {
    windows.traffic = null;
  });
  windows.traffic.loadFile(path.join(__dirname, '../window/traffic/index.html'));
};

module.exports = {
  open: function (name, options){
    switch (name) {
      case "main":
        if (!windows.main) CreateMainWindow(options);
        break;
      case "settings":
        if (!windows.settings) ShowSettingsWindow(options);
        break;
      case "information":
        if (!windows.info) ShowInfoWindow(options);
        break;
      case "traffic":
        if (!windows.traffic) ShowTrafficWindow(options);
        break;
    }
  },
  setCloseable: function (name, value){
    if (!Object.hasOwn(windows, name)) return null;
    windows[name].closeable = value;
  }
};