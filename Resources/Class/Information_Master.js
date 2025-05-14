const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const http_request = require("../Modules/http_request");
const websocket_request = require("../Modules/websocket_handler");
const Weather = require("./Weather/Root");
const Earthquake = require("./Earthquake");
const EEW = require("./EEW");
const River = require("./River");
const Tsunami = require("./Tsunami");
const Volcano = require("./Volcano");
const Mscale = require("./Mscale");
// const handleIntervalFunction = require("../Modules/handle_interval_function");
const p2pquake_areacode_data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/p2pquake_areacode_data.json"), "utf-8"));

/**
 * 主にHTTP/WebSocketでの読み込みを管理
 * p2pquakeのWebSocketはここで管理する（データ管理先が複数にわたるため）
 */
const exportObject = {
  weather: new Weather(),
  earthquake: new Earthquake(),
  eew: new EEW(),
  river: new River(),
  tsunami: new Tsunami(),
  volcano: new Volcano(),
  mscale: new Mscale(),
  // regist_interval: (timer = {}) => {
  //   // if(Object.hasOwn(timer, "nhkQuake")) handleIntervalFunction.regist("nhkQuake", this.load_earthquake, timer.nhkQuake);
  // },
  on: (event, handler) => {
  },
  load_weather: () => {

  },
  load_earthquake: () => {

  },
  load_river: () => {

  },
  load_tsunami: () => {

  },
  load_volcano: () => {

  },
  start_websocket_p2pquake: () => {
    websocket_request.create("p2pquake", "wss://api.p2pquake.net/v2/ws", {
      open: function (){
        console.log("websocket: (open)    p2pquake");
      },
      close: function (){
        console.log("websocket: (close)   p2pquake");
        setTimeout(function (){ websocket_request.open("p2pquake") }, 1500);
      },
      message: function (data, isBinary){
        const plaindata = iconv.decode(data, "utf-8");
        const rootdata = JSON.parse(plaindata);
        console.log("["+(new Date()).toISOString()+"] websocket: (message) p2pquake; isBinary = " + isBinary + ", code = "+rootdata.code);
        if (rootdata.code !== 555){
          console.log(plaindata);
        } else {
          for (const area of rootdata.areas) {
            const index = p2pquake_areacode_data.num.indexOf(area.id);
            const areaname = p2pquake_areacode_data.area[index];
            // console.log(areaname+"\n "+area.peer);
          }
        }
      },
      error: function (errorobj){
        console.log("websocket: (error)   p2pquake");
      },
      ping: function (){
        return `{"type":"ping"}`;
      }
    }, {
      handlename: "p2p地震情報",
      hiddenRequest: false,
      sourceurl: "wss://api.weathernews.jp/p2pquake"
    });
    websocket_request.open("p2pquake");
  }
};
// http_request.create("");
exportObject.start_websocket_p2pquake();

module.exports = exportObject;
