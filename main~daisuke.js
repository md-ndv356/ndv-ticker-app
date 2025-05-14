const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const axios = require("axios");
const fs = require("fs");
const fileSystem = require("./Resources/Modules/Preferences-FileSystem");
// fileSystem.read("./config.json", "json", "utf-8").then((data) => {
//   console.log(data);
// });
// fileSystem.exists("./config.json").then(bool => {
//   console.log(bool);
// });
// fileSystem.createDir("./test/");
// fileSystem.save("./config.json", '{"timestamp":'+(new Date()-0)+"}").then();
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

const DataTables = {
  app: {
    current: "β1.0.0",
    id: 1,
    lastModified: "2022-04-24T00:49:45+09:00",
    history: [
      "β1.0.0"
    ]
  }
};

let Windows = { main: null, settings: null, error: null, info: null, traffic: null };
let mainWindowScale = 0.75;

// load config file

const isMac = (process.platform === 'darwin');
if(isMac) console.log(`${ConsoleRich.ground_44}${ConsoleRich.colors_256(231)}I found a Mac user!${ConsoleRich.color_def}${ConsoleRich.ground_def}`);

const CreateWindow = () => {
  // Create the browser window.
  Windows.main = new BrowserWindow({
    width: 1212*mainWindowScale+1,
    height: 128*mainWindowScale,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, './Resources/window/Main/main-preload.js')
    },
    resizable: false,
    frame: false
  });
  Windows.main.on('closed', function() {
    Windows.main = null;
  });
  Windows.main.loadFile(path.join(__dirname, './Resources/window/Main/main-window.html'));
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
      preload: path.join(__dirname, './Resources/window/setting/preload.js')
    },
    resizable: true
  });
  Windows.settings.on('closed', function() {
    Windows.settings = null;
  });
  Windows.settings.loadFile(path.join(__dirname, './Resources/window/setting/index.html'));
};
const ShowInfoWindow = () => {
  Windows.info = new BrowserWindow({
    width: 800,
    height: 450,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, './Resources/window/info/preload.js')
    },
    resizable: true
  });
  Windows.info.on('closed', function() {
    Windows.info = null;
  });
  Windows.info.loadFile(path.join(__dirname, './Resources/window/info/index.html'));
};
const ShowTrafficWindow = () => {
  Windows.traffic = new BrowserWindow({
    width: 800,
    height: 450,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, './Resources/window/traffic/preload.js')
    },
    resizable: true
  });
  Windows.traffic.on('closed', function() {
    Windows.traffic = null;
  });
  Windows.traffic.loadFile(path.join(__dirname, './Resources/window/traffic/index.html'));
};
const ShowErrorWindow = (error_id) => {
  Windows.traffic = new BrowserWindow({
    width: 750,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, './Resources/window/error-window/preload.js')
    },
    resizable: true
  });
  Windows.traffic.on('closed', function() {
    Windows.traffic = null;
  });
  Windows.traffic.loadFile(path.join(__dirname, './Resources/window/error-window/index.html'));
};

const MenuJSON = [
  ...(isMac ? [{
      label: app.name,
      submenu: [
        {role:'about',      label:`${app.name}について` },
        {type:'separator'},
        {role:'services',   label:'サービス'},
        {type:'separator'},
        {role:'hide',       label:`${app.name}を隠す`},
        {role:'hideothers', label:'ほかを隠す'},
        {role:'unhide',     label:'すべて表示'},
        {type:'separator'},
        {role:'quit',       label:`${app.name}を終了`}
      ]
    }] : []),
  {
    label: 'ファイル',
    submenu: [
      isMac ? {role:'close', label:'ウィンドウを閉じる'} : {role:'quit', label:'終了'}
    ]
  },
  {
    label: '編集',
    submenu: [
      {role:'undo',  label:'元に戻す'},
      {role:'redo',  label:'やり直す'},
      {type:'separator'},
      {role:'cut',   label:'切り取り'},
      {role:'copy',  label:'コピー'},
      {role:'paste', label:'貼り付け'},
      ...(isMac ? [
        {role:'pasteAndMatchStyle', label:'ペーストしてスタイルを合わせる'},
        {role:'delete',    label:'削除'},
        {role:'selectAll', label:'すべてを選択'},
        {type:'separator' },
        {
          label: 'スピーチ',
          submenu: [
            {role:'startSpeaking', label:'読み上げを開始'},
            {role:'stopSpeaking',  label:'読み上げを停止'}
          ]
        }
      ] : [
        {role:'delete',    label:'削除'},
        {type:'separator'},
        {role:'selectAll', label:'すべてを選択'}
      ])
    ]
  },
  {
    label: '表示',
    submenu: [
      {role:'reload',         label:'再読み込み'},
      {role:'forceReload',    label:'強制的に再読み込み'},
      {role:'toggleDevTools', label:'開発者ツールを表示'},
      {type:'separator'},
      {role:'resetZoom',      label:'実際のサイズ'},
      {role:'zoomIn',         label:'拡大'},
      {role:'zoomOut',        label:'縮小'},
      {type:'separator'},
      {role:'togglefullscreen', label:'フルスクリーン'}
    ]
  },
  {
    label: 'ウィンドウ',
    submenu: [
      {role:'minimize', label:'最小化'},
      {role:'zoom',     label:'ズーム'},
      {type:'separator'},
      {
        label: '拡大率',
        submenu: [
          {
            label: '75%',
            type: 'radio',
            checked: true,
            click: function(e) {
            }
          }
        ]
      },
      {
        label: 'メイン画面を開く',
        click: () => {
          if (!Windows.main) {
            CreateWindow();
          }
        }
      },
      {
        label: '設定を開く',
        click: () => {
          if (!Windows.settings) {
            ShowSettingsWindow();
          }
        }
      },
      {
        label: '受信情報リストを開く',
        click: () => {
          if (!Windows.info) {
            ShowInfoWindow();
          }
        }
      },
      {
        label: 'トラフィックモニターを開く',
        click: () => {
          if (!Windows.traffic) {
            ShowTrafficWindow();
          }
        }
      },
      {type:'separator'},
      ...(isMac ? [
        {role:'front',  label:'ウィンドウを手前に表示'},
        {type:'separator'},
        {role:'window', label:'ウィンドウ'}
      ] : [
        {role:'close',  label:'閉じる'}
      ])
    ]
  },
  {
    label:'ヘルプ',
    submenu: [
      {label:`${app.name} ヘルプ`},    // ToDo
      ...(isMac ? [] : [
        {type:'separator'} ,
        {role:'about',  label:`${app.name}について` }
      ])
    ]
  }
];

