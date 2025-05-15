/** アプリケーション内で発生したエラーの管理 */

const { BrowserWindow, app, ipcMain } = require("electron");
const os = require("os");
const path = require("path");
const path_app = app.getAppPath();
const path_userData = app.getPath("userData");
const AppInitialConfig = require("./application_config");
const crypto = require("crypto");

// errorWindowはファイル読み込み専用
const waitingId = [];
let errorWindow = null;
const ShowErrorWindow = function (error_id){
  if (errorWindow) waitingId.push(error_id); else {
    if (!app.isReady()){
      waitingId.push(error_id);
      app.on("ready", () => {
        const nextId = waitingId.shift();
        ShowErrorWindow(nextId);
      });
      return;
    }
    errorWindow = new BrowserWindow({
      width: 750,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../window/error-window/preload.js'),
        additionalArguments: [ "--preload-error-id="+error_id ]
      },
      resizable: true
    });
    errorWindow.on('closed', function(){
      errorWindow = null;
      const nextId = waitingId.shift();
      if(nextId) ShowErrorWindow(nextId);
    });
    errorWindow.loadFile(path.join(__dirname, '../window/error-window/index.html'));
  }
}
const ErrorDataList = {};
function addEvent(type, from, data){
  const id = crypto.randomUUID();
  ErrorDataList[id] = {
    type, from, data,
    time: Date.now() / 1000,
    osVersion: os.version()
  };
  ShowErrorWindow(id);
  return id;
}

const ErrorHandler = {
  set: {
    main_warning: function (warning){
      const stack = warning.stack.replaceAll(path_app, "<path_app>").replaceAll(path_userData, "<path_userData>");
      return addEvent("Main_Warning", "Main Process", { type: warning.name, stack });
    },
    main_uncaughtException: function (err){
      const stack = err.stack.replaceAll(path_app, "<path_app>").replaceAll(path_userData, "<path_userData>");
      return addEvent("Main_uncaughtException", "Main Process", { type: err.name, stack });
    },
    main_unhandledRejection: function (err){
      const stack = err.stack.replaceAll(path_app, "<path_app>").replaceAll(path_userData, "<path_userData>");
      return addEvent("Main_unhandledRejection", "Main Process", { type: err.name, stack });
    },
    connection_error: function (err){
      console.log(err.error.constructor.name);
      let errordata = err.error.toJSON();
      return addEvent("connection_error", "Main Process", {
        type: "HTTP",
        httpkey: err.key,
        timestamp: err.timestamp,
        error: {
          message: errordata.message,
          name: errordata.name,
          code: errordata.code,
          status: errordata.status,
          config: {
            method: errordata.config.method,
            url: errordata.config.url
          }
        }
      });
    },
    window: function (msg){
      console.log(msg);
      switch (msg.type) {
        // エラー処理
        case "Exception":
        case "UnhandledRejection":
          return addEvent(msg.type, 'window ("'+msg.from+'")', msg.data);
        default:
          break;
      }
    }
  },
  get: function (id){
    return ErrorDataList[id];
  }
};
module.exports = ErrorHandler;

// handle: エラーデータをエラーウィンドウに送信
ipcMain.handle("ErrorHandler.getErrorInfo", (sender, msg) => {
  let data = ErrorDataList[msg];
  data.version = AppInitialConfig.get().current;
  return data;
});

// handle: エラーデータを受信
ipcMain.handle("ErrorHandler.windowError", async (sender, msg) => {
  // console.log(sender);
  ErrorHandler.set.window(msg);
  // 1秒後に反応がなかったら強制的に終了（案）
  return { request: "send_trace_and_destroy" };
});
