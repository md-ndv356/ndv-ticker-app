/**
 * Rich Text Editor for NDV Ticker Text
 */

class RichTextEditor {
  constructor() {
    this.currentData = null;
    this.isEditing = false;
    this.textManager = new TextManager();
    this.suppressUpdate = false; // 循環更新を防ぐフラグ
    this.suppressDOMSync = false; // DOM同期を防ぐフラグ
    this.savedSelection = null; // 選択範囲保存用
    this.syncTimeout = null; // DOM同期タイムアウトID
  this.parentIndex = null; // 親リスト内のインデックス

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupTextManager();
    this.updatePreview();
    this.setupInitialState();
  }

  setupInitialState() {
    // リッチテキストエディタにフォーカス
    const richTextArea = document.getElementById('rich-text-area');
    if (richTextArea) {
      richTextArea.focus();

      // 既存のスタイル付きコンテンツがあればTextManagerに同期
      setTimeout(() => {
        const textContent = richTextArea.textContent || '';
        if (textContent && textContent !== 'ここにメッセージを入力してください...') {
          console.log('初期状態でスタイル付きコンテンツを検出、同期中...');
          this.syncDOMToTextManagerCompletely();
        }
      }, 100);
    }
  }

  setupEventListeners() {
    // ツールバーボタン
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');

    if (boldBtn) {
      boldBtn.addEventListener('click', () => {
        this.toggleStyle('bold');
        this.updateButtonStates();
      });
    }

    if (italicBtn) {
      italicBtn.addEventListener('click', () => {
        this.toggleStyle('italic');
        this.updateButtonStates();
      });
    }

    if (underlineBtn) {
      underlineBtn.addEventListener('click', () => {
        this.toggleStyle('underline');
        this.updateButtonStates();
      });
    }

    // 色
    const textColor = document.getElementById('text-color');

    if (textColor) {
      textColor.addEventListener('input', (e) => {
        this.applyTextColor(e.target.value);
      });
    }

    // アイコンと変数挿入
    const iconBtn = document.getElementById('icon-btn');
    const variableBtn = document.getElementById('variable-btn');

    if (iconBtn) {
      iconBtn.addEventListener('click', () => {
        this.showInsertPanel('icons');
      });
    }

    if (variableBtn) {
      variableBtn.addEventListener('click', () => {
        this.showInsertPanel('variables');
      });
    }

    // テキスト編集
    const richTextArea = document.getElementById('rich-text-area');
    if (richTextArea) {
      richTextArea.addEventListener('input', (e) => {
        console.log('Input event triggered, suppressUpdate:', this.suppressUpdate, 'suppressDOMSync:', this.suppressDOMSync);
        if (!this.suppressUpdate && !this.suppressDOMSync) {
          console.log('Syncing DOM to TextManager...');
          // DOM変更をTextManagerに同期（スタイル保持）
          this.syncDOMToTextManagerSmart();
        }
        this.updatePreview();
      });

      // ペースト処理
      richTextArea.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const selection = this.getSelectionRange();
        if (selection) {
          this.textManager.deleteText(selection.start, selection.end);
          this.textManager.insertText(selection.start, text);
        }
      });

      // 選択変更時にボタンの状態を更新
      richTextArea.addEventListener('selectionchange', () => {
        this.updateButtonStates();
        this.saveCurrentSelection();
      });

      richTextArea.addEventListener('mouseup', () => {
        this.updateButtonStates();
        this.saveCurrentSelection();
      });

      richTextArea.addEventListener('keyup', () => {
        this.updateButtonStates();
        this.saveCurrentSelection();
      });

