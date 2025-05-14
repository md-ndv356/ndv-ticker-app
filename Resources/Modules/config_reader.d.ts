declare global {
  namespace AppConfig {
    interface Model {
      appInfo: {
        lastVersion: void | string;
        versionCheckAPI: string;
      }
      window: {
        ticker: AppConfig.WindowState;
        settingsMenu: AppConfig.WindowState;
        trafficView: AppConfig.WindowState;
        receivedInfo: AppConfig.WindowState;
      }
      config: {
        app: {
          autoCopy: {
            eew: boolean;
            quake: boolean;
          }
          interval: {
            iedred7584EEW: number;
            nhkQuake: number;
            jmaDevFeed: number;
            tenkiJPtsunami: number;
            wniMScale: number;
            wniSorabtn: number;
            wniRiver: number;
            wniliveTimeTable: number;
          }
          volume: AppConfig.App.Volume.Output;
          sendEEWLogs: boolean;
          sendErrorLogs: boolean;
        }
        ticker: {
          normal: {
            text: AppConfig.Ticker.NormalText[];
          }
          news: AppConfig.Ticker.NewsText;
          scrollSpeed: number;
          viewCond: {
            earthquake: {
              type: "and" | "or",
              intensity: number | string;
              magnitude: number | string;
              depth: number | string;
            }
            eew: {
              type: "and" | "or",
              intensity: number | string;
              unknown: number | boolean;
              magnitude: number | string;
              depth: number | string;
            }
          }
          themeColor: {
            ticker: number;
            clock: number;
          }
          viewTsunami: boolean;
        }
      }
    }

    /* ティッカー */
    namespace Ticker {
      /* 通常テキスト形式 */
      interface NormalText {
        title: string;
        text: string;
        id: number;
      }
      /* ニュース形式 */
      interface NewsText {
        title: string;
        subtitle: string;
        text: string;
      }
    }
    /* アプリケーション */
    namespace App {
      namespace Volume {
        interface Output {
          muted: boolean;
          eewLow: number;
          eewHigh: number;
          eewCustom: number;
          eewPlum: number;
          dosha: number;
          tornado: number;
          emergency: number;
          tsunami: number;
          heavyRain: number;
          flood4: number;
          flood5: number;
          quake: AppConfig.App.Volume.QuakeItem[];
        }
        interface QuakeItem {
          volume: number;
          type: "normal" | "major";
        }
      }
    }
    interface WindowState {
      x: number;
      y: number;
      width: number;
      height: number;
      scale: number;
      showTab: boolean;
      showFront: boolean;
    }
  }
}

declare namespace configReader {
  function read(): Promise<AppConfig.Model>;
  function reset(): Promise<AppConfig.Model>;
}
export = configReader;
