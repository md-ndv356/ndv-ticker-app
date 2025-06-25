/**
 * TextManager - MinecraftのRaw JSONライクなテキスト管理システム
 * 重複するスタイル範囲を正しく処理し、文字単位でスタイルを管理
 */
class TextManager {
  constructor() {
    this.text = '';
    this.segments = []; // { start, end, styles } の配列
    this.changeListeners = [];
  }

  /**
   * テキストを初期化
   */
  initialize(text) {
    this.text = text;
    this.segments = [];
    this.notifyChange();
  }

  /**
   * プレーンテキストを取得
   */
  getText() {
    return this.text;
  }

  /**
   * セグメントを取得
   */
  getSegments() {
    return [...this.segments];
  }

  /**
   * テキストを設定
   */
  setText(text) {
    this.text = text;
    // 既存のセグメントを調整
    this.segments = this.segments.filter(segment =>
      segment.start < text.length
    ).map(segment => ({
      ...segment,
      end: Math.min(segment.end, text.length)
    }));
    this.notifyChange();
  }

  /**
   * 範囲にスタイルを適用
   */
  applyStyle(start, end, style, value) {
    if (start >= end || start >= this.text.length) {
      return;
    }

    end = Math.min(end, this.text.length);

    // 既存のセグメントを重複処理して分割
    const newSegments = [];

    for (const segment of this.segments) {
      if (segment.end <= start || segment.start >= end) {
        // 重複しない場合はそのまま保持
        newSegments.push(segment);
      } else {
        // 重複する場合は分割処理

        // 新しい範囲より前の部分
        if (segment.start < start) {
          newSegments.push({
            start: segment.start,
            end: start,
            styles: { ...segment.styles }
          });
        }

        // 重複部分 - 既存のスタイルに新しいスタイルを追加
        const overlapStart = Math.max(segment.start, start);
        const overlapEnd = Math.min(segment.end, end);
        if (overlapStart < overlapEnd) {
          newSegments.push({
            start: overlapStart,
            end: overlapEnd,
            styles: { ...segment.styles, [style]: value }
          });
        }

        // 新しい範囲より後の部分
        if (segment.end > end) {
          newSegments.push({
            start: end,
            end: segment.end,
            styles: { ...segment.styles }
          });
        }
      }
    }

    // 新しいスタイルのみの範囲を追加
    // 既存のセグメントでカバーされていない部分を見つける
    let currentPos = start;
    const sortedNewSegments = newSegments
      .filter(seg => seg.start < end && seg.end > start)
      .sort((a, b) => a.start - b.start);

    for (const segment of sortedNewSegments) {
      if (currentPos < segment.start) {
        // ギャップがある場合、新しいスタイルのみのセグメントを追加
        newSegments.push({
          start: currentPos,
          end: segment.start,
          styles: { [style]: value }
        });
      }
      currentPos = Math.max(currentPos, segment.end);
    }

    // 最後のギャップをチェック
    if (currentPos < end) {
      newSegments.push({
        start: currentPos,
        end: end,
        styles: { [style]: value }
      });
    }

    this.segments = newSegments;
    this.optimizeSegments();
    this.notifyChange();
  }

  /**
   * 範囲のスタイルを削除
   */
  removeStyle(start, end, style) {
    if (start >= end || start >= this.text.length) return;

    end = Math.min(end, this.text.length);

    // 該当範囲のセグメントからスタイルを削除
    this.segments = this.segments.map(segment => {
      if (segment.start < end && segment.end > start) {
        const newStyles = { ...segment.styles };
        delete newStyles[style];
        return { ...segment, styles: newStyles };
      }
      return segment;
    }).filter(segment => Object.keys(segment.styles).length > 0);

    this.notifyChange();
  }

  /**
   * 指定位置のスタイルを取得
   */
  getStyleAt(position) {
    const styles = {};
    for (const segment of this.segments) {
      if (position >= segment.start && position < segment.end) {
        Object.assign(styles, segment.styles);
      }
    }
    return styles;
  }

