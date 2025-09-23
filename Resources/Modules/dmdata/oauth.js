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

const caches = { state: null, redirectURI: null, verifier: null, refreshToken: null, accessToken: null };

const TokenPath = "dmdata_oauth2_refreshtoken";

const promises = {
  auth: { resolve: null, reject: null },
  // refresh: { resolve: null, reject: null },
  // revoke: { resolve: null, reject: null },
}

/***
 * 保存されたリフレッシュトークンを取得します。
 * @returns {Promise<string|null>} リフレッシュトークン、または null（存在しない場合）
 */
const getRefreshToken = async () => {
  if (caches.refreshToken) return caches.refreshToken;

  if (safeStorageHandler.exists(TokenPath)){
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

const getAccessToken = async () => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("リフレッシュトークンが存在しません。");

  return await refresh().then(res => res.accessToken);
}

/**
 * 認可コードのコールバック関数
 * @param {string} code 認可コード
 * @param {string} state state
 * @param {import("http").ServerResponse} res サーバー返答
 * @returns
 */
const authCallback = async (code, state, res) => {
  // console.log(code, state, res);

  if (caches.state !== state){
    res.status(400).send(`期待したstateと異なります。\nExpected: ${caches.state}\nGiven: ${state}`);
    promises.auth.reject(new Error(`State mismatched. \nExpected: ${caches.state}\nGiven: ${state}`));
    return;
  }

  // アクセストークンを要求
  const response = await axios.post(endpoint.token, {
    client_id: ClientID,
    grant_type: "authorization_code",
    code,
    redirect_uri: caches.redirectURI,
    code_verifier: caches.verifier
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => {
    if (res.status !== 200) promises.auth.reject(new Error("アクセストークンの要求に失敗しました。\n" + res.data));
    return JSON.parse(res.data);
  });

  if (response.error) promises.auth.reject(new Error("アクセストークンの要求に失敗しました。［" + response.error + "］\n" + response.error_description));

  // 「Electronがキーチェーン内の "ndv-ticker Safe Storage"に保存されている機密情報を使用しようとしています。」が出ることについて告知
  res.send("<p>ログインに成功しました。ウィンドウを閉じてください。</p><p><b>ログイン後に「キーチェーンに保存されている機密情報を使用します。」といったメッセージが表示されることがありますが、これはトークンの安全な管理に必要なものです。</b></p>");

  caches.refreshToken = response.refresh_token;
  safeStorageHandler.write(TokenPath, response.refresh_token);

  caches.accessToken = response.access_token;

  promises.auth.resolve({
    accessToken: response.access_token,
    scope: response.scope
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
      authUrl.searchParams.set("scope", "contract.list eew.get.forecast eew.get.warning parameter.earthquake parameter.tsunami socket.close socket.start telegram.data telegram.get.earthquake telegram.list");
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
 *
 * @returns
 */
const refresh = async () => {
  return await axios.post(endpoint.token, {
    client_id: ClientID,
    grant_type: "refresh_token",
    refresh_token: await getRefreshToken()
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => {
    if (res.status !== 200) throw new Error("アクセストークンの更新に失敗しました。\n" + res.data);
    const response = JSON.parse(res.data);
    if (response.error) throw new Error("アクセストークンの更新に失敗しました。［" + response.error + "］\n" + response.error_description);

    caches.refreshToken = response.refresh_token;

    return {
      accessToken: response.access_token,
      scope: response.scope
    };
  });
};

const revoke = async () => {
  return await axios.post(endpoint.revocation, {
    client_id: ClientID,
    token: await getRefreshToken()
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => {
    if (res.status !== 200) throw new Error("トークンの失効を実行できませんでした。\n" + res.data);
    caches.refreshToken = null;
    safeStorageHandler.write(TokenPath, "");
    return;
  });
};

module.exports = { authenticate, refresh, revoke, getAccessToken };
