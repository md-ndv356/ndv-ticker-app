/** WebSocket通信管理 */

const { ipcMain } = require("electron");
const WebSocket = require("ws");
const { EventEmitter } = require("events");
const eventEmitter = new EventEmitter();

// https://zukucode.com/2017/04/javascript-date-format.html
function formatDate (date, format) {
  if(isNaN(date-0)) return "";
  format = format.replaceAll("yyyy", date.getFullYear());
  format = format.replaceAll("MM", ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replaceAll("dd", ('0' + date.getDate()).slice(-2));
  format = format.replaceAll("HH", ('0' + date.getHours()).slice(-2));
  format = format.replaceAll("mm", ('0' + date.getMinutes()).slice(-2));
  format = format.replaceAll("ss", ('0' + date.getSeconds()).slice(-2));
  format = format.replaceAll("fff", ('00' + date.getMilliseconds()).slice(-3));
  return format;
};

const websocket_list = {
  _declare: {
    // ws: new WebSocket("ws://localhost:99999"),
    url: new URL("ws://127.0.0.1:9999"),
    count: 0,
    events: {
      open: function (){},
      close: function (){},
      message: function (){},
    },
    status: "closed", // connecting, opening, closed
    logs: {
      timestamp: {
        start: 2,
        receive: [5, 12],
        totalReceive: 13n
      },
      receivedBytes: 8192n,
      customData: {},
      intervalId: 14
    },
    options: {
      handlename: "Template",
      hiddenRequest: true,
      sourceurl: "ws://websocket_list.jp/template"
    }
  }
};
const requestEvent = {
  open: function (){
    const key = this.keyname;
    const request = websocket_list[key];
    request.logs.timestamp.start = Date.now();
    request.status = "opening";
    request.events.open();
    eventEmitter.emit("WebSocketNetworkUpdate", {
      type: "open", key: key,
      name: request.options.handlename || key,
      hidden: request.options.hiddenRequest || false,
      timestamp: request.logs.timestamp.start
    });
    if(request.events.ping) request.logs.intervalId = setInterval((key, pingDataCreator) => {
      exportObject.send(key, pingDataCreator());
    }, 60000, key, request.events.ping);
  },
  close: function (code, reason){
    const key = this.keyname;
    const request = websocket_list[key];
    request.status = "closed";
    request.events.close(code, reason);
    eventEmitter.emit("WebSocketNetworkUpdate", {
      type: "closed", key: key,
      name: request.options.handlename || key,
      hidden: request.options.hiddenRequest || false,
      timestamp: Date.now()
    });
    clearInterval(request.logs.intervalId);
  },
  error: function (errorobj){
    const key = this.keyname;
    const request = websocket_list[key];
    if (request.events.error){
      request.events.error(errorobj);
    } else {
      throw errorobj;
    }
  },
  message: function (data, isBinary){
    const key = this.keyname;
    const request = websocket_list[key];
    const timestamp = Date.now();
    request.count++;
    request.logs.timestamp.receive.push(timestamp);
    request.logs.timestamp.totalReceive += BigInt(timestamp - request.logs.timestamp.start);
    request.logs.receivedBytes += BigInt(data.length);
    eventEmitter.emit("WebSocketNetworkUpdate", {
      type: "message_receive", key: key,
      name: request.options.handlename || key,
      hidden: request.options.hiddenRequest || false,
      timestamp: timestamp,
      count: request.count,
      totalBytes: request.logs.receivedBytes.toString()
    });
    request.events.message(data, isBinary);
  }
};

const exportObject = {
  create: function (key, url, events, options = {}){
    if (!key) throw new Error('Argument "key" is required.'); else key = key + "";
    if (!url) throw new Error('Argument "url" is required.'); else url = url + "";
    if (typeof options !== "object") throw new Error('The argument "options" must be object.');
    if (typeof events !== "object") throw new Error('The argument "events" must be object.');
    if (typeof events.open !== "function") throw new Error('The argument "events.open" must be function.');
    if (typeof events.close !== "function") throw new Error('The argument "events.close" must be function.');
    if (typeof events.message !== "function") throw new Error('The argument "events.message" must be function.');
    if (events.ping && typeof events.ping !== "function") throw new Error('The argument "events.ping" must be function.');
    websocket_list[key] = {
      url: new URL(url),
      ws: undefined,
      count: 0,
      logs: {
        timestamp: {
          start: 0,
          receive: [],
          totalReceive: 0n
        },
        receivedBytes: 0n,
        customData: null,
        intervalId: null
      }, events, options
    };
  },
  open: function (key){
    if (!key) throw new Error('Argument "key" is required.'); else key = key + "";
    const request = websocket_list[key];
    if (!request) return;
    let ws = request.ws = new WebSocket(request.url);
    request.status = "connecting";
    ws.keyname = key;
    eventEmitter.emit("WebSocketNetworkUpdate", JSON.stringify({
      type: "connect", key: key,
      name: request.options.handlename || key,
      hidden: request.options.hiddenRequest || false,
      timestamp: Date.now()
    }));
    ws.on("open", requestEvent.open);
    ws.on("close", requestEvent.close);
    ws.on("message", requestEvent.message);
    ws.on("error", requestEvent.error);
  },
  close: function (key){
    if (!key) throw new Error('Argument "key" is required.'); else key = key + "";
    const request = websocket_list[key];
    if (!request) return;
    request.ws.close();
  },
  send: function (key, message){
    if (!key) throw new Error('Argument "key" is required.'); else key = key + "";
    const request = websocket_list[key];
    if (!request) return;
    request.ws.send(message);
  },
  del: function (key){
    if (!Object.hasOwn(websocket_list, key)) return;
    delete websocket_list[key];
  },
  get_customdata: function (key){
    return websocket_list[key]?.logs?.customData;
  },
  set_customdata: function (key, data){
    if (!key) throw new Error('Argument "key" is required.'); else key = key + "";
    const request = websocket_list[key];
    if (!request) return;
    request.logs.customData = data;
  },

  get_detail: function (key){
    const request = websocket_list[key];
    // const request = websocket_list["_declare"]; // debug
    if (!request) return;
    const currentDate = new Date();
    const date1hourBack = currentDate - 3600000;
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    const todayTimestamp = currentDate.setMilliseconds(0);
    const today_array = request.logs.timestamp.receive.filter(time => time >= todayTimestamp);
    const hour_array = today_array.filter(time => time >= date1hourBack);
    const period_ms = request.logs.timestamp.receive.at(-1) - request.logs.timestamp.receive.at(0);
    const graph_10min = { label: [], data: [] };
    {
      let temp0 = request.logs.timestamp.receive.at(-1);
      let temp1 = new Date(request.logs.timestamp.receive[0]);
      temp1.setMinutes(Math.floor(temp1.getMinutes()/10)*10);
      temp1.setSeconds(0);
      temp1.setMilliseconds(0);
      let temp2 = temp1 - 0;
      let temp9 = 0;
      let temp8 = 0;
      do {
        graph_10min.label.push(formatDate(temp1, "MM/dd HH:mm"));
        const tempidx = graph_10min.data.push(0) - 1;
        while ((temp8 = request.logs.timestamp.receive[temp9]) && temp2 - (-600000) > temp8) {
          graph_10min.data[tempidx]++; temp9++;
        }
        temp1.setMinutes(temp1.getMinutes()+10);
        temp2 = temp1 - 0;
      } while (temp2 < temp0);
    }
    return {
      total_count: request.logs.timestamp.receive.length,
      today_count: today_array.length,
      hour_count: hour_array.length,
      hour_freq: (request.logs.timestamp.receive.length-1) / period_ms * 3600000 + 1,
      today_freq: (today_array.length-1) / Math.min(86400000, period_ms) * 86400000 + 1,
      started_time: request.logs.timestamp.start,
      graph_10min,
      cfg_hour: hour_array,
      cfg_today: today_array,
      cfg_tm0: request.logs.timestamp.receive[0]
    };
  },
  get_socketlist: function (...args){
    if (args.length === 0){
      return Object.keys(websocket_list).map(item => {
        const request = websocket_list[item];
        return {
          type: "WebSocket",
          key: item,
          name: request.options.handlename || item,
          hidden: request.options.hiddenRequest || false,
          timestamp_start: request.logs.timestamp.start,
          timestamp_receive: request.logs.timestamp.receive.at(-1),
          url: request.options.sourceurl || request.url.origin + request.url.pathname,
          count: request.count,
          totalBytes: request.logs.receivedBytes.toString()
        }
      });
    } else if (args.length === 1) {
      const arg0 = args[0]; // key
      const request = websocket_list[arg0];
      const frequency = exportObject.get_detail(arg0);
      return {
        time: {},
        freq: frequency,
        bytes: request.logs.receivedBytes.toString(),
        status: request.status
      };
    }
  },

  on: function (event, callback){
    if (typeof event !== "string") throw new Error('The argument "event" must be string.');
    if (typeof callback !== "function") throw new Error('The argument "callback" must be function.');
    eventEmitter.on(event, callback);
  }
};

// setTimeout(function (){ exportObject.close("p2pquake"); }, 17000);
// setTimeout(function (){ exportObject.send("p2pquake", `{"type":"ping"}`); }, 26000);

ipcMain.handle("WebSocketRequest.getStatusFromKey", (sender, key) => {
  if(Object.hasOwn(websocket_list, key)){
    return exportObject.get_detail(key);
  } else {
    return { error: "Not Found" };
  }
});

module.exports = exportObject;
