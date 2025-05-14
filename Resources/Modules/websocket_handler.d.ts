type WebSocket_detailData = {
  total_count: number;
  today_conut: number;
  hour_count: number;
  hour_freq: number;
  today_freq: number;
  hour_freq: number;
  started_time: number;
  graph_10min: {
    label: string[];
    data: number[];
  }
  cfg_hour: number[];
  cfg_today: number[];
  cfg_tm0: number;
};

namespace websocket_handler {
  function create(key: string, url: string, events: {
    open: function;
    close: function;
    message: function;
    error: function;
  }, options?: object): void;
  function open(key: string): void;
  function close(key: string): void;
  function send(key: string, message: string | Buffer): void;
  function del(key: string): void;
  function get_customdata(key: string): any;
  function set_customdata(key: string, data: any): void;
  function get_detail(key): WebSocket_detailData;
  function get_socketlist(): void;
  function get_socketlist(key): {
    time: {};
    freq: WebSocket_detailData;
    bytes: string;
    status: "opening" | "closed" | "connecting";
  };
}

export = websocket_handler;
