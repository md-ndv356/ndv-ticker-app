# AI コーディング規則

## 0. 基本方針

- お願いだから、会話は優しい心を持ってほしい...
- なるべく、最新の ECMAScript 標準に準拠すること。
-

## 1. コーディング規約

- **人が読むことを考慮すること。**
- **コメントは日本語で書くこと。**
- インデントはスペース2つ
- 文字列はダブルクォートを使用
- 変数名は、ループ用の変数を除き、変数の用途を明確にする。
- イベントハンドラの引数名はeではなく、eventとする。

- 1文1行にする（セミコロンで区切って1行に複数書かない）
- アロー関数は必ず `()=>{` ではなく `() => {` のように括弧と矢印の前後、およびブロック開始前に半角スペースを入れる。
- 制御構文 (if, for, while, switch, catch など) も `if(condition){` ではなく `if (condition) {` のようにキーワードと開き括弧の間、閉じ括弧とブロックの `{` の間にスペースを入れる。
- ECMAScript 2025 準拠
- 値のキャストにはNumber(), String()を使わず、 -0 と +"" を使う。
- 配列末尾の取得は .at(-1) を使用
- if (!x) return; の早期リターンスタイルを使う
- 関数はなるべくアロー関数を使用する。

- 適度にスペースを入れる。
- varは使わず、letまたはconstを使う。
- switch文はなるべく使わず、if文にする。
- if, for, while, switch などの制御構文は、ブロックを必ず使用する。
- if, for, while, switch は、「if (condition){ 複数行 }」で書く。スペースの行なども合わせる。
- if, for, while は、内容が1文であるときのみブロックを省略してもよい。

- コメントは特に複雑な処理に入れる。
- 関数には、別のAIが読んでも理解できるような、関数の目的と引数の説明をコメントで書く。
- .d.ts には、丁寧にコメントをつける。

- innerHTMLではなくcreateElementを使うのは、後で要素をJavaScriptで操作することを考慮した場合。
- なるべくinnerHTMLを使わず、insertAdjacentHTMLを使う。
- イベントハンドラはaddEventListenerで定義する

# 2. アーキテクチャガイドライン

- Main プロセスのコードについて、モジュール化は単体のライブラリを作成しているような意識で行う。
- `Resources/Modules` 以下のモジュールは、.jsと.d.tsをセットで作成する。
- APIとの通信は非同期で行い、Promiseまたはasync/awaitを使用する。
- コードの可読性を最優先する（命名規則、コメント、構造）。

## 3. エラー処理方針

- フェイルセーフを考慮し、エラーが発生した場合は適切なエラーメッセージを表示する。
- try-catch文は、コンソールへメッセージを出すだけなら、むしろtry-catch文を使わず、実行が止まってエラーウィンドウが出る方が良い。（フェイルセーフ）
- Main プロセス内のエラーは、`Resources/Modules/error_handler.js` を通じて管理する。
- Renderer プロセス内のエラーは、全画面表示でエラーを表示する必要があるときのみ、`Resources/Modules/error_handler.js` を通じて管理する。
- Renderer プロセス内のJavaScriptコードでは、なるべくtry-catch文を使わない。

## 4. コミュニケーション設定

- 日本語で会話する。やさしい日本語でお願いします！！！！！！！！！！！！！

## 5. ディレクトリ構造

ディレクトリ構造は以下の通り。ただし、これのみ編集内容に応じて適宜変更して良い。

```
Resources/
├── Class/ # データ構造が色々関係あるものをまとめてる（けど中身は雑においてるだけで何も意味がない）
├── data/ # jsonファイルいっぱい
├── Logs/ # ログファイル
├── Modules/ # Main プロセスにおけるモジュール
│   ├── dmdata/ # dmdata.jp 関連モジュール
│   │   ├──
│   │   └── oauth.js # OAuth 2.0 処理
│   ├── appdata_handler.js # アプリケーションデータフォルダ管理モジュール
│   ├── appdata_handler.d.ts
│   ├── application_config.js # アプリケーションに関するデータを提供するモジュール
│   ├── application_config.d.ts
│   ├── config_reader.js # 設定ファイルを管理
│   ├── config_reader.d.ts
│   ├── error_handler.js # アプリケーション内で発生したエラーの管理
│   ├── error_handler.d.ts
│   ├── handle_interval_function.js # 周期処理を管理するモジュール
│   ├── handle_interval_function.d.ts
│   ├── http_request.js # HTTPリクエストを管理するオブジェクト
│   ├── http_request.d.ts
│   ├── local_websocket_handler.js # 内部利用WebSocket管理
│   ├── local_websocket_handler.d.ts
│   ├── menubar_handler.js # メニューバー管理
│   ├── menubar_handler.d.ts
│   ├── ntp_handler.js # NTP管理
│   ├── ntp_handler.d.ts
│   ├── websocket_handler.js # WebSocket通信管理
│   ├── websocket_handler.d.ts
│   ├── window_handler.js # ウィンドウ管理
│   └── window_handler.d.ts
├── window/
│   ├── common/ # 共通のライブラリやフォント
│   ├── error-window/ # エラーメッセージを表示するウィンドウ
│   ├── info/ # 受信情報リスト ウィンドウ
│   ├── Main/ # メインウィンドウ
│   ├── Modules/ # なぜかここにあるモジュール
│   │   ├── UpdateChecker.js
│   │   └── UpdateChecker.d.ts
│   ├── rich-text-editor/ # リッチテキストエディター
│   ├── setting/ # 設定ウィンドウ
│   └── traffic/ # Traffic Monitor ウィンドウ
└── main.js # メインプロセスのエントリーポイント
```

