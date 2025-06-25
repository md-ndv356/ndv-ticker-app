/**
* NDV Ticker Configuration Structure
* Based on the actual config.json structure used by the application
*/

const NDVConfigStructure = {
  // アプリケーション情報
  appInfo: {
    lastVersion: '',
    versionCheckAPI: 'https://md-ndv356.github.io/ndv-tickers/version-list.json?'
  },

  // ウィンドウ設定
  window: {
    ticker: { x: 5, y: 5, width: 0, height: 0, scale: 1, showTab: true, showFront: false },
    settingsMenu: { x: 15, y: 15, width: 1080, height: 720, scale: 1, showTab: true, showFront: false },
    trafficView: { x: 15, y: 15, width: 1080, height: 720, scale: 1, showTab: true, showFront: false },
    receivedInfo: { x: 15, y: 15, width: 1080, height: 720, scale: 1, showTab: true, showFront: false }
  },

  // メイン設定
  config: {
    // アプリケーション設定
    app: {
      // 自動コピー設定
      autoCopy: {
        eew: true,
        quake: false
      },
      // 情報取得間隔（ミリ秒）
      interval: {
        iedred7584EEW: 5000,        // EEW取得間隔
        nhkQuake: 12000,            // NHK地震情報取得間隔
        jmaDevFeed: 15000,          // 気象庁開発者向けフィード
        tenkiJPtsunami: 30000,      // 津波情報取得間隔
        wniMScale: 30000,           // Mスケール取得間隔
        wniSorabtn: 30000,          // ウェザーニュース空ボタン
        wniRiver: 300000,           // 河川情報取得間隔
        wniliveTimeTable: 240000    // ライブタイムテーブル
      },
      // 音量設定
      volume: {
        muted: false,
        eewLow: 100,      // EEW低音
        eewBeep: 10,      // EEWビープ音
        eewCustom: 100,   // EEWカスタム音
        eewPlum: 100,     // EEW PLUM法
        dosha: 40,        // 土砂災害
        tornado: 100,     // 竜巻
        emergency: 100,   // 緊急警報
        tsunami: 100,     // 津波
        heavyRain: 100,   // 大雨
        flood4: 100,      // 洪水レベル4
        flood5: 100,      // 洪水レベル5
        // 地震情報音量（震度別）
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
          {volume: 60, type: "normal"}  // 海外
        ]
      },
      // ログ送信設定
      sendEEWLogs: false,
      sendErrorLogs: false
    },

    // ティッカー設定
    ticker: {
      // 通常時の設定
      normal: {
        // 表示テキスト
        text: [
          { title: "タイトル12345", text: "これは文章！！これは文章！！これは文章！！これは文章！！これは文章！！これは文章！！", id: 0, enabled: true },
          { title: "", text: "最高気温がみられるよ〜", id: 11, enabled: true },
          { title: "作者について", text: "星のカービィやりたい...時間がない...", id: 20, enabled: true },
          { title: "お知らせ", text: "深刻な内容不足", id: 35, enabled: true }
        ],
        // コマンドオプション
        cmdOpt: {
          unit: {
            winds: "m/s",     // 風速単位
            temp: "centi"     // 温度単位（摂氏）
          }
        },
        // 津波表示設定
        viewTsunamiType: 1,       // 津波表示タイプ
        viewLittleTsunami: true   // 微小津波表示
      },
      // ニュース設定
      news: {
        title: "緊急情報",
        subtitle: "災害情報をリアルタイムでお届け",
        text: "現在、特別な情報はありません"
      },
      // スクロール速度
      scrollSpeed: 4,
      // 表示条件
      viewCond: {
        earthquake: {
          type: "and",        // 条件タイプ
          intensity: "1",     // 最小震度
          magnitude: "0",     // 最小マグニチュード
          depth: "1000"       // 最大深度
        },
        eew: {
          type: "or",         // 条件タイプ
          intensity: "1",     // 最小予想震度
          unknown: "1",       // 不明震度表示
          magnitude: "0",     // 最小マグニチュード
          depth: "1000"       // 最大深度
        }
      },
      // テーマカラー
      themeColor: {
        ticker: 0,    // ティッカーテーマ
        clock: 0      // 時計テーマ
      },
      // 部分的アメダス読み上げ
      particallyReadingAme: true
    }
  }
};