      // キーボードショートカットの検出
      richTextArea.addEventListener('keydown', (e) => {
        this.handleKeyboardShortcuts(e);
      });
    }

    // タブ切り替え
    const insertTabs = document.querySelectorAll('.insert-tab');
    insertTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.showInsertPanel(e.target.dataset.tab);
      });
    });

    // 変数挿入
    const variableItems = document.querySelectorAll('.variable-item');
    variableItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const variable = e.currentTarget.dataset.variable;
        this.insertVariable(variable);
      });
    });

    // アイコン挿入
    const iconItems = document.querySelectorAll('.icon-item');
    iconItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const icon = e.currentTarget.dataset.icon;
        this.insertIcon(icon);
      });
    });

    // 保存・キャンセル
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.save();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.cancel();
      });
    }
  }

  /**
   * 現在の選択範囲を保存
   */
  saveCurrentSelection() {
    const selection = this.getSelectionRange();
    if (selection && selection.start !== selection.end) {
      this.savedSelection = selection;
      console.log('Selection saved:', selection);
    }
  }

  /**
   * キーボードショートカットを処理
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + キーの組み合わせをチェック
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    if (!ctrlKey) return;

    let styleCommand = null;
    switch (e.key.toLowerCase()) {
      case 'b':
        styleCommand = 'bold';
        break;
      case 'i':
        styleCommand = 'italic';
        break;
      case 'u':
        styleCommand = 'underline';
        break;
      default:
        return; // 対象外のキー
    }

    if (styleCommand) {
      console.log('キーボードショートカット検出:', styleCommand);

      // ネイティブのexecCommandを実行させてから同期
      setTimeout(() => {
        console.log('キーボードショートカット後の同期開始');
        this.syncDOMToTextManagerCompletely();
        this.updateButtonStates();
      }, 50); // 短い遅延でexecCommandの実行後に同期
    }
  }

  updateButtonStates() {
    // カーソル位置ベースの更新に統合
    this.updateButtonStatesFromCursor();
  }

  toggleStyle(command) {
    const selection = this.getSelectionRange();
    if (!selection || selection.start === selection.end) {
      console.log('テキストが選択されていません');
      return;
    }

    // 選択範囲を保存
    this.savedSelection = selection;

    // 現在の選択範囲のスタイルを確認
    const currentStyles = this.textManager.getStylesInRange(selection.start, selection.end);
    const isApplied = currentStyles[command];

    this.suppressUpdate = true;
    if (isApplied) {
      // スタイルが適用されている場合は削除
      this.textManager.removeStyle(selection.start, selection.end, command);
    } else {
      // スタイルが適用されていない場合は追加
      this.textManager.applyStyle(selection.start, selection.end, command, true);
    }
    this.suppressUpdate = false;

    // 選択範囲を保持しながら更新
    this.updateEditorFromTextManagerWithSelection();
  }

  /**
   * 選択範囲を取得（TextManager用の文字位置）
   */
  getSelectionRange() {
    const richTextArea = document.getElementById('rich-text-area');
    if (!richTextArea) return null;

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);

    try {
      const start = this.getTextPosition(range.startContainer, range.startOffset);
      const end = this.getTextPosition(range.endContainer, range.endOffset);

      return { start, end };
    } catch (error) {
      console.error('選択範囲の取得エラー:', error);
      return null;
    }
  }

  /**
   * DOM位置をテキスト位置に変換
   */
  getTextPosition(node, offset) {
    const richTextArea = document.getElementById('rich-text-area');
    let position = 0;

    const walker = document.createTreeWalker(
      richTextArea,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return position + offset;
      }
      position += currentNode.textContent.length;
    }

    return position;
  }

  showInsertPanel(tab) {
    const insertPanel = document.getElementById('insert-panel');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.insert-tab');

    // パネルを表示
    if (insertPanel) {
      insertPanel.classList.add('active');
    }

    // タブコンテンツを切り替え
    tabContents.forEach(content => {
      content.classList.remove('active');
    });

    tabButtons.forEach(button => {
      button.classList.remove('active');
    });

    const activeContent = document.getElementById(tab + '-content');
    const activeButton = document.querySelector(`[data-tab="${tab}"]`);

    if (activeContent) {
      activeContent.classList.add('active');
    }
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  insertVariable(variable) {
    const richTextArea = document.getElementById('rich-text-area');
    if (!richTextArea) return;

    // フォーカスを確保
    richTextArea.focus();

    // 変数を挿入
    const variableElement = document.createElement('span');
    variableElement.className = 'variable-tag';
    variableElement.textContent = `{${variable}}`;
    variableElement.setAttribute('data-variable', variable);
    variableElement.contentEditable = false;

    this.insertElementAtCursor(variableElement);
    this.updatePreview();
  }

  insertIcon(icon) {
    const richTextArea = document.getElementById('rich-text-area');
    if (!richTextArea) return;

    // フォーカスを確保
    richTextArea.focus();

    // アイコンを挿入
    const iconElement = document.createElement('span');
    iconElement.className = 'icon-tag';
    iconElement.textContent = icon;
    iconElement.setAttribute('data-icon', icon);
    iconElement.contentEditable = false;

    this.insertElementAtCursor(iconElement);
    this.updatePreview();
  }

  insertElementAtCursor(element) {
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(element);

      // カーソルを挿入した要素の後に移動
      range.setStartAfter(element);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  updatePreview() {
    const richTextArea = document.getElementById('rich-text-area');
    const previewContent = document.getElementById('preview-content');

    if (richTextArea && previewContent) {
      // リッチテキストエリアの内容をプレビューに反映
      previewContent.innerHTML = richTextArea.innerHTML || 'メッセージを入力してください...';
    }
  }

  serializeRichContent() {
    const richArea = document.getElementById('rich-text-area');
    const content = [];

    console.log('serializeRichContent開始 - DOM構造:', richArea.innerHTML);

    const processNode = (node, inheritedStyles = {}) => {
      console.log('ノード処理中:', node.nodeType, node.nodeName, node.textContent);

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text && text.trim()) {
          const textItem = {
            type: 'text',
            content: text,
            styles: { ...inheritedStyles }
          };
          console.log('テキストノード追加:', textItem);
          content.push(textItem);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('variable-tag')) {
          content.push({
            type: 'variable',
            name: node.getAttribute('data-variable') || node.textContent.replace(/[{}]/g, ''),
            styles: {}
          });
          return; // 子ノードは処理しない
        } else if (node.classList.contains('icon-tag')) {
          content.push({
            type: 'icon',
            svg: node.textContent,
            styles: {}
          });
          return; // 子ノードは処理しない
        } else {
          // スタイル要素を処理
          const currentStyles = { ...inheritedStyles };

          // HTML要素タイプに基づくスタイル適用
          switch (node.tagName) {
            case 'B':
            case 'STRONG':
              currentStyles.fontWeight = 'bold';
              break;
            case 'I':
            case 'EM':
              currentStyles.fontStyle = 'italic';
              break;
            case 'U':
              currentStyles.textDecoration = 'underline';
              break;
            case 'SPAN':
            case 'DIV':
              // インラインスタイルからの抽出
              const inlineStyles = this.extractInlineStyles(node);
              Object.assign(currentStyles, inlineStyles);
              break;
          }

          console.log('要素処理:', node.tagName, 'スタイル:', currentStyles);

          // 子ノードを処理
          for (let child of node.childNodes) {
            processNode(child, currentStyles);
          }
        }
      }
    };

    for (let node of richArea.childNodes) {
      processNode(node);
    }

    console.log('最終的なcontent:', content);
    return content;
  }

  extractInlineStyles(element) {
    const styles = {};

    // style属性から直接スタイルを抽出
    if (element.style) {
      if (element.style.fontWeight === 'bold' || element.style.fontWeight >= 600) {
        styles.fontWeight = 'bold';
      }
      if (element.style.fontStyle === 'italic') {
        styles.fontStyle = 'italic';
      }
      if (element.style.textDecoration && element.style.textDecoration.includes('underline')) {
        styles.textDecoration = 'underline';
      }
      if (element.style.color) {
        styles.color = element.style.color;
      }
      if (element.style.fontSize) {
        styles.fontSize = element.style.fontSize;
      }
    }

    return styles;
  }

  extractStyles(element) {
    const styles = {};
    const computedStyle = window.getComputedStyle(element);

    // より確実なスタイル検出
    const fontWeight = computedStyle.fontWeight;
    if (fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 600) {
      styles.fontWeight = 'bold';
    }

    if (computedStyle.fontStyle === 'italic') {
      styles.fontStyle = 'italic';
    }

    const textDecoration = computedStyle.textDecoration || computedStyle.textDecorationLine;
    if (textDecoration && textDecoration.includes('underline')) {
      styles.textDecoration = 'underline';
    }

    const color = computedStyle.color;
    // デフォルト色（白や灰色）以外の場合
    if (color && color !== 'rgb(255, 255, 255)') {
      styles.color = color;
    }

    const fontSize = computedStyle.fontSize;
    if (fontSize && fontSize !== '16px') {
      styles.fontSize = fontSize;
    }

    return styles;
  }

  save() {
    const richContent = this.serializeRichContent();

    if (!richContent || richContent.length === 0) {
      alert('メッセージを入力してください。');
      return;
    }

    // デバッグ用ログ
    console.log('保存するリッチコンテンツ:', richContent);
    console.log('エディタのHTML:', document.getElementById('rich-text-area').innerHTML);

    const data = {
      content: richContent,
      styles: {}
    };

    // IPC 経由で親へ送信
    try {
      if (window.ContentBridge?.sendToParent) {
        window.ContentBridge.sendToParent({ type: "EDITOR_SAVE", index: this.parentIndex, data });
      } else if (window.opener) {
        // フォールバック: postMessage
        window.opener.postMessage({ type: "EDITOR_SAVE", index: this.parentIndex, data }, "*");
      }
      window.close();
    } catch (error) {
      console.error("保存送信失敗", error);
    }
  }

  cancel() {
    if (confirm('編集内容を破棄してもよろしいですか？')) {
      window.close();
    }
  }

  loadData(data) {
    if (data && data.content) {
      this.loadRichContent(data.content);
    }
    this.updatePreview();
  }

  loadRichContent(content) {
    const richArea = document.getElementById('rich-text-area');
    if (!richArea) return;

    richArea.innerHTML = '';

    content.forEach(item => {
      let element;

      if (item.type === 'text') {
        element = document.createElement('span');
        element.textContent = item.content || item.text || '';
        this.applyStylesToElement(element, item.styles || item.style || {});
      } else if (item.type === 'variable') {
        element = document.createElement('span');
        element.className = 'variable-tag';
        const variableName = item.name || item.variable || '';
        element.textContent = `{${variableName}}`;
        element.setAttribute('data-variable', variableName);
        element.contentEditable = false;
      } else if (item.type === 'icon') {
        element = document.createElement('span');
        element.className = 'icon-tag';
        element.textContent = item.svg || item.text || '🔷';
        element.setAttribute('data-icon', item.iconType || 'default');
        element.contentEditable = false;
      }

      if (element) {
        richArea.appendChild(element);
      }
    });
  }

  applyStylesToElement(element, styles) {
    if (styles.fontWeight === 'bold') {
      element.style.fontWeight = 'bold';
    }
    if (styles.fontStyle === 'italic') {
      element.style.fontStyle = 'italic';
    }
    if (styles.textDecoration === 'underline') {
      element.style.textDecoration = 'underline';
    }
    if (styles.color) {
      element.style.color = styles.color;
    }
    if (styles.fontSize) {
      element.style.fontSize = styles.fontSize;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 要素を再帰的に最適化
   */
  optimizeElement(element) {
    const childNodes = Array.from(element.childNodes);

    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];

      if (child.nodeType === Node.ELEMENT_NODE) {
        // 子要素を再帰的に最適化
        this.optimizeElement(child);

        // spanタグの場合、隣接する同じスタイルのspanタグをマージ
        if (child.tagName === 'SPAN') {
          this.mergeAdjacentSpans(child);
        }

        // 空のspanタグを削除
        if (child.tagName === 'SPAN' && this.isEmptySpan(child)) {
          child.remove();
          i--; // インデックスを調整
        }
      }
    }

    // テキストノードを統合
    this.mergeAdjacentTextNodes(element);
  }

  /**
   * 隣接する同じスタイルのspanタグをマージ
   */
  mergeAdjacentSpans(span) {
    let nextSibling = span.nextSibling;

    while (nextSibling) {
      if (nextSibling.nodeType === Node.ELEMENT_NODE &&
          nextSibling.tagName === 'SPAN' &&
          this.hasSameStyles(span, nextSibling)) {

        // 次のspanの内容を現在のspanに移動
        while (nextSibling.firstChild) {
          span.appendChild(nextSibling.firstChild);
        }

        const toRemove = nextSibling;
        nextSibling = nextSibling.nextSibling;
        toRemove.remove();
      } else {
        break;
      }
    }
  }

  /**
   * 隣接するテキストノードをマージ
   */
  mergeAdjacentTextNodes(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    for (let i = 0; i < textNodes.length - 1; i++) {
      const current = textNodes[i];
      const next = textNodes[i + 1];

      if (current.nextSibling === next && current.parentNode === next.parentNode) {
        current.textContent += next.textContent;
        next.remove();
        textNodes.splice(i + 1, 1);
        i--; // インデックスを調整
      }
    }
  }

  /**
   * 2つのspanタグが同じスタイルを持っているかチェック
   */
  hasSameStyles(span1, span2) {
    const style1 = span1.style;
    const style2 = span2.style;

    // 比較するスタイルプロパティ
    const properties = ['color', 'fontSize', 'fontWeight', 'fontStyle', 'textDecoration'];

    for (const prop of properties) {
      if (style1[prop] !== style2[prop]) {
        return false;
      }
    }

    return true;
  }

  /**
   * spanタグが空（または無意味）かどうかチェック
   */
  isEmptySpan(span) {
    // テキストコンテンツがない
    if (!span.textContent.trim()) {
      return true;
    }

    // スタイルが何も適用されていない
    const style = span.style;
    const hasStyle = style.color || style.fontSize || style.fontWeight ||
                    style.fontStyle || style.textDecoration;

    if (!hasStyle && !span.className) {
      return true;
    }

    return false;
  }

  /**
   * DOM最適化完了メッセージを表示
   */
  showOptimizationMessage() {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.optimization-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // メッセージ要素を作成
    const messageDiv = document.createElement('div');
    messageDiv.className = 'optimization-message';
    messageDiv.textContent = '✅ DOM構造を最適化しました';

    // ツールバーの下に挿入
    const toolbar = document.querySelector('.decoration-toolbar');
    if (toolbar) {
      toolbar.parentNode.insertBefore(messageDiv, toolbar.nextSibling);

      // 2秒後にメッセージを削除
      setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 2000);
    }
  }

  /**
   * 重複スタイルのテストを実行
   * テストケース: "4567に赤、890に青、6789に緑"
   */
  runOverlapTest() {
    // テストテキストを設定
    const testText = "0123456789";
    this.textManager.initialize(testText);

    console.log('=== 重複スタイルテスト開始 ===');
    console.log('初期テキスト:', testText);

    // スタイルを順番に適用
    console.log('1. 4567に赤色を適用...');
    this.textManager.applyStyle(4, 8, 'color', '#ff0000');
    console.log('セグメント:', JSON.stringify(this.textManager.getSegments()));

    console.log('2. 890に青色を適用...');
    this.textManager.applyStyle(8, 11, 'color', '#0000ff');
    console.log('セグメント:', JSON.stringify(this.textManager.getSegments()));

    console.log('3. 6789に緑色を適用...');
    this.textManager.applyStyle(6, 10, 'color', '#00ff00');
    console.log('最終セグメント:', JSON.stringify(this.textManager.getSegments()));

    // 期待される結果
    const expected = [
      { start: 4, end: 6, styles: { color: '#ff0000' } },
      { start: 6, end: 8, styles: { color: '#00ff000' } },
      { start: 8, end: 10, styles: { color: '#00ff000' } },
      { start: 10, end: 11, styles: { color: '#0000ff' } }
    ];

    console.log('期待される結果:', JSON.stringify(expected));

    // エディタを更新
    this.updateEditorFromTextManager();

    // テスト結果をコンソールに出力
    console.log('=== 重複スタイルテスト結果 ===');
    console.log('テキスト:', this.textManager.getText());
    console.log('実際のセグメント:', JSON.stringify(this.textManager.getSegments()));
    console.log('Raw JSON:', this.textManager.toRawJSON());

    // 各文字のスタイルを確認
    console.log('=== 文字ごとのスタイル ===');
    for (let i = 0; i < testText.length; i++) {
      const styles = this.textManager.getStyleAt(i);
      const hasColor = styles.color ? `色: ${styles.color}` : 'スタイルなし';
      console.log(`位置${i} "${testText[i]}": ${hasColor}`);
    }

    // 期待される結果と比較
    const actual = this.textManager.getSegments();
    const isCorrect = this.compareSegments(actual, expected);

    if (isCorrect) {
      this.showTestMessage('✅ 重複スタイルテスト成功！期待される結果と一致しました。');
    } else {
      this.showTestMessage('❌ 重複スタイルテスト失敗。期待される結果と異なります。コンソールを確認してください。');
    }
  }

  /**
   * セグメントを比較（テスト用）
   */
  compareSegments(actual, expected) {
    if (actual.length !== expected.length) {
      console.log(`セグメント数が異なります: 実際=${actual.length}, 期待=${expected.length}`);
      return false;
    }

    for (let i = 0; i < actual.length; i++) {
      const a = actual[i];
      const e = expected[i];

      if (a.start !== e.start || a.end !== e.end) {
        console.log(`セグメント${i}の範囲が異なります:`,
          `実際=[${a.start}, ${a.end}], 期待=[${e.start}, ${e.end}]`);
        return false;
      }

      if (JSON.stringify(a.styles) !== JSON.stringify(e.styles)) {
        console.log(`セグメント${i}のスタイルが異なります:`,
          `実際=${JSON.stringify(a.styles)}, 期待=${JSON.stringify(e.styles)}`);
        return false;
      }
    }

    return true;
  }

  /**
   * テストメッセージを表示
   */
  showTestMessage(message) {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.test-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // メッセージ要素を作成
    const messageDiv = document.createElement('div');
    messageDiv.className = 'test-message optimization-message'; // 同じスタイルを使用
    messageDiv.textContent = message;

    // ツールバーの下に挿入
    const toolbar = document.querySelector('.decoration-toolbar');
    if (toolbar) {
      toolbar.parentNode.insertBefore(messageDiv, toolbar.nextSibling);

      // 3秒後にメッセージを削除
      setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 3000);
    }
  }

  setupTextManager() {
    console.log('Setting up TextManager...');

    // TextManagerの変更リスナーを設定
    this.textManager.addChangeListener(() => {
      console.log('TextManager changed:', this.textManager.segments, 'suppressUpdate:', this.suppressUpdate);
      if (!this.suppressUpdate) {
        console.log('Updating editor from TextManager...');
        this.updateEditorFromTextManager();
      }
    });

    // 初期テキストを設定
    this.textManager.initialize('ここにメッセージを入力してください...');
    console.log('TextManager initialized with text:', this.textManager.getText());
  }

  updateEditorFromTextManager() {
    const richTextArea = document.getElementById('rich-text-area');
    if (richTextArea && !this.suppressUpdate) {
      console.log('updateEditorFromTextManager called');

      this.suppressUpdate = true;

      try {
        const html = this.textManager.toHTML();
        console.log('Generated HTML from TextManager:', html);
        richTextArea.innerHTML = html;
        this.updatePreview();
      } catch (error) {
        console.error('Error in updateEditorFromTextManager:', error);
      } finally {
        this.suppressUpdate = false;
      }
    }
  }

  /**
   * 選択範囲を保持しながらエディタを更新
   */
  updateEditorFromTextManagerWithSelection() {
    const richTextArea = document.getElementById('rich-text-area');
    if (richTextArea && !this.suppressUpdate) {
      console.log('updateEditorFromTextManagerWithSelection called');

      this.suppressUpdate = true;

      try {
        const html = this.textManager.toHTML();
        console.log('Generated HTML for selection update:', html);

        // HTMLを更新
        richTextArea.innerHTML = html;
        this.updatePreview();

        // 選択範囲を復元（非同期で）
        if (this.savedSelection) {
          setTimeout(() => {
            this.restoreSelection(this.savedSelection);
            // ボタンの状態も更新
            this.updateButtonStatesFromCursor();
          }, 10);
        }
      } catch (error) {
        console.error('Error in updateEditorFromTextManagerWithSelection:', error);
      } finally {
        // フラグをリセット
        this.suppressUpdate = false;
      }
    }
  }

  /**
   * 文字位置ベースの選択範囲をDOM選択範囲に復元
   */
  restoreSelection(selection) {
    const richTextArea = document.getElementById('rich-text-area');
    if (!richTextArea || !selection) return;

    try {
      const startPos = this.getTextPositionInDOM(richTextArea, selection.start);
      const endPos = this.getTextPositionInDOM(richTextArea, selection.end);

      if (startPos && endPos) {
        const range = document.createRange();
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);

        const domSelection = window.getSelection();
        domSelection.removeAllRanges();
        domSelection.addRange(range);

        console.log('Selection restored:', selection);
      }
    } catch (error) {
      console.warn('Failed to restore selection:', error);
    }
  }

  /**
   * 文字位置をDOM位置に変換
   */
  getTextPositionInDOM(container, textPosition) {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentPosition = 0;
    let node;

    while (node = walker.nextNode()) {
      const nodeLength = node.textContent.length;

      if (currentPosition + nodeLength >= textPosition) {
        return {
          node: node,
          offset: textPosition - currentPosition
        };
      }

      currentPosition += nodeLength;
    }

    // 見つからない場合は最後のノードの末尾を返す
    if (node) {
      return {
        node: node,
        offset: node.textContent.length
      };
    }

    return null;
  }

  /**
   * DOMの変更をTextManagerに同期
   */
  syncDOMToTextManager() {
    const richTextArea = document.getElementById('rich-text-area');
    if (!richTextArea || this.suppressUpdate) return;

    const newText = richTextArea.textContent || '';
    const currentText = this.textManager.getText();

    console.log('syncDOMToTextManager:', { newText, currentText, equal: newText === currentText });

    if (newText !== currentText) {
      console.log('Text changed, syncing styles from DOM...');
      this.suppressUpdate = true;
      try {
        // DOMからスタイル情報を抽出してTextManagerを更新
        this.syncStylesFromDOM();
      } finally {
        this.suppressUpdate = false;
      }
    }
  }  /**
   * DOMとTextManagerのスマート同期（スタイル保持）
   */
  syncDOMToTextManagerSmart() {
    const richTextArea = document.getElementById('rich-text-area');
    if (!richTextArea || this.suppressUpdate || this.suppressDOMSync) {
      console.log('syncDOMToTextManagerSmart スキップ:', {
        suppressUpdate: this.suppressUpdate,
        suppressDOMSync: this.suppressDOMSync
      });
      return;
    }

    const newText = richTextArea.textContent || '';
    const currentText = this.textManager.getText();

    console.log('syncDOMToTextManagerSmart:', { newText, currentText });

    // テキストが変更されていない場合はスキップ
    if (newText === currentText) {
      console.log('テキストに変更なし、同期スキップ');
      return;
    }

    // 初期メッセージから変更された場合のみ処理
    if (currentText === 'ここにメッセージを入力してください...' && newText.trim() === '') {
      console.log('初期メッセージの削除を検出、スキップ');
      return;
    }

    // テキストの差分を検出してTextManagerに反映
    this.applyTextDifference(currentText, newText);
  }

  /**
   * テキストの差分を検出してTextManagerに適用
   */
  applyTextDifference(oldText, newText) {
    this.suppressUpdate = true;
    this.suppressDOMSync = true; // DOM同期も無効化

    try {
      console.log('applyTextDifference:', { oldText, newText });

      // 初期状態や空文字の場合は慎重に処理
      if (oldText === 'ここにメッセージを入力してください...' && newText.trim() !== '') {
        console.log('初期メッセージからの入力開始');
        this.textManager.initialize(newText);
        return;
      }

      // 簡単なアプローチ：現在の選択位置を基準に変更を検出
      const selection = this.getSelectionRange();
      if (selection && selection.start === selection.end) {
        const cursorPos = selection.start;

        if (newText.length > oldText.length) {
          // テキストが追加された
          const insertedLength = newText.length - oldText.length;
          const insertionPos = Math.max(0, cursorPos - insertedLength);
          const insertedText = newText.slice(insertionPos, insertionPos + insertedLength);
          console.log('テキスト挿入:', insertedText, 'at position:', insertionPos);
          this.textManager.insertText(insertionPos, insertedText);
        } else if (newText.length < oldText.length) {
          // テキストが削除された
          const deletedLength = oldText.length - newText.length;
          const deletionPos = cursorPos;
          console.log('テキスト削除:', deletedLength, 'chars at position:', deletionPos);
          this.textManager.deleteText(deletionPos, deletionPos + deletedLength);
        }
      } else {
        // 選択範囲が不明または複雑な場合は初期化（最後の手段）
        console.log('複雑な変更を検出、初期化...');
        this.textManager.initialize(newText);
      }
    } catch (error) {
      console.error('applyTextDifference error:', error);
      // エラーが発生した場合は初期化
      this.textManager.initialize(newText);
    } finally {
      this.suppressUpdate = false;
      this.suppressDOMSync = false;
    }
  }

  /**
   * DOM全体をTextManagerに完全同期（スタイル情報も含む）
   */
  syncDOMToTextManagerCompletely() {
    const richTextArea = document.getElementById('rich-text-area');
    if (!richTextArea || this.suppressUpdate || this.suppressDOMSync) {
      console.log('syncDOMToTextManagerCompletely スキップ');
      return;
    }

    console.log('DOM全体をTextManagerに完全同期開始');

    // 現在のDOMからテキストとスタイル情報を抽出
    const textContent = richTextArea.textContent || '';
    const styleSegments = this.extractStyleSegmentsFromDOM(richTextArea);

    console.log('抽出されたテキスト:', textContent);
    console.log('抽出されたスタイルセグメント:', styleSegments);

    // TextManagerを更新
    this.suppressUpdate = true;
    try {
      // テキストを初期化
      this.textManager.initialize(textContent);

      // スタイルセグメントを適用
      for (const segment of styleSegments) {
        for (const [styleType, value] of Object.entries(segment.styles)) {
          this.textManager.applyStyle(segment.start, segment.end, styleType, value);
        }
      }

      console.log('TextManager同期完了:', this.textManager.getSegments());
    } finally {
      this.suppressUpdate = false;
    }
  }

  /**
   * DOMからスタイルセグメントを抽出
   */
  extractStyleSegmentsFromDOM(container) {
    const segments = [];
    let textPosition = 0;

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const textLength = node.textContent.length;
      const styles = this.extractStylesFromElement(node.parentElement);

      if (Object.keys(styles).length > 0) {
        segments.push({
          start: textPosition,
          end: textPosition + textLength,
          styles: styles
        });
      }

      textPosition += textLength;
    }

    return segments;
  }

  /**
   * 要素からスタイル情報を抽出
   */
  extractStylesFromElement(element) {
    const styles = {};

    // 親要素をさかのぼってスタイルを収集
    let currentElement = element;
    while (currentElement && currentElement.id !== 'rich-text-area') {
      // タグ名によるスタイル検出
      switch (currentElement.tagName) {
        case 'B':
        case 'STRONG':
          styles.bold = true;
          break;
        case 'I':
        case 'EM':
          styles.italic = true;
          break;
        case 'U':
          styles.underline = true;
          break;
      }

      // インラインスタイルの検出
      if (currentElement.style) {
        if (currentElement.style.fontWeight === 'bold' ||
            parseInt(currentElement.style.fontWeight) >= 600) {
          styles.bold = true;
        }
        if (currentElement.style.fontStyle === 'italic') {
          styles.italic = true;
        }
        if (currentElement.style.textDecoration &&
            currentElement.style.textDecoration.includes('underline')) {
          styles.underline = true;
        }
        if (currentElement.style.color) {
          styles.color = currentElement.style.color;
        }
      }

      currentElement = currentElement.parentElement;
    }

    return styles;
  }

  /**
   * カーソル位置に基づいてボタン状態を更新
   */
  updateButtonStatesFromCursor() {
    const selection = this.getSelectionRange();
    if (!selection) return;

    const cursorPosition = selection.start;
    const styles = this.textManager.getStyleAt(cursorPosition);

    // ボタン状態を更新
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');

    if (boldBtn) {
      boldBtn.classList.toggle('active', !!styles.bold);
    }
    if (italicBtn) {
      italicBtn.classList.toggle('active', !!styles.italic);
    }
    if (underlineBtn) {
      underlineBtn.classList.toggle('active', !!styles.underline);
    }

    // カラーピッカーも更新
    const colorPicker = document.getElementById('text-color');
    if (colorPicker && styles.color) {
      colorPicker.value = this.rgbToHex(styles.color);
    } else if (colorPicker) {
      colorPicker.value = '#000000'; // デフォルト色
    }

    console.log('カーソル位置ボタン状態更新:', {
      position: cursorPosition,
      styles: styles
    });
  }

  /**
   * RGB文字列をHex文字列に変換
   */
  rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;

    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#000000';

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Hex色をRGB文字列に変換
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
  }

  /**
   * テキスト色を適用（統合前のロジック使用）
   */
  applyTextColor(color) {
    const selection = this.getSelectionRange();

    if (!selection || selection.start === selection.end) {
      console.log('テキストが選択されていません - カーソル位置にスタイルを適用');
      // 選択がない場合、カーソル位置のスタイルを更新（次に入力するテキスト用）
      const cursorPos = selection ? selection.start : 0;
      // カーソル位置に仮想スタイルを設定（実装は今後検討）
      return;
    }

    console.log(`色適用: ${selection.start}-${selection.end} = ${color}`);
    console.log('Current TextManager text:', this.textManager.getText());
    console.log('Current segments before apply:', this.textManager.getSegments());

    // 選択範囲を保存
    this.savedSelection = selection;

    this.suppressUpdate = true;
    this.textManager.applyStyle(selection.start, selection.end, 'color', color);
    this.suppressUpdate = false;

    console.log('Segments after apply:', this.textManager.getSegments());

    // 選択範囲を保持しながら更新
    this.updateEditorFromTextManagerWithSelection();
  }
}

