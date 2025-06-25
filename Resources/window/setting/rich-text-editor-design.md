# リッチテキストエディタ設計案

## データ構造

### 基本構造
```javascript
{
  id: Date.now(),
  title: "表示名",
  enabled: true,
  type: "rich" | "plain", // "plain"は従来の単純テキスト、"rich"はリッチテキスト

  // プレーンテキストの場合
  text: "単純なテキスト文字列",

  // リッチテキストの場合
  content: [
    {
      type: "text",
      text: "通常のテキスト",
      style: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "normal", // "normal" | "bold"
        fontStyle: "normal",  // "normal" | "italic"
        textDecoration: "none" // "none" | "underline"
      }
    },
    {
      type: "icon",
      iconType: "weather", // "weather" | "earthquake" | "warning" | "custom"
      iconName: "sunny",
      size: 16,
      color: "#ffdd00"
    },
    {
      type: "variable",
      variable: "weather/temperature/high",
      style: {
        color: "#ff6600",
        fontWeight: "bold"
      }
    },
    {
      type: "break" // 改行
    }
  ]
}
```

### 対応するアイコン
```javascript
const AVAILABLE_ICONS = {
  weather: {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    stormy: "⛈️"
  },
  earthquake: {
    seismic: "🌍",
    wave: "🌊",
    warning: "⚠️"
  },
  general: {
    info: "ℹ️",
    alert: "🚨",
    check: "✓",
    cross: "✗",
    arrow_right: "→",
    arrow_left: "←"
  }
};
```

## エディタUI設計

### ウィンドウ構成
- メインエディタエリア（WYSIWYG）
- ツールバー（スタイル・アイコン挿入）
- プレビューエリア
- 変数挿入パネル

### 必要な機能
1. テキストスタイル（太字、斜体、色、サイズ）
2. アイコン挿入
3. 変数挿入（既存のshortcut機能拡張）
4. リアルタイムプレビュー
5. プレーン/リッチ切り替え
