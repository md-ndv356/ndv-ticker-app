const oauth = require("oauth4webapi");
const { shell } = require("electron");
const axios = require("axios");
const oauthLocalServer = require("./oauth_localserver");
const safeStorageHandler = require("../safestorage_handler");

const endpoint = {
  authorization: "https://manager.dmdata.jp/account/oauth2/v1/auth",
  token: "https://manager.dmdata.jp/account/oauth2/v1/token",
  revocation: "https://manager.dmdata.jp/account/oauth2/v1/revoke"
};

const ClientID = "CId.Qk0PfqUKu3r18ZyPfp0yks6XRvYjBNTPqpXBZXhADqMn";

const caches = { state: null, redirectURI: null, verifier: null, refreshToken: null, accessToken: null, expiresAt: 0 };

const TokenPath = "dmdata_oauth2_refreshtoken";

const promises = {
  auth: { resolve: null, reject: null }
};

// 利用スコープ
const SCOPES = [
  "contract.list",
  "eew.get.forecast",
  "eew.get.warning",
  "parameter.earthquake",
  "parameter.tsunami",
  "socket.close",
  "socket.start",
  "telegram.data",
  "telegram.get.earthquake",
  "telegram.list"
];

// refresh 多重実行防止用 (同時呼び出しは同じ Promise を共有)
let refreshPromise = null;

/***
 * 保存されたリフレッシュトークンを取得します。
 * @returns {Promise<string|null>} リフレッシュトークン、または null（存在しない場合）
 */
const getRefreshToken = async () => {
  if (caches.refreshToken) return caches.refreshToken;
  if (await safeStorageHandler.exists(TokenPath)) {
    try {
      const token = (await safeStorageHandler.read(TokenPath)) || null; // 空文字列は null 扱い
      caches.refreshToken = token;
      return token;
    } catch {
      return null;
    }
  }
  return null;
};


// 有効期限（6時間）と 安全マージン（秒）
const ACCESS_TOKEN_LIFETIME_MS = 6 * 60 * 60 * 1000;
const EXP_SKEW_MS = 60 * 1000; // 60秒前に期限切れ扱い

/**
 * アクセストークンを確実に取得する。
 * 1) 未取得 or 期限切れ(マージン内) → refresh()
 * 2) そうでなければキャッシュ返却
 * @returns {Promise<string>} 有効なアクセストークン
 */
const ensureAccessToken = async () => {
  const now = Date.now();
  if (!caches.accessToken || (caches.expiresAt - now) <= EXP_SKEW_MS) {
    // refresh は内部で refreshToken の存在を検証
    const { accessToken } = await refresh();
    return accessToken;
  }
  return caches.accessToken;
};

/**
 * 認可コードのコールバック関数
 * @param {string} code 認可コード
 * @param {string} state state
 * @param {import("http").ServerResponse} res サーバー返答
 * @returns
 */
const authCallback = async (code, state, res) => {
  if (caches.state !== state){
    res.status(400).send(`期待したstateと異なります。\nExpected: ${caches.state}\nGiven: ${state}`);
    if (promises.auth.reject) promises.auth.reject(new Error(`State mismatched. Expected=${caches.state} Given=${state}`));
    return;
  }

  const token = await axios.post(endpoint.token, {
    client_id: ClientID,
    grant_type: "authorization_code",
    code,
    redirect_uri: caches.redirectURI,
    code_verifier: caches.verifier
  }, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  if (token.status !== 200) {
    if (promises.auth.reject) promises.auth.reject(new Error("アクセストークンの要求に失敗しました。\n" + token.data));
    res.status(500).send("トークン取得に失敗しました。");
    return;
  }
  const data = JSON.parse(token.data.toString("utf-8"));
  if (data.error) {
    if (promises.auth.reject) promises.auth.reject(new Error("アクセストークンの要求に失敗しました。［" + data.error + "］\n" + data.error_description));
    res.status(500).send("トークン取得エラー: " + data.error);
    return;
  }

  res.send("<p>ログインに成功しました。ウィンドウを閉じてください。</p><p><b>ログイン後に『キーチェーンに保存されている機密情報を使用します。』等のメッセージが表示されることがありますが、これはトークンの安全管理のためです。</b></p>");

  caches.refreshToken = data.refresh_token;
  await safeStorageHandler.write(TokenPath, data.refresh_token);
  caches.accessToken = data.access_token;
  caches.expiresAt = Date.now() + ACCESS_TOKEN_LIFETIME_MS;

  if (promises.auth.resolve) promises.auth.resolve({
    accessToken: data.access_token,
    scope: data.scope
  });
};

/**
 * DMdata OAuth2 認証を開始します。
 * @returns {Promise<{accessToken: string, scope: string}>} アクセストークンとスコープ
 */
const authenticate = () => {
  return new Promise((resolve, reject) => {
    const codeVerifier = caches.verifier = oauth.generateRandomCodeVerifier() + oauth.generateRandomCodeVerifier();
    oauth.calculatePKCECodeChallenge(codeVerifier).then(codeChallenge => {
      const state = caches.state = oauth.generateRandomState();
      const callbackServer = new oauthLocalServer();

      const authUrl = new URL(endpoint.authorization);
      authUrl.searchParams.set("client_id", ClientID);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("redirect_uri", caches.redirectURI = callbackServer.redirectURI + "");
      authUrl.searchParams.set("scope", SCOPES.join(" "));
      authUrl.searchParams.set("response_mode", "query");
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");

      // コールバックサーバーを準備
      callbackServer.onCallback = authCallback;
      callbackServer.open();

      promises.auth.resolve = resolve;
      promises.auth.reject = reject;

      shell.openExternal(authUrl + "");
    });
  });
};

/**
 * アクセストークンの更新を行います。
 * @returns {Promise<{accessToken: string, scope: string}>} 新しいアクセストークンとスコープ
 */
const refresh = async () => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new Error("リフレッシュトークンが存在しません。");
    const res = await axios.post(endpoint.token, {
      client_id: ClientID,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    }, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    if (res.status !== 200) throw new Error("アクセストークンの更新に失敗しました。");
    const data = res.data;
    if (data.error) throw new Error("アクセストークンの更新に失敗しました。[" + data.error + "]");
    if (data.refresh_token) {
      caches.refreshToken = data.refresh_token;
      await safeStorageHandler.write(TokenPath, data.refresh_token);
    }
    caches.accessToken = data.access_token;
    caches.expiresAt = Date.now() + ACCESS_TOKEN_LIFETIME_MS;
    return { accessToken: data.access_token, scope: data.scope };
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null; // 次回呼び出し用にリセット
  }
};

/**
 * アクセストークンの無効化を行います。
 */
const revoke = async () => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return; // トークンがない場合は何もしない
  const res = await axios.post(endpoint.revocation, {
    client_id: ClientID,
    token: refreshToken
  }, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
  if (res.status !== 200) throw new Error("トークンの失効を実行できませんでした。\n" + res.data);
  caches.refreshToken = null;
  await safeStorageHandler.write(TokenPath, "");
};

module.exports = { authenticate, refresh, revoke, ensureAccessToken };
