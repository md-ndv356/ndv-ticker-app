/** 設定ファイルを管理 */

// const {app} = require("electron");
const { ipcMain } = require("electron");
const prefFS = require("./Preferences-FileSystem");
const appStatus = (require("./application_config")).get();
const configInitData = {
  appInfo: {
    lastVersion: appStatus.current.code,
    versionCheckAPI: "https://md-ndv356.github.io/ndv-tickers/version-list.json?"
  },
  window: {
    ticker: { x: 5, y: 5, width: 0, height: 0, scale: 1, showTab: true, showFront: false },
    settingsMenu: { x: 15, y: 15, width: 1080, height: 720, scale: 1, showTab: true, showFront: false },
    trafficView: { x: 15, y: 15, width: 1080, height: 720, scale: 1, showTab: true, showFront: false },
    receivedInfo: { x: 15, y: 15, width: 1080, height: 720, scale: 1, showTab: true, showFront: false }
  },
  /* 設定ウィンドウで設定できる項目 */
  config: {
    app: {
      autoCopy: { eew: true, quake: false },
      interval: {
        iedred7584EEW: 5000,
        nhkQuake: 12000,
        jmaDevFeed: 15000,
        tenkiJPtsunami: 30000,
        wniMScale: 30000,
        wniSorabtn: 30000,
        wniRiver: 300000,
        wniliveTimeTable: 240000
      },
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
      },
      sendEEWLogs: false,
      sendErrorLogs: false
    },
    ticker: {
      normal: {
        text: [
          { title: "タイトル12345", text: "これは文章！！これは文章！！これは文章！！これは文章！！これは文章！！これは文章！！", id: 0 },
          { title: "", text: "最高気温がみられるよ〜", id: 11 },
          { title: "作者について", text: "星のカービィやりたい...時間がない...", id: 20 },
          { title: "お知らせ", text: "深刻な内容不足", id: 35 }
        ],
        cmdOpt: {
          unit: {
            winds: "m/s",
            temp: "centi"
          }
        }
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
      themeColor: {
        ticker: 0,
        clock: 0
      },
      viewTsunami: true,
      particallyReadingAme: true
    }
  }
};

let configCache = null;
const moduleExports = {
  read: async () => {
    if (configCache) return configCache;
    if (await prefFS.exists("./config.json")){
      configCache = await prefFS.read("./config.json", "json", "utf-8");
    } else {
      await prefFS.save("./config.json", JSON.stringify(configInitData));
      configCache = configInitData;
    }
    return configCache;
  },
  reset: async () => {
    await prefFS.save("./config.json", JSON.stringify(configInitData));
    return configInitData;
  },
  save: async (data) => {
    await prefFS.save("./config.json", JSON.stringify(data));
    configCache = data;
    return 0;
  }
};
module.exports = moduleExports;

ipcMain.handle("global.config.get", () => {
  return moduleExports.read();
});
ipcMain.handle("global.config.set", data => {
  moduleExports.save(data);
  return true;
});
