/**
 * アプリケーションデータフォルダ管理モジュール
 */
declare const appdata_handler: {
  /**
   * アプリケーションデータフォルダ内にあるファイルまたはディレクトリの存在を確認します。
   * 存在する場合はtrueを、存在しない場合はfalseを返します。
   * @param filePath 対象のファイルへのパス
   * @returns 存在する場合はtrue、存在しない場合はfalse
   */
  exists (filePath: string): Promise<boolean>;

  /**
   * アプリケーションデータフォルダからデータを読み込みます。
   * @param filePath 対象のファイルへのパス
   * @param format 読み込んだデータの出力形式です。 "text", "json", "xml" を指定できます。
   * @param charset 文字コード
   * @returns データ
   */
  read (
    filePath: string,
    format?: "text" | "json" | "xml",
    charset?: string
  ): Promise<string | any | Document>;

  /**
   * アプリケーションデータフォルダにあるファイルへ書き込みを行います。
   * @param filePath 対象のファイルへのパス
   * @param data データ
   * @param charset 文字コード
   */
  save (
    filePath: string,
    data: any,
    charset?: string
  ): Promise<void>;

  /**
   * アプリケーションデータフォルダ内にディレクトリを作成します。
   * @param filePath 対象のディレクトリへのパス
   * @returns void
   */
  createDir(filePath: string): Promise<void>;
};

export = appdata_handler;
