const { safeStorage } = require("electron");
const crypto = require("crypto");

const appDataHandler = require("./appdata_handler");
const ENCRYPTION_KEY_LOCATION = ".eckey";

const caches = {
  encKeyRaw: null
};

// 参考
// https://zenn.dev/progate/articles/electron-app-security

/**
 * safeStorage の利用可否を確認します。
 */
const checkAvailability = () => {
  if (!safeStorage.isEncryptionAvailable()) {
    throw Error("safeStorageは利用できません。機密情報の保管にはsafeStorageによる暗号化が必要です。");
  }
};

/**
 * 暗号鍵（32バイト）を生成・保管し、base64文字列として取得します。
 * - .eckey には safeStorage で暗号化済みの base64文字列を保存します。
 * @returns {Promise<string>} base64エンコード済みの鍵（32バイト）
 */
const getEncryptionKeyRaw = async () => {
  if (caches.encKeyRaw) return caches.encKeyRaw;

  console.log("暗号鍵を取得します。");
  if (await appDataHandler.exists(ENCRYPTION_KEY_LOCATION)) {
    const encB64 = await appDataHandler.read(ENCRYPTION_KEY_LOCATION);
    const encBuf = Buffer.from(encB64, "base64");
    return caches.encKeyRaw = safeStorage.decryptString(encBuf);
  }
  console.log("暗号鍵が存在しないため新規生成します。");

  const keyB64 = crypto.randomBytes(32).toString("base64");
  const wrapped = safeStorage.encryptString(keyB64).toString("base64");
  await appDataHandler.save(ENCRYPTION_KEY_LOCATION, wrapped);

  console.log("暗号鍵を生成・保存しました。");
  return keyB64;
};

/**
 * バイナリ鍵を取得（32バイト）。
 * @returns {Promise<Buffer>}
 */
const getKeyBytes = async () => {
  const keyB64 = await getEncryptionKeyRaw();
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    throw Error("暗号鍵の長さが不正です（想定: 32バイト）");
  }
  return key;
};

// フォーマット: v2:<ivBase64>:<tagBase64>:<ciphertextBase64>
// アルゴリズム名は外部表現に含めない（内部実装はAES-256-GCM）。
const FORMAT_PREFIX = "v2:";
const ALG = "aes-256-gcm"; // 認証付き暗号（改ざん検知）
const IV_LEN = 12; // GCM推奨 96bit

