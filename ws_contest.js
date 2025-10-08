// Node.jsで動作する、WebSocketの接続テスト（とログ作成）
const args = process.argv.slice(2);
const zlib = require("zlib");

if (args.length < 1){
  console.error("Usage: node ws_contest.js <WebSocket URL>");
  process.exit(1);
}

const WebSocket = require('ws');
const url = args[0];

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
