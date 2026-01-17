# NDV Ticker App（Electron）現状サマリ

最終更新: 2025-08-09

本ドキュメントは、/ndv-ticker-app の現在の構成と実装状況を俯瞰するためのステータスノートです。

## 概要
- 目的: Chrome拡張 NDV の独立アプリ化（Electron ベース）
- 起動エントリ: `main.js`（Electron Main）
- UI: `Resources/window/*`（Main/setting/traffic/info など複数ウィンドウ）
- 状態: 主要骨格あり（ウィンドウ管理、IPC、設定UI、HTTP/WSラッパ等）。描画/データ統合は途中。

## パッケージ構成
- `electron@36.x` を直接依存。`npm test` で `electron .` 起動。
- その他依存: axios, express, ws, uuid, glob, iconv-lite, encoding-japanese, ntp-time
- 開発: dependency-cruiser, license-checker

## エントリ（main.js）
- 例外/警告捕捉: `process.on('warning'|'uncaughtException'|'unhandledRejection')` → `Resources/scripts/error_handler`
- 設定/初期化:
  - `AppInitialConfig.get()` でアプリ基本情報読込
  - `configReader.read()` でユーザ設定読込（IPC から返却）
  - メニューバー、ローカルWS、NTP同期、情報取得間隔を初期化
  - アップデート確認: `Resources/window/scripts/UpdateChecker`
- IPC ハンドラ（抜粋）:
  - `requestAppInfo`（App情報返却）
  - `openInDefaultBrowser`（既定ブラウザ起動）
  - `ntpHandler.syncTime`（NTP同期）
  - `mscale.get`（WNI Mスケール取得）
  - `window.main.closeable`（閉じ可フラグ変更）
  - `system.getInfo` / `app.isDev` / `app.getVersion`
  - `debug.*`（DevTools・キャッシュクリア・テスト）
  - `file.save` / `file.load`（Downloads へ保存/読込）
- ウィンドウ生成: `WindowHandler.open('main'|'settings'|'information'|'traffic')`

## ウィンドウ/レンダラ
- `Resources/scripts/window_handler.js`
  - main: 1212x128, フレームなし, `main-preload.js`、DevTools開
  - settings: 1200x800, `setting/preload.js`, `setting/index_new.html`
  - info: `setting/index.html`
  - traffic: `traffic/index.html`
- Main 画面（ティッカー）
  - `Resources/window/Main/main-window.html`
  - Scripts: `Init-Canvas.js`, `Init-Assets.js`, `Init-userData.js`, `ipc-connection.js` 他
  - ライブラリ: jQuery, 可変アニメ、フォントローディング等
  - 1080x128 + 128x128 の構成は拡張と同等

## 設定ウィンドウ（index_new.html）
- サイドバーによるセクション分割（一般/表示/ティッカー/通常/EEW/地震/津波/気象/取得間隔/DM-D.S.S/ソース優先/音声/読み上げ/通知/詳細/デバッグ/アプリについて）
- レンジ/トグル/セレクトを `data-config="..."` 属性で設定スキーマにバインド
  - 例: `config.app.interval.iedred7584EEW`, `...nhkQuake`, `...jmaDevFeed`, `...tenkiJPtsunami`, `...wniMScale`, `...wniRiver`
- 保存ボタン（保存実装は `settings-manager.js` などで進行中と思われる）

## モジュール郡（Resources/Modules）
- `application_config`: アプリ基本情報（バージョン等）
- `config_reader`: 設定読込
- `menubar_handler`: メニュー構築
- `window_handler`: BrowserWindow 管理
- `http_request`: axios ラッパ（キャッシュ無効化/型定義付属）
- `websocket_handler` / `local_websocket_handler`: WS 抽象化/ローカルサーバ
- `ntp_handler`: NTP 同期
- `handle_interval_function`: 周期処理管理（推測）
- `error_handler`: エラー集約

## データ/クラス
- `Resources/Class/Information_Master.*` に地震・津波・気象などの統合管理クラス（拡張版のロジック移植先）
- `Resources/data/` に地図/定義データ（未確認だが main-window から参照）

## 進捗状況の評価（2025-08-09）
- ✅ Electron の骨格（Main/IPC/ウィンドウ/メニュー/設定/更新チェック/ファイルI/O）
- ✅ メイン画面 Canvas/Timer の基本構造とアセット初期化
- ✅ 設定UIの詳細なスケルトン（豊富なセクション/レンジ等）
- ✅ HTTP/WS/NTP/ローカルWS 等のインフラ層
- ⏳ データ統合と描画ロジックの本実装（NDV拡張 main.js の移植）
- ⏳ 読み上げ/サウンド再生の本線実装（Audio API/キュー制御）
- ⏳ 設定保存・読み込みと実際の動作バインディング
- ⏳ 監視間隔・ソース優先の切替反映
- ⏳ パッケージング/署名、Auto Update（将来）

## リスク/懸念
- 外部API多数のため CSP/ネットワーク設定をレンダラで整理必要
- 取得間隔/同時接続の負荷とレート制限対策
- 設定スキーマの互換（拡張の chrome.storage.sync → ファイル/DB）
- 音声資産（WAV/MP3）と再生エンジンの選定（WebAudio vs Node/Electron）

## 直近の実装候補（小さく進める）
1) 設定保存線の確立
   - settings-manager.js で `data-config` を JSON に射影し IPC で保存
   - main 側で `configReader` → `InformationMaster` の interval に反映
2) Mスケール/津波/地震のいずれか1系統の取得と描画を end-to-end で接続
   - `mscale.get` 既存IPCをレンダラから叩き、Canvas に簡易表示
3) 読み上げ最小実装
   - 既存の `Resources/window/Main/sound/` を利用し、単発再生のユーティリティを実装
4) エラーレポート UI を Settings: Debug に表示（`error_handler` 連携）

## 実行
- 開発起動
  ```bash
  npm test
  ```
  Electron が起動し、メインティッカーと設定画面が利用可能（現状はデモ/骨組み段階）。

---
この STATUS はリポジトリの `package.json`、`main.js`、`Resources/*` を確認して作成しました。詳細の深入り（各モジュールの関数単位の仕様）も必要なら追記します。
