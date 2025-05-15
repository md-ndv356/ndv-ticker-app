/** HTTPリクエストを管理 */

const { ipcMain } = require("electron");
const { request } = require("express");
const iconv = require("iconv-lite");
const { EventEmitter } = require("events");

const eventEmitter = new EventEmitter();
const axios = require("axios").default;
const CancelToken = axios.CancelToken;
axios.defaults.responseType = "arraybuffer";
BigInt.prototype.toJSON = function() { return this.toString() };

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

const http_requests = {};
const http_request_object = {
  /**
   * @param {string} key - XHRキー
   * @param {string} url - URL
   * @param {object} options - オプション
   * @param {string} [options.method] - HEAD / GET / POST / PUT / OPTIONS
   * @param {string} [options.calledName] - トラフィックモニターで使用される名前
   * @param {boolean} [options.cache_invalid] - キャッシュの有無（falseで有効）
   * @param {Document | Blob | BufferSource | FormData | URLSearchParams} [options.postData] - POSTするデータ
   * @param {string} [options.responseType] - レスポンスの種類
   */
  create: function (key, url, options = {}){
    if (!key) throw new Error('Argument "key" is required.'); else key = key + "";
    if (!url) throw new Error('Argument "url" is required.'); else url = url + "";
    if (typeof options !== "object") throw new Error('The argument "options" must be object.');
    if (!options.method) options.method = "GET";
    options.method = options.method.toLocaleUpperCase();

    let request = http_requests[key] = { options, url: new URL(url), timestamp_start: [], timestamp_end: [], receivedBytes: 0n };

    eventEmitter.emit("HTTPNetworkUpdate", {
      type: "create",
      key: key,
      name: request.options.handlename || key,
      hidden: request.options.hiddenRequest || false,
      timestamp_start: request.timestamp_start.at(-1),
      timestamp_end: request.timestamp_end.at(-1),
      url: request.options.sourceurl || request.url.origin + request.url.pathname,
      count: 0, totalBytes: 0n
    });
  },

  send: function (key){
    return new Promise((resolve, reject) => {
      const request = http_requests[key];
      if (!request) return;
      const url = request.url.href + (request.options.cache_invalid ? Date.now()+"" : "");
      const cancelSource = request.cancelSource = CancelToken.source();

      if (request.options.method === "GET"){
        const timestamp_start = Date.now();
        request.timestamp_start.push(timestamp_start);
        eventEmitter.emit("HTTPNetworkUpdate", {
          type: "send_start", key: key,
          name: request.options.handlename || key,
          hidden: request.options.hiddenRequest || false,
          timestamp: timestamp_start,
          count: request.timestamp_start.length,
          totalBytes: request.receivedBytes
        });
        axios.get(url, { cancelToken: cancelSource.token }).then(response => {
          const timestamp_end = Date.now();
          request.timestamp_end.push(timestamp_end);
          request.receivedBytes += BigInt(response.data.length);
          eventEmitter.emit("HTTPNetworkUpdate", {
            type: "send_end", key: key,
            name: request.options.handlename || key,
            hidden: request.options.hiddenRequest || false,
            timestamp: timestamp_end,
            count: request.timestamp_start.length,
            totalBytes: request.receivedBytes
          });
          if (request.options.responseType.includes(["text", "json", "xml"])) response.data = iconv.decode(response.data, response.headers["content-type"].match(/charset=([a-zA-Z\-_0-9]+)/)?.[1] ?? "utf-8");
          switch (request.options.responseType) {
            case "json":
              response.data = JSON.parse(response.data);
              break;
            case "xml":
              response.data = (new DOMParser()).parseFromString(response.data, "application/xml");
              break;
          }
          // console.log(response);
          resolve(response);
        }).catch(error => {
          const timestamp_error = Date.now();
          eventEmitter.emit("HTTPNetworkUpdate", {
            type: "send_error", key: key,
            name: request.options.handlename || key,
            hidden: request.options.hiddenRequest || false,
            timestamp: timestamp_error,
            count: request.timestamp_start.length,
            totalBytes: request.receivedBytes
          });
          reject(error);
        });
      }
      // console.log(request.options.method + " - " + url);
    });
  },

  abort: function (key){
    let request = http_requests[key];
    if (!request) return;
    if (!request.cancelSource) return;
    request.cancelSource.cancel();
  },

  del: function (key){
    if (!Object.hasOwn(http_requests, key)) return;
    if (!request.cancelSource) http_requests[key].cancelSource.cancel();
    delete http_requests[key];
  },

  change_url: function (key, url, postData){
    let request = http_requests[key];
    if (!request) return;
    request.url = new URL(url);
    request.options.postData = postData;
  },

  get_customdata: function (key){
    let request = http_requests[key];
    if (!request) return;
    return request.options.customData;
  },

  get_latest_time: function (key){
    let request = http_requests[key];
    if (!request) return;
    return {
      start: request.timestamp_start.length ? (request.timestamp_start.at(-1) - 0) / 1000 : 0,
      end: request.timestamp_end.length ? (request.timestamp_end.at(-1) - 0) / 1000 : 0,
    };
  },

  get_frequency: function (key){
    const request = http_requests[key];
    if (!request) return;
    let tm = new Date();
    let tmst_1hour = tm - 3600000;
    tm.setHours(0);
    tm.setMinutes(0);
    tm.setSeconds(0);
    let tmst_today = tm.setMilliseconds(0);
    let hour_array = request.timestamp_start.filter(time => time >= tmst_1hour);
    let today_array = request.timestamp_start.filter(time => time >= tmst_today);
    let period_ms = request.timestamp_start.at(-1) - request.timestamp_start.at(0);
    let graph_10min = { label: [], data: [] };
    {
      let temp0 = request.timestamp_start.at(-1);
      let temp1 = new Date(request.timestamp_start[0]);
      temp1.setMinutes(Math.floor(temp1.getMinutes()/10)*10);
      temp1.setSeconds(0);
      temp1.setMilliseconds(0);
      let temp2 = temp1 - 0;
      let temp9 = 0;
      let temp8 = 0;
      do {
        graph_10min.label.push(formatDate(temp1, "MM/dd HH:mm"));
        const tempidx = graph_10min.data.push(0) - 1;
        while ((temp8 = request.timestamp_start[temp9]) && temp2 - (-600000) > temp8) {
          graph_10min.data[tempidx]++; temp9++;
        }
        temp1.setMinutes(temp1.getMinutes()+10);
        temp2 = temp1 - 0;
      } while (temp2 < temp0);
    }
    return {
      total_count: request.timestamp_start.length,
      today_count: today_array.length,
      hour_count: hour_array.length,
      today_freq: (today_array.length-1) / Math.min(86400000, period_ms) * 86400000 + 1,
      hour_freq: (request.timestamp_start.length-1) / period_ms * 3600000 + 1,
      graph_10min,
      cfg_hour: hour_array,
      cfg_today: today_array,
      cfg_tm0: request.timestamp_start[0]
    };
  },

  get_httplist: function (...args){
    if (args.length === 0){
      return Object.keys(http_requests).map(item => {
        return {
          type: "HTTP",
          key: item,
          name: http_requests[item].options.handlename || item,
          hidden: http_requests[item].options.hiddenRequest || false,
          timestamp_start: http_requests[item].timestamp_start.at(-1),
          timestamp_end: http_requests[item].timestamp_end.at(-1),
          url: http_requests[item].options.sourceurl || http_requests[item].url.origin,
          count: http_requests[item].timestamp_start.length,
          totalBytes: http_requests[item].receivedBytes
        }
      });
    } else if (args.length >= 1){
      const arg0 = args[0]; // key
      const latest_time = http_request_object.get_latest_time(arg0);
      const frequency = http_request_object.get_frequency(arg0);
      return {
        time: latest_time,
        freq: frequency,
        bytes: http_requests[arg0].receivedBytes.toString()
      };
    }
  },

  on: function (event, callback){
    if (typeof event !== "string") throw new Error('The argument "event" must be string.');
    if (typeof callback !== "function") throw new Error('The argument "callback" must be function.');
    eventEmitter.on(event, callback);
  },

  _debug: function (key){
    return http_requests[key];
  }
};


ipcMain.handle("HTTPRequest.getStateFromKey", (sender, key) => {
  if(Object.hasOwn(http_requests, key)){
    // 将来的にグラフも表示してみたいね（svir.jpで見られたあのグラフのような）
    return {
      ...http_request_object.get_latest_time(key),
      ...http_request_object.get_frequency(key)
    };
  } else {
    return { error: "Not Found" };
  }
});

module.exports = http_request_object;


