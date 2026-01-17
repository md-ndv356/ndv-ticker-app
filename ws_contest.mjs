// Node.jsで動作する、WebSocketの接続テスト（とログ作成）
import zlib from 'zlib';
import axios from 'axios';

import WebSocket from 'ws';

const args = process.argv.slice(2);

if (args.length < 1){
  console.error("Usage: node ws_contest.js <Access Token>");
  process.exit(1);
}

// const WebSocket = require('ws');
const accessToken = args[0];

const url = await axios.post("https://api.dmdata.jp/v2/socket", {
  classifications: [
    "eew.forecast",
    "telegram.earthquake",
  ],
  appName: "ndv-ticker-app-test",
  formatMode: "json",
}, {
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`
  }
}).then(response => {
  const url = response.data.websocket.url;
  return url;
}).catch(error => {
  console.error("Failed to start socket:", error.response ? error.response.data : error.message);
  process.exit(1);
});

const ws = new WebSocket(url);

ws.on('open', function open(){
  console.log(`\u001b[32mConnected to ${url}\u001b[0m`);
});

ws.on('message', function message(data){
  const timestamp = new Date().toISOString();
  const jsonData = JSON.parse(data.toString("utf-8"));
  if (jsonData.type === "ping"){
    ws.send(JSON.stringify({type: "pong", pingId: jsonData.pingId}));
  } else {
    console.log(`[${timestamp}] ${data}`);
    const parsed = JSON.parse(data);
    if (parsed.body){
      console.log(`\u001b[36m${zlib.gunzipSync(Buffer.from(parsed.body, "base64")).toString("utf-8")}\u001b[0m`);
    }
  }
});

ws.on('error', function error(err){
  console.error(`Error: ${err.message}`);
});

ws.on('close', function close(code, reason){
  console.log(`Connection closed: ${code} - ${reason}`);
});


// Keep the process running
process.stdin.resume();

// To exit gracefully on Ctrl+C
process.on('SIGINT', () => {
  console.log('Exiting...');
  ws.close();
  process.exit();
});
