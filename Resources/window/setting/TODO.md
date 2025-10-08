# Settings/Rich Text Editor TODO（現状整理に基づく）

最終更新: 2025-08-09
参照: `./.README.md`（Settings）、`../rich-text-editor/.README.md`

## 目的
- 旧設定の実装意図を保ちつつ、new版（index_new.html + style_new.css + settings-manager.js）の冗長・未実装箇所を整理し、Electron アプリの実装計画に沿った現実的な設定セットへ縮退。

## 優先度A（1〜2スプリントで完了目標）
1) 設定セクションの棚卸しと採否確定
   - 以下を「採用（実装）/保留（仕様未確定）/削除（今回やらない）」にマークする。
   - 一般、表示設定、ティッカー表示、通常画面、緊急地震速報、地震情報、津波情報、気象情報、取得間隔、DM-D.S.S、ソース優先順位、音声設定、読み上げ、通知、詳細設定、デバッグ、アプリについて
   - 成果物: settings-config-map.json（仮）に各項目の data-config キーと採否を記録。

2) data-config の正規化（命名とスキーマ）
   - 現行 `data-config="config.app.interval.*"` などを Information_Master / application_config に合致させる。
   - 使わないキーは UI から撤去。旧版で存在して新UIで欠落のキーを復活。
   - 成果物: config-structure.js の更新（型コメント付き）。

3) 保存/読込の実装確認と統一
   - settings-manager.js の保存処理を `ipcRenderer.invoke('file.save')` 経由のバックアップと、`config_reader` の保存線で一本化。
   - 読込時のデフォルト適用（マージ戦略）を定義（missing は default で補完、unknown は破棄）。

4) CSS の重複/未使用スタイルの削減
   - style_new.css を lint し、重複/未使用セレクタを削除、テーマ変数（CSS variables）へ寄せる。
   - 成果物: style_new.css の整頓版 + コメントに由来と用途を明記。

5) RTE（リッチテキストエディター）連携の最小経路
   - postMessage プロトコル（INIT_EDITOR / EDITOR_SAVE）を settings-manager.js 側で実装/確認。
   - 保存フォーマット（segments JSON）を決定し通常画面のテキストに適用する仮バインディングを追加。

## 優先度B（中期）
6) 設定→描画への反映ラインの整備
   - `data-config` → 設定JSON → IPC → Main（Information_Master）→ Renderer（Main）へ反映ユースケースを1系統（例: Mスケール間隔）で実線。

7) RTE の機能縮退/拡張の判断
   - 先行は「太字/斜体/下線/色」のみ。フォントサイズや画像は非対応のまま。
   - パフォーマンス検証（1万文字対応）の必要性を評価し、必要最小限の最適化のみ実施。

8) 旧設定のサルベージ
   - `index.html`（旧）から、new に欠落した実装済み設定を抽出し復元。
   - 例: 実運用で利用していた閾値/スイッチ類（具体名は Information_Master の実装に合わせる）。

9) アクセシビリティ/国際化
   - キーボードフォーカスリング、ARIA 属性の追加。
   - 言語切替（ja/en）に備えて innerText を翻訳キー化（後回し可）。

## 優先度C（後回し可）
10) デザイン磨き込み
   - Glassmorphism の強度/コントラスト調整。ダーク/ライト切替の導入。

11) テストと品質ゲート
   - E2E（Playwright）で設定保存→再起動→反映を1シナリオ追加。
   - stylelint/eslint の設定導入（軽めに）。

## 具体タスク一覧（チェックボックス）
- [ ] settings-config-map.json（仮）を作成し、全セクション/フィールドの採否を記載
- [ ] config-structure.js に現行スキーマをコメント付きで反映
- [ ] settings-manager.js の保存/読込/マージ方針を一本化
- [ ] style_new.css の重複/未使用スタイルを削除し、変数化
- [ ] RTE の INIT/ SAVE メッセージ処理と通常画面への適用デモ
- [ ] Mスケール取得間隔の設定を end-to-end 反映
- [ ] 旧 index.html からの設定項目のサルベージ（一覧化→復元）
- [ ] アクセシビリティ最低限（フォーカス・ARIA）
- [ ] 簡易テストスクリプト/手順を .README.md に追記

## 決定事項/メモ
- 実装予定のない項目は UI から排除。将来案は別ドキュメント（IDEA.md）へ退避。
- RTE のフォーマットは `segments[]` を採用し、HTMLは描画直前変換とする。
- 設定は単一JSONで管理し、セクションごとにネームスペース（app.*, config.* 等）。
