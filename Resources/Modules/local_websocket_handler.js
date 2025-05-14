/** 内部利用WebSocket管理 */

const {createHash} = require("crypto");
const websocket = require("ws").Server;
const crypto = require("crypto");
const textEncoder = require("encoding-japanese");

const websocket_port = 51150 + Math.floor(Math.random() * 15);
const websocket_users = {};
const websocket_server = new websocket({port: websocket_port});
console.log("Websocket Port: " + websocket_port);
const network_request_event = function (){
  return {
    http: get_httplist(),
    ws: get_websocketlist()
  };
};
const network_request_fromkey = function (target_type, target_key){
  if (target_type === "WebSocket"){
    const network_data = get_websocketlist();
    const target_summary = network_data.find(data => data.key === target_key);
    const target_detail = get_websocketlist(target_key);
    return {
      type: "WebSocket",
      summary: target_summary,
      detail: target_detail
    };
  } else if (target_type === "HTTP"){
    const network_data = get_httplist();
    const target_summary = network_data.find(data => data.key === target_key);
    const target_detail = get_httplist(target_key);
    return {
      type: "HTTP",
      summary: target_summary,
      detail: target_detail
    };
  } else if (target_type === "TCP"){
  } else { throw new Error("Unidentified Network Type: "+target_type); }
  // if(!target_data) throw new Error("Unidentified Network Key: "+target_key+" ["+target_type+"]");
};
websocket_server.on("connection", (ws) => {
  let userKeys = crypto.randomBytes(16).toString("hex");
  websocket_users[userKeys] = ws;
  ws.uniqueKey = userKeys;
  ws.on("message", msg => {
    console.log(msg);
    msg = textEncoder.codeToString(msg);
    const data = JSON.parse(msg);
    switch (data.type) {
      case "network_activity_list":
        send_message(ws, "network_activity_list", JSON.stringify(network_request_event()));
        break;
      case "network_key_info":
        if(!data.body.requestType){send_message(ws, "error", `{"error": "Requested type was not found."}`); return;}
        if(!data.body.requestKey){send_message(ws, "error", `{"error": "Requested key was not found."}`); return;}
        send_message(ws, "network_key_info", JSON.stringify(network_request_fromkey(data.body.requestType, data.body.requestKey)));
    }
  });
  ws.on("close", (function() {
    delete websocket_users[this.uniqueKey];
  }).bind(ws));
  send_message(ws, "connection_established", "{}");
});

function send_message (destination, type, body){
  const md5hash = createHash("md5");
  // console.log(body);
  md5hash.update(body);
  destination.send(JSON.stringify({ type, hash: md5hash.digest("hex"), body }));
}

let get_httplist = function(){};
let get_websocketlist = function(){};

module.exports = {
  send: function (type, body){
    for (const key in websocket_users) {
      if (Object.hasOwnProperty.call(websocket_users, key)) {
        const ws = websocket_users[key];
        send_message(ws, type, body);
      }
    }
  },
  get_port: function (){
    return websocket_port;
  },
  regist_event: function (type, event){
    switch (type) {
      case "get_httplist":
        get_httplist = event;
        break;
      case "get_websocketlist":
        get_websocketlist = event;
        break;
    }
  }
};