# 5.1 dmdata.jp モジュール構成（提案）

dmdata.jp（DM-D.S.S）連携は Main プロセスに閉じて実装し、責務ごとに小さなモジュールへ分割する。
`.js` と `.d.ts` はペアで用意する（公開関数・型・戻り値の説明を .d.ts に明記）。

```
Resources/
└── Modules/
	└── dmdata/
		├── index.js                # 入口（初期化・依存の組み立て・外部公開）。IPC 登録もここで実施
		├── index.d.ts
		├── constants.js            # 固定値: エンドポイント、コンソールURL、デフォルトスコープ等
		├── constants.d.ts
		├── types.d.ts              # 共有型: OAuthConfig, Tokens, WsStatus, Contract, Connection など
		├── oauth.js                # Authorization Code + PKCE。認可URL生成・トークン交換・リフレッシュ・解除
		├── oauth.d.ts
		├── pkce.js                 # PKCE 補助（verifier/challenge/base64url）。汎用化するなら Modules/crypto.js でも可
		├── pkce.d.ts
		├── tokens_store.js         # トークンの安全保存（keytar 等）。取得/保存/削除、有効期限チェック
		├── tokens_store.d.ts
		├── api_client.js           # REST クライアント。Bearer 自動付与・401 一度だけリトライ（refresh）
		├── api_client.d.ts
		├── contracts.js            # 利用契約・プラン等の取得/整形
		├── contracts.d.ts
		├── websocket.js            # DM-D.S.S WebSocket 管理。接続・再接続・リスト/切断・現在の状態取得
		├── websocket.d.ts
		├── service.js              # 調停役。状態集約（未連携/連携/接続）、利用状況更新、unlink、WS制御を提供
		├── service.d.ts
		├── ipc.js                  # Renderer 向け IPC ハンドラ登録（authorize/unlink/getStatus/refresh/disconnectWs）
		└── ipc.d.ts
```

実装の指針
- Renderer へはトークンそのものを渡さない。状態や表示用データのみ IPC で返す。
- 認可は既定ブラウザ＋カスタム URL スキーム（例: `ndv://oauth/dmdata`）で戻る。
- トークン保存は `tokens_store`（keytar 等）に集約。`oauth` は保存方法を知らない。
- `service` が唯一の高水準 API（UI/他モジュールが使う窓口）。
- `index` は `service` を生成し、`ipc` を登録してエクスポートする（DI でテスト容易性を担保）。
- 例外は基本的に投げる。捕捉とユーザー通知は上位（`ipc`/`window_handler`）で行う（フェイルセーフ方針）。

メインプロセス起動時の組み込み例（擬似コード）
```
// Resources/main.js 等
const dmdata = require("./Modules/dmdata/index.js")
dmdata.register(app, ipcMain) // プロトコル登録・IPC ハンドラ登録など
```

Renderer 側の想定 IPC（例）
- `dmdata.authorize()` 認可フロー開始（外部ブラウザ起動）
- `dmdata.unlink()` 連携解除（トークン消去・必要なら revocation）
- `dmdata.getStatus()` 状態取得（未連携/連携/接続、契約数、WS情報、接続一覧）
- `dmdata.refreshUtilization()` 利用状況を取得・再計算
- `dmdata.disconnectWs({ id })` 指定接続の切断

注記
- OAuth クライアント情報はアプリ固定を推奨（公開クライアント＋PKCE）。`client_secret` は原則未使用。
- ライブラリは `oauth4webapi` 等の低レベル実装 or 標準 `fetch`/`crypto` と少量の自前実装で十分。
- 共通化できる PKCE/crypto は `Resources/Modules/crypto.js` へ移し、`dmdata/pkce.js` から委譲してもよい。

# 前提知識

## 参考（にしてほしい）文献

