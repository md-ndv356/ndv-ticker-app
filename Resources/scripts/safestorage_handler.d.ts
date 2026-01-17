/**
 * safeStorage とアプリ内共通鍵を用いて、機密データを暗号化保存・復号する。
 *
 * 例外
 * - safeStorage が利用できない環境では例外を投げる
 * - 不明なフォーマット／改ざん検知（タグ不一致）時は例外を投げる
 */

/**
 * 暗号化データを読み取り、復号したプレーンテキストを返す。
 * @param filename 保存ファイルの相対/絶対パス
 * @returns 復号済みの文字列データ
 */
declare function read(filename: string): Promise<string>;

/**
 * プレーンテキストを暗号化して保存する。
 * @param filename 保存ファイルの相対/絶対パス
 * @param data 保存する文字列（UTF-8）
 * @returns void（Promise）
 */
declare function write(filename: string, data: string): Promise<void>;

/**
 * 指定したファイルが存在するか確認します。
 * @param filename - チェックするファイル名
 * @returns {Promise<boolean>} - 存在する場合は true、存在しない場合は false
 */
declare function exists(filename: string): Promise<boolean>;

declare const _default: {
  read: typeof read
  write: typeof write
  exists: typeof exists
};

export = _default;
