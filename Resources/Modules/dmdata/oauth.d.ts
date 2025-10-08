/**
 * dmdata/oauth.d.ts
 * dmdata.jp OAuth 2.0 (Authorization Code + PKCE) ハンドラ。
 * Main プロセスで利用する。
 */

/** 認可 / リフレッシュ 成功時の返却オブジェクト */
export interface OAuthTokenResult {
  /** アクセストークン (Bearer) */
  accessToken: string;
  /** サーバから返却されたスコープ（スペース区切り） */
  scope: string;
}

/**
 * ブラウザ（外部）で dmdata の認可画面を開き、コールバック受信後アクセストークンを取得する。
 * 内部で PKCE (S256) と state 検証を行う。
 * @returns アクセストークンとスコープ
 */
export function authenticate(): Promise<OAuthTokenResult>;

/**
 * 保存済みリフレッシュトークンを用いてアクセストークンを更新する。
 * リフレッシュトークンが存在しない場合はエラーを投げる。
 * 多重呼び出し時は同一更新処理を共有する（実装側でロック）。
 * @returns 新しいアクセストークンとスコープ
 */
export function refresh(): Promise<OAuthTokenResult>;

/**
 * リフレッシュトークンをサーバ側で失効させ、ローカル保存をクリアする。
 * トークンが無い場合は false（何もしていない）を返す。
 * @returns 実際に失効処理を行った場合 true
 */
export function revoke(): Promise<boolean>;

/**
 * accessToken が未取得または有効期限（6時間想定）-60秒以内なら refresh() を行い最新を返す。
 * 呼び出し側は期限管理を意識せず常に最新のアクセストークンを取得できる。
 */
export function ensureAccessToken(): Promise<string>;

declare const _default: {
  authenticate: typeof authenticate;
  refresh: typeof refresh;
  revoke: typeof revoke;
  ensureAccessToken: typeof ensureAccessToken;
};

export = _default;
