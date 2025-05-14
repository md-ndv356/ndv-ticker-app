type postDataType = Document | Blob | BufferSource | FormData | URLSearchParams;
type HTTP_frequencyData = {
  total_count: number;
  today_conut: number;
  hour_count: number;
  today_freq: number;
  hour_freq: number;
  graph_10min: {
    label: string[];
    data: number[];
  }
  cfg_hour: number[];
  cfg_today: number[];
  cfg_tm0: number;
};

declare namespace http_request_object {
  function create (key: string, url: string, options: {
    responseType: 'text' | 'json' | 'arraybuffer';
    method?: string;
    cache_invalid?: boolean;
    postData?: postDataType;
    calledName?: string;
  }): void;
  function send (key: string): Promise<any>;
  function abort (key: string): void;
  function del (key: string): void;
  function change_url (key: string, url: string, postData?: postDataType): void;
  function get_customdata (key: string): any;
  function set_customdata (key: string, value: any): void;
  function get_latest_time (key: string): {
    start: number;
    end: number;
  };
  function get_frequency (key: string): HTTP_frequencyData;
  function get_httplist (): {
    key: string;
    name: string | undefined;
  }[];
  function get_httplist (key): {
    time: number;
    freq: HTTP_frequencyData;
    bytes: string;
  };
  function _debug (key: string): any;
}

export = http_request_object;