- [緊急地震速報（警報）及び（予報）について](https://www.jma.go.jp/jma/kishou/know/jishin/eew/shikumi/shousai.html)
- [地震情報について](https://www.jma.go.jp/jma/kishou/know/jishin/joho/seisinfo.html)
- [津波警報・注意報、津波情報、津波予報について](https://www.jma.go.jp/jma/kishou/know/jishin/joho/tsunamiinfo.html)
- [推計震度分布図について](https://www.jma.go.jp/jma/kishou/know/jishin/suikei/kaisetsu.html)
- [地震火山関連XML 電文解説資料](https://files.nakn.jp/earthquake/pdf/地震火山関連_解説資料.pdf)　（あくまで情報の種類・中身を理解するための資料であり、本番環境では別のソースを利用するため、XMLの仕様については触れないように。）

### 日本の地震・EEW・津波 情報の仕様・システム概要（実装向け）

公開資料に基づく高レベルな仕様サマリ。正式仕様は上記リンクを参照のこと。

■ 共通仕様
- 配信主体: 主に気象庁（JMA）。
- 時刻: JST の ISO 8601 文字列（例: 2025-08-19T12:34:56+09:00）。
- 位置: 緯度・経度（十進度）, 深さ km, 震央地名（表示用）。
- 震度: 「0,1,2,3,4,5弱,5強,6弱,6強,7」の列挙値（文字列で保持）。
- マグニチュード: 小数1桁程度（例: 6.8）。
- 識別: 地震イベントID（eventId）、速報/更新の通番（reportNumber）、系列ID（seriesId; EEW）。

■ 地震情報（定時電文の代表例）
- 代表種別: 震度速報／震源に関する情報／震源・震度に関する情報／各地の震度に関する情報／遠地地震。
- 代表フィールド
	- eventId, status（速報/確定/訂正 等）
	- originTime, maxIntensity, magnitude, hypocenter{lat, lon, depthKm, name}
	- areas[]（地域/観測点ごとの震度一覧）
- 推奨スキーマ（例）
	- EarthquakeInfo
		- eventId: string
		- originTimeJst: string
		- hypocenter: { lat: number, lon: number, depthKm: number|null, name: string }
		- magnitude: { type: "Mj"|"Mw"|"M?", value: number|null }
		- maxIntensity: "0"|"1"|"2"|"3"|"4"|"5弱"|"5強"|"6弱"|"6強"|"7"|null
		- areas: Array<{ code: string, name: string, intensity: string }>
		- status: "速報"|"確定"|"訂正"|"追加"|"取消"
		- reportNumber?: number

■ 緊急地震速報（EEW）
- 種別: 予報／警報（警報はおおむね予想最大震度5弱以上が基準）。
- 更新: 同一系列（seriesId）で reportNumber をインクリメント。終報は isFinal=true。
- 代表フィールド
	- seriesId, reportNumber, isFinal, isCorrection
	- originTime, hypocenter, magnitude
	- forecast: { maxIntensity, areas[]（地域ごとの予想震度/到達予想時刻） }
- 推奨スキーマ（例）
	- EEW
		- seriesId: string
		- reportNumber: number
		- isFinal: boolean
		- isCorrection: boolean
		- originTimeJst: string
		- hypocenter: { lat: number, lon: number, depthKm: number|null, name: string }
		- magnitude: { type: "Mj"|"Mw"|"M?", value: number|null }
		- forecast: {
				maxIntensity: "0"|"1"|"2"|"3"|"4"|"5弱"|"5強"|"6弱"|"6強"|"7"|null,
				areas: Array<{ code: string, name: string, intensity: string|null, etaJst: string|null }>
			}

■ 津波情報
- 区分: 大津波警報／津波警報／津波注意報／津波予報（若干の海面変動）。
- 単位: 予想高さは m（数値不明時は null かカテゴリ表示）。
- 沿岸名（海岸区分）ごとに発表。到達予想時刻・予想高さ・継続性等を含む。
- 推奨スキーマ（例）
	- TsunamiBulletin
		- bulletinType: "大津波警報"|"津波警報"|"津波注意報"|"若干の海面変動"|"解除"
		- issueTimeJst: string
		- areas: Array<{
				coastCode: string, coastName: string,
				category: "大津波"|"津波"|"注意報"|"若干",
				firstArrivalJst: string|null,
				expectedHeightM: number|null
			}>
		- isCancellation: boolean

■ 推計震度分布図
- 速報段階の推定分布。表示向けには画像/タイルURL等で扱うことを推奨。
- 推奨フィールド: { mapUrl?: string, legend?: string } 程度の参照情報。

■ 訂正・取消の扱い（共通）
- isCorrection: boolean（内容差し替え）
- isCancellation: boolean（当該電文の解除/取消）
- replaces?: string（置き換える eventId/reportNumber 等の参照）

（注）本節は公開資料を基にした実装向けの要約であり、原文の仕様詳細は都度参照してください。

### DM-D.S.S.（dmdata.jp） 接続・OAuth 設定（要点）

- 設定保持の推奨パス（例）
	- `config.datasource.dmdata.oauth.authorizationEndpoint`
	- `config.datasource.dmdata.oauth.tokenEndpoint`
	- `config.datasource.dmdata.oauth.clientId`
	- `config.datasource.dmdata.oauth.clientSecret`（保存は暗号化を検討）
	- `config.datasource.dmdata.oauth.redirectUri`（例: `ndv://oauth/dmdata`）
	- `config.datasource.dmdata.scopes`（string[]）＋ `scopesExtra`（string, space-separated）
	- `config.datasource.dmdata.usePkce`: boolean
	- `config.datasource.dmdata.openIn`: "external" | "inapp"
	- `config.datasource.dmdata.tokens`: { accessToken, refreshToken, expiresAt }（取得後）
- 認可フロー: Authorization Code + PKCE を推奨。リダイレクトはカスタムスキームで受ける。
- API 呼出は Bearer 認証（Authorization: Bearer <access_token>）。

