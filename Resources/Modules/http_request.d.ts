type postDataType = Document | Blob | BufferSource | FormData | URLSearchParams;
type HTTPFrequencyData = {
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

type HTTPRequestCreateEvent = {
  type: "create";
  key: string;
  name: string;
  hidden: boolean;
  timestamp_start: number;
  timestamp_end: number;
  url: string;
  count: number;
  totalBytes: BigInt;
}

type HTTPRequestSendEvent = {
  type: "sned_start" | "send_end" | "send_error";
  key: string;
  name: string;
  hidden: boolean;
  timestamp: number;
  count: number;
  totalBytes: BigInt;
}

/**
 * HTTPリクエストを管理するオブジェクト
 */
declare const http_request_object: {
  /**
   * HTTPリクエストを作成します。
   * @param key - XHRキー
   * @param url - URL
   * @param options - オプション
   * @param options.method - HTTPメソッド (HEAD / GET / POST / PUT / OPTIONS)
   * @param options.calledName - トラフィックモニターで使用される名前
   * @param options.cache_invalid - キャッシュの有無（falseで有効）
   * @param options.postData - POSTするデータ
   * @param options.responseType - レスポンスの種類
   */
  create (key: string, url: string, options: {
    responseType: 'text' | 'json' | 'arraybuffer';
    method?: "HEAD" | "GET" | "POST" | "PUT" | "OPTIONS";
    cache_invalid?: boolean;
    postData?: postDataType;
    calledName?: string;
  }): void;

  /**
   * HTTPリクエストを送信します。
   * @param key - XHRキー
   * @returns レスポンスのPromise
   */
  send (key: string): Promise<any>;

  /**
   * HTTPリクエストを中止します。
   * @param key - XHRキー
   */
  abort (key: string): void;

  /**
   * HTTPリクエストを削除します。
   * @param key - XHRキー
   */
  del (key: string): void;

  /**
   * HTTPリクエストのURLを変更します。
   * @param key - XHRキー
   * @param url - 新しいURL
   * @param postData - POSTデータ
   */
  change_url (key: string, url: string, postData?: postDataType): void;

  /**
   * カスタムデータを取得します。
   * @param key - XHRキー
   * @returns カスタムデータ
   */
  get_customdata (key: string): any;

  // set_customdata (key: string, value: any): void;

  /**
   * 最新のリクエスト時間を取得します。
   * @param key - XHRキー
   * @returns 開始時間と終了時間
   */
  get_latest_time (key: string): {
    start: number;
    end: number;
  };

  /**
   * リクエストの頻度を取得します。
   * @param key - XHRキー
   * @returns 頻度データ
   */
  get_frequency (key: string): HTTPFrequencyData;

  /**
   * HTTPリクエストリストを取得します。
   * @param args - 可変引数
   * @returns リクエストリストまたは詳細データ
   */
  get_httplist (): {
    type: "HTTP";
    key: string;
    name: string;
    hidden: boolean;
    timestamp_start: number;
    timestamp_end: number;
    url: string;
    count: number;
    totalBytes: BigInt;
  }[];
  get_httplist (key: string): {
    time: number;
    freq: HTTPFrequencyData;
    bytes: string;
  };

  /**
   * HTTPNetworkUpdateイベントを登録します。
   */
  on (key: "HTTPNetworkUpdate", callback: (data: HTTPRequestCreateEvent | HTTPRequestSendEvent) => any): void;

  _debug (key: string): any;
}

export = http_request_object;