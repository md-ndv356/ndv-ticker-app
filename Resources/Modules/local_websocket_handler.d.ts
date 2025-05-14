declare namespace local_websocket_handler {
  function send(type: string, body: string): void;
  function get_port(): number;
  function regist_event(type: string, event: Function): void;
}