import { Server as WebSocketServer } from "ws";

export interface NetworkRequestEvent {
  http: any[];
  ws: any[];
}

export interface NetworkRequestFromKeyResult {
  type: "WebSocket" | "HTTP" | "TCP";
  summary: any;
  detail: any;
}

export interface LocalWebSocketHandler {
  /**
   * WebSocketサーバーを起動する
   */
  server_start(): WebSocketServer;

  /**
   * 全てのWebSocketクライアントにメッセージを送信する
   * @param type メッセージタイプ
   * @param body メッセージ文字列
   */
  send(type: string, body: string): void;

  /**
   * WebSocketサーバーのポート番号を取得する
   */
  get_port(): number;
}

declare const localWebSocketHandler: LocalWebSocketHandler;
export = localWebSocketHandler;