module.exports = {
  /**
  * safeStorage を利用して暗号化されたデータを読み取り復号します。
   * @param {string} filename ファイルの読み取り先
   * @returns {Promise<string>} 復号後のプレーンテキスト
   */
  read: async (filename) => {
    checkAvailability();

    const raw = await appDataHandler.read(filename);
    if (typeof raw !== "string" || !raw.startsWith(FORMAT_PREFIX)) {
      throw Error("不明なフォーマットです（期待: v2）");
    }
    const body = raw.slice(FORMAT_PREFIX.length);
    const parts = body.split(":");
    if (parts.length !== 3) {
      throw Error("暗号データの形式が不正です（iv:tag:ciphertext）");
    }

    const [ivB64, tagB64, ctB64] = parts;
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const key = await getKeyBytes();

    const decipher = crypto.createDecipheriv(ALG, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = decipher.update(ctB64, "base64", "utf-8") + decipher.final("utf-8");
    return decrypted;
  },

  /**
   * プレーンテキストを暗号化して保存します。
   * @param {string} filename ファイルの保存先
   * @param {string} data 書き込みデータ（UTF-8）
   * @returns {Promise<void>}
   */
  write: async (filename, data) => {
    checkAvailability();

    const key = await getKeyBytes();
    const iv = crypto.randomBytes(IV_LEN);

    const cipher = crypto.createCipheriv(ALG, key, iv);
    const ciphertext = cipher.update(data, "utf-8", "base64") + cipher.final("base64");
    const tagB64 = cipher.getAuthTag().toString("base64");

    const payload = FORMAT_PREFIX + iv.toString("base64") + ":" + tagB64 + ":" + ciphertext;
    await appDataHandler.save(filename, payload);
  },

  /**
   * 指定したファイルが存在するか確認します。
   * @param {string} filename - チェックするファイル名
   * @returns {Promise<boolean>} - 存在する場合は true、存在しない場合は false
   */
  exists: async (filename) => {
    return appDataHandler.exists(filename);
  }
};

/**
 * This file is written by looksky495 with GPT-5.
 * 将来のフォーマット更新・アルゴリズム切替 手順メモ
 * --------------------------------------------------
 * 目的: ディスク上のフォーマット（現行 v2:）や内部暗号実装（現行 AES-256-GCM）を変更する際の安全な手順。
 * ポリシー: ディスク上のプレフィックスは世代のみ（例: v3:）。アルゴリズム名は外部表現に含めない。
 *
 * 1) 新フォーマットの設計
 *   - 新規プレフィックスを定義: const FORMAT_PREFIX_V3 = "v3:"（実装はこのファイル内の定数として追加）
 *   - 内部実装（例: ChaCha20-Poly1305）に切り替える場合は、IV/nonce長やタグ取り扱いを明記
 *   - 必要なら AAD（追加認証データ）でアプリIDやスキーマバージョンを認証対象に含める
 *
 * 2) 読み取り互換の拡張
 *   - read():
 *       if (raw.startsWith("v3:")) → v3の復号パス
 *       else if (raw.startsWith("v2:")) → 既存（本ファイルの現行）復号パス
 *       else → 不明フォーマットで fail-fast
 *   - v2 と v3 の両パスで単体テストを用意（ハッピーパス＋タグ改ざん検知）
 *
 * 3) 書き込みポリシーの決定
 *   - 基本は「常に最新（v3）で保存」。
 *   - 互換維持が不要なら、設定やフラグなしで v3 固定にしてよい。
 *
 * 4) 移行戦略（選択肢）
 *   - 遅延移行（Lazy）: v2 を読み込んだ直後に、復号済みデータを v3 で再保存。成功後に v2 を上書き（またはバックアップ→削除）。
 *     メリット: 実際に使われるデータのみ移行。デメリット: 初回アクセス時に書込みが発生。
 *   - 先行一括移行（Eager）: 既知の保存ファイル群を起動時または専用コマンドで一括スキャンし、v2→v3 へ変換。
 *     メリット: 以降のアクセスが軽い。デメリット: 変換処理の総量が大きい場合がある。
 *
 * 5) 鍵の扱い
 *   - 現行は safeStorage でラップした 32バイト鍵（.eckey, base64）。v3 でも同じ鍵を継続利用可。
 *   - 鍵をローテーションしたい場合は、キーID（kid）をメタで管理し、v3.1 など“世代内のサブ世代”で回す設計も可能。
 *   - 鍵ローテ時は「古い鍵で復号 → 新しい鍵で再暗号化 → 保存」を安全に実施。途中失敗に備え、書込みはアトミックに。
 *
 * 6) エラーハンドリング/フェイルセーフ
 *   - 不明プレフィックスは即エラー（fail-fast）。
 *   - タグ検証失敗（改ざん検知）は例外で停止し、上位でユーザー通知。
 *   - 移行中に失敗した場合、原本（旧フォーマット）を残してロールバックできるようにする。
 *
 * 7) テスト観点
 *   - ラウンドトリップ: plaintext → encrypt(v3) → decrypt(v3) が恒等
 *   - 互換: 既存サンプル（v2）の decrypt が成功し、必要なら lazy で v3 再保存される
 *   - 改ざん検知: IV/タグ/本文の各部を壊したときに decrypt が例外で落ちる
 *   - 併用: 複数並行 read/write が交錯しても整合性が保たれる（特に lazy 移行時）
 *
 * 8) 実装の追加メモ
 *   - 実装切替はこのファイル内の定数と分岐を増やすだけでよい（外部APIはそのまま）。
 *   - v2→v3 の一括移行ユーティリティが必要なら、別モジュール（例: safestorage_migrator.js）に切り出すと安全。
 *   - ディスク上は常に「世代のみ」を露出し、アルゴリズム名は公開しない方針を維持する。
 */
