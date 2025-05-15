/** 内部利用WebSocket管理 */

const { ipcMain } = require("electron");
const { createHash } = require("crypto");
const websocket = require("ws").Server;
const crypto = require("crypto");
const textEncoder = require("encoding-japanese");

const httpRequest = require("./http_request");
const websocketHandler = require("./websocket_handler");
const { start } = require("repl");

let websocket_server = null;
const websocket_port = 51150 + Math.floor(Math.random() * 15);
const websocket_users = {};

const network_request_event = function (){
  return {
    http: httpRequest.get_httplist(),
    ws: websocketHandler.get_socketlist()
  };
};
const network_request_fromkey = function (target_type, target_key){
  if (target_type === "WebSocket"){
    const network_data = websocketHandler.get_socketlist();
    const target_summary = network_data.find(data => data.key === target_key);
    const target_detail = websocketHandler.get_socketlist(target_key);
    return {
      type: "WebSocket",
      summary: target_summary,
      detail: target_detail
    };
  } else if (target_type === "HTTP"){
    const network_data = httpRequest.get_httplist();
    const target_summary = network_data.find(data => data.key === target_key);
    const target_detail = httpRequest.get_httplist(target_key);
    return {
      type: "HTTP",
      summary: target_summary,
      detail: target_detail
    };
  } else if (target_type === "TCP"){
  } else { throw new Error("Unidentified Network Type: "+target_type); }
  // if(!target_data) throw new Error("Unidentified Network Key: "+target_key+" ["+target_type+"]");
};
const onConnection = ws => {
  const userKeys = crypto.randomBytes(16).toString("hex");
  websocket_users[userKeys] = ws;
  ws.uniqueKey = userKeys;
  ws.on("message", message => {
    console.log(message);
    message = textEncoder.codeToString(message);
    const data = JSON.parse(message);
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
};

function send_message (targetSocket, type, body){
  const md5hash = createHash("md5");
  // console.log(body);
  md5hash.update(body);
  targetSocket.send(JSON.stringify({ type, hash: md5hash.digest("hex"), body }));
}

function send_message_all (type, body){
  for (const key in websocket_users) {
    if (Object.hasOwnProperty.call(websocket_users, key)) {
      const ws = websocket_users[key];
      send_message(ws, type, body);
    }
  }
}

module.exports = {
  server_start: function (){
    websocket_server = new websocket({port: websocket_port});
    console.log("Websocket Port: " + websocket_port);
    websocket_server.on("connection", onConnection);
    httpRequest.on("HTTPNetworkUpdate", data => send_message_all("http_network_event", JSON.stringify(data)));
    websocketHandler.on("WebSocketNetworkUpdate", data => send_message_all("websocket_network_event", JSON.stringify(data)));
    return websocket_server;
  },
  send: send_message_all,
  get_port: function (){
    return websocket_port;
  }
};

ipcMain.handle("HTTPRequest.getSocketPort", () => {
  return websocket_port;
});
