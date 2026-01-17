/** 設定ファイルを管理 */

// const {app} = require("electron");
const { ipcMain } = require("electron");
const appdataHandler = require("./appdata_handler");
const appStatus = (require("./application_config")).get();
const defaultConfig = {
  appInfo: {
    lastVersion: appStatus.current.code,
    versionCheckAPI: "https://md-ndv356.github.io/ndv-tickers/version-list.json?",
    ntpServer: "ntp.nict.jp"
  },
  window: {
    ticker: { x: 5, y: 5, width: 0, height: 0, scale: 1, isFullscreen: false },
    settingsMenu: { x: 15, y: 15, width: 1080, height: 720, scale: 1, isFullscreen: false },
    trafficView: { x: 15, y: 15, width: 1080, height: 720, scale: 1, isFullscreen: false },
    receivedInfo: { x: 15, y: 15, width: 1080, height: 720, scale: 1, isFullscreen: false }
  },
  /* 設定ウィンドウで設定できる項目 */
  config: {
    app: {
      autoStart: false,
      minimizeToTray: false,
      language: "ja",
      timezone: "Asia/Tokyo",
      autoCopy: { eew: true, quake: false }, // config.app.autoCopy
      interval: {
        iedred7584EEW: 5000,
        nhkQuake: 12000,
        jmaDevFeed: 15000,
        tenkiJPtsunami: 30000,
        wniMScale: 30000,
        wniSorabtn: 30000,
        wniRiver: 300000,
        wniliveTimeTable: 240000
      }, // config.app.interval
      volume: {
        muted: false,
        eewLow: 100,
        eewBeep: 10,
        eewCustom: 100,
        eewPlum: 100,
        dosha: 40,
        tornado: 100,
        emergency: 100,
        tsunami: 100,
        heavyRain: 100,
        flood4: 100,
        flood5: 100,
        quake: [
          {volume: 30, type: "normal"}, // 震度1
          {volume: 50, type: "normal"}, // 震度2
          {volume: 70, type: "normal"}, // 震度3
          {volume: 80, type: "normal"}, // 震度4
          {volume: 90, type: "normal"}, // 震度5-
          {volume: 100, type: "major"}, // 震度5+
          {volume: 100, type: "major"}, // 震度6-
          {volume: 100, type: "major"}, // 震度6+
          {volume: 100, type: "major"}, // 震度7
          {volume: 60, type: "normal"}, // 海外
        ]
      }, // config.app.volume
      sendEEWLogs: false, // config.app.sendEEWLogs
      sendErrorLogs: false // config.app.sendErrorLogs
    },
    display: {
      mainWindow: {
        opacity: 1.0,
        alwaysOnTop: false,
        showFrame: false,
      },
      themeColor: {
        ticker: 0,
        clock: 0,
      }, // config.ticker.themeColor
    },
    ticker: {
      normal: {
        text: [
          { title: "タイトル12345", text: "これは文章！！これは文章！！これは文章！！これは文章！！これは文章！！これは文章！！", id: 0, enabled: true },
          { title: "", text: "最高気温がみられるよ〜", id: 11, enabled: true },
          { title: "作者について", text: "星のカービィやりたい...時間がない...", id: 20, enabled: true },
          { title: "お知らせ", text: "深刻な内容不足", id: 35, enabled: true }
        ],
        cmdOpt: {
          unit: {
            winds: "m/s",
            temp: "centi"
          }
        },
        viewTsunamiType: 1,
        viewLittleTsunami: true
      },
      news: {
        title: "aaaaああああ｜｜",
        subtitle: "文章あいうえお文章あいうえお文章あいうえお文章あいうえお文章あいうえお文章あいうえお文章あいうえおabc-0234",
        text: "text"
      },
      scrollSpeed: 4,
      viewCond: {
        earthquake: {
          type: "and",
          intensity: "1",
          magnitude: "0",
          depth: "1000"
        },
        eew: {
          type: "or",
          intensity: "1",
          unknown: "1",
          magnitude: "0",
          depth: "1000"
        }
      },
      particallyReadingAme: true
    }
  }
};

let configCache = null;


const thisModule = {
  getValue: async path => {
    if (!configCache) await thisModule.read();
    const keys = path.split(".");
    let value = configCache;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else if (value && Array.isArray(value) && !isNaN(key)) {
        value = value[key-0];
      } else {
        return undefined; // Key not found
      }
    }
    return value;
  },
  read: async () => {
    if (configCache) return configCache;
    if (await appdataHandler.exists("./config.json")){
      try {
        configCache = await appdataHandler.read("./config.json", "json", "utf-8");
      } catch (e) {
        // e.showErrorWindow = true;
        throw e;
      }
    } else {
      await appdataHandler.save("./config.json", JSON.stringify(defaultConfig));
      configCache = defaultConfig;
    }
    console.log(configCache);
    return configCache;
  },
  reset: async () => {
    await appdataHandler.save("./config.json", JSON.stringify(defaultConfig));
    configCache = defaultConfig;
    return defaultConfig;
  },
  save: async (data) => {
    await appdataHandler.save("./config.json", JSON.stringify(data));
    configCache = data;
    return 0;
  }
};
module.exports = thisModule;

ipcMain.handle("global.config.get", (event) => {
  return thisModule.read();
});
ipcMain.handle("global.config.set", (event, data) => {
  thisModule.save(data);
  return true;
});