  /**
   * 範囲のスタイルを取得
   */
  getStylesInRange(start, end) {
    const rangeStyles = {};
    for (const segment of this.segments) {
      if (segment.start < end && segment.end > start) {
        Object.assign(rangeStyles, segment.styles);
      }
    }
    return rangeStyles;
  }

  /**
   * セグメントを最適化（隣接する同じスタイルのセグメントを統合）
   */
  optimizeSegments() {
    // スタイルが空のセグメントを削除
    this.segments = this.segments.filter(segment =>
      Object.keys(segment.styles).length > 0
    );

    // 開始位置でソート
    this.segments.sort((a, b) => a.start - b.start);

    // 隣接する同じスタイルのセグメントを統合
    const optimized = [];
    for (const segment of this.segments) {
      const last = optimized[optimized.length - 1];
      if (last &&
          last.end === segment.start &&
          this.stylesEqual(last.styles, segment.styles)) {
        last.end = segment.end;
      } else {
        optimized.push({ ...segment });
      }
    }

    this.segments = optimized;
  }

  /**
   * 2つのスタイルオブジェクトが等しいかチェック
   */
  stylesEqual(styles1, styles2) {
    const keys1 = Object.keys(styles1);
    const keys2 = Object.keys(styles2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (styles1[key] !== styles2[key]) return false;
    }

    return true;
  }

  /**
   * テキストを挿入
   */
  insertText(position, text) {
    if (position < 0 || position > this.text.length) return;

    // テキストを挿入
    this.text = this.text.slice(0, position) + text + this.text.slice(position);

    // セグメントの位置を調整
    for (const segment of this.segments) {
      if (segment.start >= position) {
        segment.start += text.length;
      }
      if (segment.end > position) {
        segment.end += text.length;
      }
    }

    this.notifyChange();
  }

  /**
   * テキストを削除
   */
  deleteText(start, end) {
    if (start < 0 || end > this.text.length || start >= end) return;

    const deleteLength = end - start;

    // テキストを削除
    this.text = this.text.slice(0, start) + this.text.slice(end);

    // セグメントを調整
    this.segments = this.segments.map(segment => {
      const newSegment = { ...segment };

      if (segment.end <= start) {
        // 削除範囲より前のセグメント - 変更なし
        return newSegment;
      } else if (segment.start >= end) {
        // 削除範囲より後のセグメント - 位置をシフト
        newSegment.start -= deleteLength;
        newSegment.end -= deleteLength;
        return newSegment;
      } else {
        // 削除範囲と重複するセグメント
        if (segment.start < start && segment.end > end) {
          // セグメントが削除範囲を包含 - 削除した分だけ短縮
          newSegment.end -= deleteLength;
          return newSegment;
        } else if (segment.start < start) {
          // セグメントの後半が削除 - 終了位置をstart位置に調整
          newSegment.end = start;
          return newSegment;
        } else if (segment.end > end) {
          // セグメントの前半が削除 - 開始位置を調整してシフト
          newSegment.start = start;
          newSegment.end -= deleteLength;
          return newSegment;
        } else {
          // セグメント全体が削除範囲内 - 削除
          return null;
        }
      }
    }).filter(segment => segment !== null && segment.start < segment.end);

    this.optimizeSegments();
    this.notifyChange();
  }

  /**
   * HTML要素を生成
   */
  toHTML() {
    if (!this.text) return '';

    // 文字位置ごとのスタイルマップを作成
    const charStyles = new Array(this.text.length).fill(null).map(() => ({}));

    for (const segment of this.segments) {
      for (let i = segment.start; i < segment.end && i < this.text.length; i++) {
        Object.assign(charStyles[i], segment.styles);
      }
    }

    // HTML文字列を構築
    let html = '';
    let currentStyles = {};
    let openTags = [];

    for (let i = 0; i < this.text.length; i++) {
      const styles = charStyles[i];

      // スタイルが変更された場合、タグを閉じて開く
      if (!this.stylesEqual(currentStyles, styles)) {
        // 既存のタグを閉じる
        while (openTags.length > 0) {
          html += openTags.pop();
        }

        // 新しいタグを開く
        currentStyles = { ...styles };
        const tags = this.stylesToTags(styles);
        for (const tag of tags) {
          html += tag.open;
          openTags.unshift(tag.close);
        }
      }

      // 文字を追加
      html += this.escapeHTML(this.text[i]);
    }

    // 残りのタグを閉じる
    while (openTags.length > 0) {
      html += openTags.pop();
    }

    return html;
  }

