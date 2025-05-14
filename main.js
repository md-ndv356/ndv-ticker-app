const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
// const os = require('os');
// const axios = require("axios");
// const fs = require("fs");
// エラー処理
const ErrorHandler = require(path.join(__dirname, "./Resources/Modules/error_handler"));
process.on('warning', (warning) => {
  console.log("catch: warning");
  console.log(warning);
  ErrorHandler.set.main_warning(warning);
});
process.on('uncaughtException', (err) => {
  console.log("catch: \x1b[33muncaughtException\x1b[39m");
  console.dir(err);
  ErrorHandler.set.main_uncaughtException(err);
});
process.on('unhandledRejection', (reason, pr) => {
  console.log("catch: \x1b[33munhandledRejection\x1b[39m");
  console.log(reason.name + ": " + reason.message);
  console.log(pr.toString());
});
// const fileSystem = require(path.join(__dirname, "./Resources/Modules/Preferences-FileSystem"));
const configReader = require(path.join(__dirname, "./Resources/Modules/config_reader"));
const AppInitialConfig = require(path.join(__dirname, "./Resources/Modules/application_config"));
const MenubarHandler = require(path.join(__dirname, "./Resources/Modules/menubar_handler"));
const WindowHandler = require(path.join(__dirname, "./Resources/Modules/window_handler"));
const InformationMaster = require(path.join(__dirname, "./Resources/Class/Information_Master"));
const ntpHandler = require(path.join(__dirname, "./Resources/Modules/ntp_handler"));
const isMac = (process.platform === 'darwin');

InformationMaster.mscale.interval = 25000;
InformationMaster.eew.interval_kmoni_yahoo_eew = 1500;

// setTimeout(function(){ informationReceiver.load_eew(); }, 1000);

// fileSystem.read("./config.json", "json", "utf-8").then((data) => {
//   console.log(data);
// });
// fileSystem.exists("./config.json").then(bool => {
//   console.log(bool);
// });
// fileSystem.createDir("./test/");
// fileSystem.save("./config.json", '{"timestamp":'+(new Date()-0)+"}").then();

const DataTables = {
  app: AppInitialConfig.get()
};

const ConsoleRich = {
  reset: "\x1b[m",
  bold: "\x1b[1m",
  low: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  blink: "\x1b[5m",
  fastblink: "\x1b[6m",
  reverse: "\x1b[7m",
  hide: "\x1b[8m",
  strike: "\x1b[9m",
  underline2: "\x1b[21m",
  bold_low: "\x1b[22m",
  reset_italic: "\x1b[23m",
  reset_underline: "\x1b[24m",
  reset_blink: "\x1b[25m",
  reset_reverse: "\x1b[27m",
  reset_hide: "\x1b[28m",
  reset_strike: "\x1b[29m",
  color_30: "\x1b[30m", // black
  color_31: "\x1b[31m", // red
  color_32: "\x1b[32m", // green
  color_33: "\x1b[33m", // yellow
  color_34: "\x1b[34m", // blue
  color_35: "\x1b[35m", // magenta
  color_36: "\x1b[36m", // cyan
  color_37: "\x1b[37m", // white...?
  color_def: "\x1b[39m", // default
  ground_40: "\x1b[40m",
  ground_41: "\x1b[41m",
  ground_42: "\x1b[42m",
  ground_43: "\x1b[43m",
  ground_44: "\x1b[44m",
  ground_45: "\x1b[45m",
  ground_46: "\x1b[46m",
  ground_47: "\x1b[47m",
  ground_def: "\x1b[49m",
  colors_256: (id)=>"\x1b[38;5;"+id+"m",
  colors_1677: (r,g,b)=>"\x1b[38;2;"+r+";"+g+";"+b+"m",
  grounds_256: (id)=>"\x1b[48;5;"+id+"m",
  grounds_1677: (r,g,b)=>"\x1b[48;2;"+r+";"+g+";"+b+"m",
};

let path_app = app.getAppPath();
let path_userData = app.getPath("userData");
console.log("path/app:  "+path_app);
console.log("path/userData:  "+path_userData);

// const Sleep = function(time){ return new Promise((resolve)=>{setTimeout(()=>{resolve();},time);}); };
// https://stackoverflow.com/questions/58325771/how-to-generate-random-hex-string-in-javascript
// const generateRandomHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

// const util = require('util');
// const childProcess = require('child_process');
// const exec = util.promisify(childProcess.exec);
//
// (async () => {
//   for (var i = 0; i < 70; i++) {
//     exec(`osascript -e 'display dialog "An Critical Error has occurred!" buttons {"OK"} with icon 2'`);
//     console.log(Math.floor(i/70*1000)/10+"%");
//     await Sleep(800);
//   }
// })();

app.on('window-all-closed', () => {
  if (!isMac) { app.quit(); }
});

// handle: ステータス保存
ipcMain.handle("saveStatus", (event, data) => {
  console.log("Unexcepted Event Handled: saveStatus");
  console.log(data);
});

// handle: メインプロセスでデータを受け取る
ipcMain.handle("sendToMain", (sender, data) => {
  console.log("Unexcepted Event Handled: sendToMain");
  console.log(data);
});

// handle: 呼び出し元へAppデータを送信
ipcMain.handle("requestAppInfo", () => {
  return DataTables.app;
});

// handle: 既定ブラウザで開く
ipcMain.handle("openInDefaultBrowser", (sender, url) => {
  shell.openExternal(url);
});

// handle: NTP調整
ipcMain.handle("ntpHandler.syncTime", async () => {
  console.log("時刻調整時間（内蔵時計）: "+new Date());
  return await ntpHandler.syncTime();
});

// handle: Mスケール取得
ipcMain.handle("mscale.get", async () => {
  return InformationMaster.get_mscale();
});

app.on("ready", async function(){
  // 初期化
  MenubarHandler.init();
  const configData = await configReader.read();
  DataTables.configData = configData;

  // handle: アップデート確認
  const updateChecker = new (require(path.join(__dirname, "./Resources/window/Modules/UpdateChecker")))(DataTables.configData?.appInfo?.versionCheckAPI || "https://md-ndv356.github.io/ndv-tickers/version-list.json?", DataTables.app.current.code);
  const doCheckUpdate = () => new Promise((resolve, reject) => {
    updateChecker.check().then(data => {
      resolve(data.isExist);
    }).catch(err => {
      ErrorHandler.set.connection_error(err);
    });
  });
  ipcMain.handle("updateCheck", doCheckUpdate);
  doCheckUpdate();

  ipcMain.handle("window.main.closeable", async () => {
    return WindowHandler.setCloseable("main", true);
  });
  WindowHandler.open("main", { closeable: false });

  app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) WindowHandler.open("main");
  });
});