const Sleep = function(time){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
// https://stackoverflow.com/questions/58325771/how-to-generate-random-hex-string-in-javascript
const generateRandomHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

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
  if (!isMac) {
    app.quit();
  }
});
app.on('activate', () => {
  if (!BrowserWindow.getAllWindows().length) {
    CreateWindow();
  }
});

// handle: ステータス保存
ipcMain.handle("saveStatus", (event, data) => {
  console.log(data);
});

// handle: 時刻調整
const NTP = require("ntp-time").Client;
const Client = new NTP("ntp.nict.jp", 123, { timeout: 5000 });
ipcMain.handle("syncTime", () => new Promise((resolve, reject) => {
  let startSyncTime = new Date();
  console.log("trying clock adjustment: "+startSyncTime);
  Client.syncTime()
    .then((time) => {resolve(time)})
    .catch((e) => {reject(e)});
}));

// handle: メインプロセスにデータを送信
const ErrorDataList = [];
ipcMain.handle("sendToMain", (sender, msg) => {
  console.log(msg);
  switch (msg.type) {
    // エラー処理
    case "Exception":
      // const id = generateRandomHex(24);
      ErrorDataList.push(msg);
      ShowErrorWindow();
      break;
    default:
      break;
  }
});

// handle: エラーデータ送信
ipcMain.handle("getErrorInfo", (sender, msg) => {
  let data = ErrorDataList.slice(-1)[0];
  data.version = DataTables.app.current;
  return data;
});

// handle: 呼び出し元へAppデータを送信
ipcMain.handle("requestAppInfo", () => {
  return DataTables.app;
});

// handle: 既定ブラウザで開く
ipcMain.handle("openInDefaultBrowser", (sender, url) => {
  shell.openExternal(url);
});

// app.on("ready", async function(){
//   // 初期化
//   const configData = await fileSystem.read("./config.json", "json", "utf-8");
//   DataTables.configData = configData;

//   // handle: アップデート確認
//   const updateChecker = new (require("./Resources/window/Modules/UpdateChecker"))(DataTables.configData?.appInfo?.versionCheckAPI || "https://md-ndv356.github.io/ndv-tickers/version-list.json", DataTables.app.id);
//   const doCheckUpdate = () => new Promise((resolve, reject) => {
//     updateChecker.check().then(data => {
//       resolve(data.isExist);
//     }).catch(err => {
//       reject(err);
//     });
//   });
//   ipcMain.handle("updateCheck", doCheckUpdate);
//   await doCheckUpdate();

//   const MenuTemplate = Menu.buildFromTemplate(MenuJSON);
//   Menu.setApplicationMenu(MenuTemplate);

//   CreateWindow();
// });

app.on("ready", async function(){
await Sleep(1000);
console.log(`





































              beatmania IIDX 10th style / sm13256898

              DDDDDDDDDD              AA          IIIIIIII       SSSSSSSS       UU          UU    KK          KK    EEEEEEEEEEEE
              DD        DD            AA             II        SS        SS     UU          UU    KK          KK    EE
              DD          DD         AAAA            II       SS          SS    UU          UU    KK        KK      EE
              DD          DD         AAAA            II       SS                UU          UU    KK      KK        EE
              DD          DD        AA  AA           II       SS                UU          UU    KK    KK          EE
              DD          DD        AA  AA           II        SS               UU          UU    KK  KK            EE
              DD          DD       AA    AA          II          SSSSSSSS       UU          UU    KKKK              EEEEEEEEEEEE
              DD          DD       AAAAAAAA          II                  SS     UU          UU    KK  KK            EE
              DD          DD      AA      AA         II                   SS    UU          UU    KK    KK          EE
              DD          DD      AA      AA         II                   SS    UU          UU    KK      KK        EE
              DD          DD     AA        AA        II       SS          SS     UU        UU     KK        KK      EE
              DD        DD       AA        AA        II        SS        SS       UU      UU      KK          KK    EE
              DDDDDDDDDD        AA          AA    IIIIIIII       SSSSSSSS           UUUUUU        KK          KK    EEEEEEEEEEEE

`);

});
