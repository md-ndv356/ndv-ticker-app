export interface WebSocketEvents {
  open: () => void;
  close: (code?: number, reason?: string) => void;
  message: (data: Buffer, isBinary: boolean) => void;
  error?: (error: Error) => void;
  ping?: () => string | Buffer;
}

export interface WebSocketOptions {
  handlename?: string;
  hiddenRequest?: boolean;
  sourceurl?: string;
}

export interface WebSocketLogTimestamps {
  start: number;
  receive: number[];
  totalReceive: bigint;
}

export interface WebSocketLogs {
  timestamp: WebSocketLogTimestamps;
  receivedBytes: bigint;
  customData: any;
  intervalId: NodeJS.Timeout | null;
}

export interface WebSocketRequest {
  url: URL;
  ws?: any;
  count: number;
  logs: WebSocketLogs;
  events: WebSocketEvents;
  options: WebSocketOptions;
  status?: string;
}

export interface Graph10Min {
  label: string[];
  data: number[];
}

export interface WebSocketDetail {
  total_count: number;
  today_count: number;
  hour_count: number;
  hour_freq: number;
  today_freq: number;
  started_time: number;
  graph_10min: Graph10Min;
  cfg_hour: number[];
  cfg_today: number[];
  cfg_tm0: number;
}

export interface WebSocketListItem {
  type: string;
  key: string;
  name: string;
  hidden: boolean;
  timestamp_start: number;
  timestamp_receive: number;
  url: string;
  count: number;
  totalBytes: string;
}

export interface WebSocketStatus {
  time: object;
  freq: WebSocketDetail;
  bytes: string;
  status: "opening" | "closed" | "connecting";
}

declare const websocket_handler: {
  create(
    key: string,
    url: string,
    events: WebSocketEvents,
    options?: WebSocketOptions
  ): void;
  open(key: string): void;
  close(key: string): void;
  send(key: string, message: string | Buffer): void;
  del(key: string): void;
  get_customdata(key: string): any;
  set_customdata(key: string, data: any): void;
  get_detail(key: string): WebSocketDetail | undefined;
  get_socketlist(): WebSocketListItem[];
  get_socketlist(key: string): WebSocketStatus;

  /**
   * HTTPNetworkUpdateイベントを登録します。
   */
  on (key: "WebSocketNetworkUpdate", callback: (data: HTTPRequestCreateEvent | HTTPRequestSendEvent) => any): void;
};

export = websocket_handler;