// エディタ初期化
let editor;

document.addEventListener('DOMContentLoaded', () => {
  editor = new RichTextEditor();

  // デバッグ用にグローバルに公開
  window.editor = editor;
  console.log('Editor initialized and available as window.editor');

  // URLパラメータから編集データを取得
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');

  if (editId && window.opener && window.opener.getTickerTextData) {
    const data = window.opener.getTickerTextData(editId);
    if (data) {
      editor.loadData(data);
    }
  }

  // 親へ READY 通知 (IPC)
  try {
    if (window.ContentBridge?.sendToParent) {
      window.ContentBridge.sendToParent({ type: "RICH_READY" });
    } else if (window.opener) {
      window.opener.postMessage({ type: "RICH_READY" }, "*");
    }
  } catch (error) {
    console.warn("READY送信失敗", error);
  }
});

// 親ウィンドウからのメッセージを受信
window.addEventListener("message", (event) => {
  if (!editor) return;
  const msg = event.data;
  if (!msg) return;
  switch (msg.type) {
    case "INIT_EDITOR":
      editor.loadData(msg.data);
      break;
    case "INIT_RICH":
      editor.parentIndex = msg.index;
      editor.loadData(msg.data);
      break;
  }
});

// 親ウィンドウからデータを受信する関数（レガシー互換性）
window.receiveEditData = function(data) { if(editor) editor.loadData(data); };