// 設定項目の説明とバリデーションルール
const ConfigValidationRules = {
  'config.app.interval.iedred7584EEW': { min: 1000, max: 60000, type: 'number', unit: 'ms', description: 'EEW情報の取得間隔' },
  'config.app.interval.nhkQuake': { min: 5000, max: 300000, type: 'number', unit: 'ms', description: 'NHK地震情報の取得間隔' },
  'config.app.interval.jmaDevFeed': { min: 5000, max: 300000, type: 'number', unit: 'ms', description: '気象庁フィードの取得間隔' },
  'config.app.interval.tenkiJPtsunami': { min: 10000, max: 600000, type: 'number', unit: 'ms', description: '津波情報の取得間隔' },
  'config.app.interval.wniMScale': { min: 10000, max: 600000, type: 'number', unit: 'ms', description: 'Mスケール情報の取得間隔' },
  'config.app.interval.wniRiver': { min: 60000, max: 3600000, type: 'number', unit: 'ms', description: '河川情報の取得間隔' },

  'config.app.volume.eewLow': { min: 0, max: 100, type: 'number', unit: '%', description: 'EEW低音の音量' },
  'config.app.volume.eewBeep': { min: 0, max: 100, type: 'number', unit: '%', description: 'EEWビープ音の音量' },
  'config.app.volume.eewCustom': { min: 0, max: 100, type: 'number', unit: '%', description: 'EEWカスタム音の音量' },
  'config.app.volume.tsunami': { min: 0, max: 100, type: 'number', unit: '%', description: '津波警報音の音量' },
  'config.app.volume.emergency': { min: 0, max: 100, type: 'number', unit: '%', description: '緊急警報の音量' },

  'config.ticker.scrollSpeed': { min: 1, max: 20, type: 'number', unit: 'px/frame', description: 'ティッカーのスクロール速度' },
  'config.ticker.viewCond.earthquake.intensity': { min: 1, max: 7, type: 'number', description: '地震情報表示の最小震度' },
  'config.ticker.viewCond.earthquake.magnitude': { min: 0, max: 9, type: 'number', step: 0.1, description: '地震情報表示の最小マグニチュード' },
  'config.ticker.viewCond.eew.intensity': { min: 1, max: 7, type: 'number', description: 'EEW表示の最小予想震度' },
  'config.ticker.viewCond.eew.magnitude': { min: 0, max: 9, type: 'number', step: 0.1, description: 'EEW表示の最小マグニチュード' }
};

// 設定項目のカテゴリ分類
const ConfigCategories = {
  intervals: {
    title: '取得間隔',
    icon: '⏰',
    description: '各種情報の取得間隔を設定します',
    items: [
      'config.app.interval.iedred7584EEW',
      'config.app.interval.nhkQuake',
      'config.app.interval.jmaDevFeed',
      'config.app.interval.tenkiJPtsunami',
      'config.app.interval.wniMScale',
      'config.app.interval.wniRiver'
    ]
  },
  volumes: {
    title: '音量設定',
    icon: '🔊',
    description: '各種警報音の音量を設定します',
    items: [
      'config.app.volume.eewLow',
      'config.app.volume.eewBeep',
      'config.app.volume.eewCustom',
      'config.app.volume.tsunami',
      'config.app.volume.emergency'
    ]
  },
  ticker: {
    title: 'ティッカー設定',
    icon: '📰',
    description: 'ティッカーの表示に関する設定',
    items: [
      'config.ticker.scrollSpeed',
      'config.ticker.normal.viewTsunamiType',
      'config.ticker.normal.viewLittleTsunami',
      'config.ticker.particallyReadingAme'
    ]
  },
  conditions: {
    title: '表示条件',
    icon: '⚙️',
    description: '情報表示の条件を設定します',
    items: [
      'config.ticker.viewCond.earthquake.intensity',
      'config.ticker.viewCond.earthquake.magnitude',
      'config.ticker.viewCond.eew.intensity',
      'config.ticker.viewCond.eew.magnitude'
    ]
  },
  textSettings: {
    title: 'テキスト設定',
    icon: '📝',
    description: 'ティッカーに表示するテキストを設定します',
    items: [
      'config.ticker.normal.text'
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NDVConfigStructure, ConfigValidationRules, ConfigCategories };
}