  /**
   * スタイルをHTMLタグに変換
   */
  stylesToTags(styles) {
    const tags = [];

    if (styles.bold) {
      tags.push({ open: '<strong>', close: '</strong>' });
    }

    if (styles.italic) {
      tags.push({ open: '<em>', close: '</em>' });
    }

    if (styles.underline) {
      tags.push({ open: '<u>', close: '</u>' });
    }

    if (styles.color) {
      tags.push({
        open: `<span style="color: ${styles.color}">`,
        close: '</span>'
      });
    }

    if (styles.fontSize) {
      tags.push({
        open: `<span style="font-size: ${styles.fontSize}px">`,
        close: '</span>'
      });
    }

    return tags;
  }

  /**
   * HTMLエスケープ
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Raw JSON形式でエクスポート
   */
  toRawJSON() {
    if (!this.text) return { text: '' };

    const result = [];
    const charStyles = new Array(this.text.length).fill(null).map(() => ({}));

    // 文字位置ごとのスタイルを計算
    for (const segment of this.segments) {
      for (let i = segment.start; i < segment.end && i < this.text.length; i++) {
        Object.assign(charStyles[i], segment.styles);
      }
    }

    // 連続する同じスタイルの文字をグループ化
    let currentText = '';
    let currentStyles = {};

    for (let i = 0; i < this.text.length; i++) {
      const styles = charStyles[i];

      if (!this.stylesEqual(currentStyles, styles)) {
        // 前のグループを保存
        if (currentText) {
          const item = { text: currentText };
          if (Object.keys(currentStyles).length > 0) {
            Object.assign(item, currentStyles);
          }
          result.push(item);
        }

        // 新しいグループを開始
        currentText = this.text[i];
        currentStyles = { ...styles };
      } else {
        currentText += this.text[i];
      }
    }

    // 最後のグループを保存
    if (currentText) {
      const item = { text: currentText };
      if (Object.keys(currentStyles).length > 0) {
        Object.assign(item, currentStyles);
      }
      result.push(item);
    }

    return result.length === 1 && Object.keys(result[0]).length === 1
      ? result[0]
      : result;
  }

  /**
   * Raw JSON形式からインポート
   */
  fromRawJSON(data) {
    this.text = '';
    this.segments = [];

    if (typeof data === 'string') {
      this.text = data;
    } else if (Array.isArray(data)) {
      let position = 0;
      for (const item of data) {
        const text = item.text || '';
        this.text += text;

        if (text.length > 0) {
          const styles = { ...item };
          delete styles.text;

          if (Object.keys(styles).length > 0) {
            this.segments.push({
              start: position,
              end: position + text.length,
              styles: styles
            });
          }
        }

        position += text.length;
      }
    } else if (data && typeof data === 'object' && data.text) {
      this.text = data.text;
      const styles = { ...data };
      delete styles.text;

      if (Object.keys(styles).length > 0) {
        this.segments.push({
          start: 0,
          end: this.text.length,
          styles: styles
        });
      }
    }

    this.optimizeSegments();
    this.notifyChange();
  }

  /**
   * 変更リスナーを追加
   */
  addChangeListener(listener) {
    this.changeListeners.push(listener);
  }

  /**
   * 変更リスナーを削除
   */
  removeChangeListener(listener) {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  /**
   * 変更を通知
   */
  notifyChange() {
    for (const listener of this.changeListeners) {
      listener(this);
    }
  }

  /**
   * デバッグ用：現在の状態を出力
   */
  debug() {
    console.log('TextManager Debug:');
    console.log('Text:', this.text);
    console.log('Segments:', this.segments);
    console.log('Raw JSON:', this.toRawJSON());
  }
}
