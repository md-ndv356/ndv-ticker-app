const mod_userData = {
  getUserDataFromMain: async function (){
    return await ContentBridge.getConfigData();
  },
  initUserData: async function (){
    let obj = {};
    obj.config = await this.getUserDataFromMain();
    obj.shortcut = {
      blackout: "情報の取得を待っています...",
      weatherForecast: "情報の取得を待っています...",
      riverLevel: "情報の取得を待っています...",
      timetable: "情報の取得を待っています...",
    };
    obj.data = {
      colorThemeMode: 0, mscale: 0, mode: 0,
      normal: { view: 0, t1: 2, t2: 3, x1: 0, x2: 1080, xt: 1080 },
      quake: {
        offset: 0,
        text: [ "","","","","","","","","","","" ],
        data: {
          intensity: {
            msi: -1, // 途中の「+1」の部分は、震度に「5弱以上と推定」を追加した部分。
            si: -1,
            msiTxt: undefined
          },
          time: { yy: "2001", mm: "06", dd: "01", h: "01", m: "01" },
          depth_ja: "", depth_en: "",
          epicenter_ja: "", epicenter_en: "",
          magnitude: "", isSokuho: true
        },
        autoback: { frames: 1800, counts: 2, enabled: true }
      },
      // Earthquake Early Warning
      eew: {
        epicenter: "", calcInt: "", depth: "",
        alertFlgText: "", magnitude: "",
        isFinal: true, isTraning: false, isCancel: false,
        isAlert: false, isSea: false, isAssumption: false,
        warnForecast: "", hypocenterAround: "",
      },
      // news
      weather: {
        articles: [
          // { title: "タイトル", subText: "ちっちゃい文字", mainText: "大きめの文字" }
        ],
        timeRemaining: 0
      },
      tsunami: {
        viewPage: 0, text: [],
        fcst: { issued: false, text: [] },
        obs: { issued: false, text: [] }
      },
    };
    return obj;
  }
};
var userData = {};

// var userData = {
//   mode: 0,
//   scrollSpeed: 4,
//   language: "ja",
//   colorThemeMode: 0,
//   mscale: 0,
//   normal: {
//     text: [
//       '<weather/temperature/high>',
//       '<weather/temperature/low>',
//       '<weather/rain/1h>',
//       '<weather/rain/24h>',
//       '<weather/wind>'
//     ],
//     title: [ '最高気温(℃)', '最低気温(℃)', '時降水量(mm/h)', '日降水量(mm/d)', '最大風速(m/s)' ],
//     cmd: [ 1, 2, 11, 13, 20 ],
//     view: 0,
//     x: 1200
//   },
//   quake: {
//     offset: 0,
//     volume: [ 0.3, 0.5, 0.7, 0.8, 0.9, 1, 1, 1, 1 ],
//     text: ["","","","","","","","","","",""],
//     data: {
//       intensity: {
//         msi: -1, //途中の「+1」の部分は、震度に「5弱以上と推定」を追加した部分。
//         si: -1,
//         msiTxt: undefined
//       },
//       time: {
//         yy: "2001",
//         mm: "06",
//         dd: "01",
//         h: "01",
//         m: "01"
//       },
//       depth: "",
//       epicenter: "",
//       epicenter_id: 0,
//       magnitude: "",
//       lastDataTime: "",
//       currentDateTime: "",
//       isSokuho: true,
//     },
//     urls: [],
//     autoback: {
//       frames: 1800,
//       counts: 2
//     }
//   },
//   // Earthquake Early Warning
//   eew: {
//     epicenter: "",
//     originTime: new Date("2000/01/01 00:00:00"),
//     calcInt: "",
//     depth: "",
//     alertFlgText: "",
//     cancelText: "",
//     magnitude: "",
//     reportNumber: "",
//     reportID: "",
//     isFinal: true,
//     traning: false,
//     isCancel: false,
//     isAlert: false,
//     at: new Date("2000/01/01 00:00:00"),
//     epicenterID: "",
//     isSea: false,
//     isAssumption: false,
//     warnForecast: "",
//     hypocenterAround: "",
//     classCode: undefined
//   },
//   // news
//   weather: {
//     articles: [
//       // { title: "タイトル", subText: "ちっちゃい文字", mainText: "大きめの文字" }
//     ],
//     links: {
//       regular: [],
//       extra: [],
//       eqvol: [],
//       other: []
//     },
//     typhoons: {},
//     timeRemaining: 0
//   },
//   tsunami: {
//     fcst: {
//       cancelled: true,
//       lastTsunamiID: "",
//       lastReport: "",
//       viewPage: 0,
//       text: []
//     },
//     obs: {
//       latestUpdateTime: 0
//     }
//   },
//   sorabtn: {},
//   blackout: "情報の取得を待っています...",
//   weatherForecast: "情報の取得を待っています...",
//   riverLevel: "情報の取得を待っています...",
//   timetable: "情報の取得を待っています...",
//   // NOTE: メインプロセスに置いた方がいいかも
//   lastGet: {
//     iedred7584EEW: "---",
//     nhkQuake1: "---",
//     nhkQuake2: "---",
//     tenkiJPtsunami: "---",
//     wniMScale: "---",
//     wniSorabtn: "---",
//     wniRiver: "---",
//     jmaTableCsvPre1h00_rct: "---",
//     jmaTableCsvPre24h00_rct: "---",
//     jmaTableCsvMxwsp00_rct: "---",
//     jmaTableCsvMxtemsadext00_rct: "---",
//     jmaTableCsvMntemsadext00_rct: "---",
//     jmaDevFeedExtra: "---",
//     wniliveTimeTable: "---",
//     tepcoTeiden: "---"
//   }
// };
