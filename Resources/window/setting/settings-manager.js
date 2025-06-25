/**
 * NDV Settings Manager
 * Modern settings management with validation and persistence
 */

class SettingsManager {
  constructor() {
    this.config = {};
    this.defaultConfig = this.getDefaultConfig();
    this.currentSection = 'general';
    this.isDirty = false;
    this.validationRules = this.getValidationRules();

    this.init();
  }

  /**
   * Initialize the settings manager
   */
  async init() {
    await this.loadConfig();
    this.setupEventListeners();
    this.renderInitialState();
    this.updateConnectionStatus();
    this.initTickerTextManagement();
    this.initTickerTextModal();
    this.updateSaveButtonState('normal');
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      app: {
        autoStart: false,
        minimizeToTray: true,
        language: 'ja',
        timezone: 'Asia/Tokyo'
      },
      display: {
        window: {
          opacity: 1.0,
          alwaysOnTop: false,
          showFrame: true
        },
        theme: { mode: 'dark' }
      },
      config: {
        ticker: {
          scrollSpeed: 5.0,
          font: {
            family: 'system',
            size: 16
          },
          normal: {
            text: [
              {
                title: "お知らせ",
                text: "NDVティッカーへようこそ",
                id: Date.now(),
                enabled: true,
                type: "custom"
              },
              {
                title: "設定",
                text: "メニューバーから設定画面を開けます",
                id: Date.now() + 1,
                enabled: true,
                type: "custom"
              },
              {
                title: "気温情報",
                text: "本日の最高気温: <weather/temperature/high>、最低気温: <weather/temperature/low>",
                id: Date.now() + 2,
                enabled: true,
                type: "shortcut",
                shortcutType: "temperature"
              },
              {
                title: "降水情報",
                text: "1時間降水量: <weather/rain/1h>、24時間降水量: <weather/rain/24h>",
                id: Date.now() + 3,
                enabled: false,
                type: "shortcut",
                shortcutType: "precipitation"
              },
              {
                title: "風速情報",
                text: "現在の風速: <weather/wind>",
                id: Date.now() + 4,
                enabled: false,
                type: "shortcut",
                shortcutType: "wind"
              }
            ],
            cmdOpt: {
              unit: {
                winds: "m/s",
                temp: "centi"
              }
            },
            viewTsunamiType: 1,
            viewLittleTsunami: true
          },
          news: {
            title: "緊急情報",
            subtitle: "災害情報をリアルタイムでお届け",
            text: "現在、特別な情報はありません"
          },
          viewCond: {
            earthquake: {
              type: "and",
              intensity: "1",
              magnitude: "0",
              depth: "1000"
            },
            eew: {
              type: "or",
              intensity: "1",
              unknown: "1",
              magnitude: "0",
              depth: "1000"
            }
          },
          themeColor: {
            ticker: 0,
            clock: 0
          }
        }
      },
      eew: {
        enabled: true,
        showTestAlerts: false,
        minMagnitude: 4.0,
        maxIntensity: '4'
      },
      earthquake: {
        enabled: true,
        autoUpdate: true,
        updateInterval: 60
      },
      tsunami: {
        enabled: true,
        showMinorEvents: true
      },
      weather: {
        enabled: true,
        updateInterval: 300
      },
      audio: {
        enabled: true,
        volume: 50,
        eew: {
          soundFile: 'default',
          volume: 80
        }
      },
      speech: {
        enabled: false,
        voice: 'default',
        speed: 1.0,
        volume: 70
      },
      notifications: {
        enabled: true,
        showDesktop: true,
        playSound: true
      },
      advanced: {
        logLevel: 'info',
        maxLogSize: 10,
        enableCaching: true
      }
    };
  }

  /**
  * Get validation rules for configuration values
  */
  getValidationRules() {
    return {
      // Display settings
      'display.window.opacity': { min: 0.1, max: 1.0, type: 'number', unit: '' },

      // Ticker settings
      'ticker.scrollSpeed': { min: 0.1, max: 20.0, type: 'number', unit: 'px/f' },

      // Update intervals
      'intervals.eew': { min: 5, max: 60, type: 'number', unit: 'ms' },
      'intervals.earthquake': { min: 10, max: 300, type: 'number', unit: 'ms' },
      'intervals.tsunami': { min: 10, max: 300, type: 'number', unit: 'ms' },
      'intervals.weather': { min: 60, max: 3600, type: 'number', unit: 'ms' },

      // EEW settings
      'eew.minMagnitude': { min: 3.0, max: 8.0, type: 'number', unit: '%' },
      'display.eew.minIntensity': { min: 1, max: 7, type: 'number', unit: '' }, // ？？？？？？
      'display.eew.maxDepth': { min: 0, max: 700, type: 'number', unit: 'km' },

      // Earthquake settings
      'display.earthquake.minMagnitude': { min: 1.0, max: 9.0, type: 'number', unit: '' },
      'display.earthquake.minIntensity': { min: 1, max: 7, type: 'number', unit: '' }, // ？？？？？？
      'display.earthquake.maxDepth': { min: 0, max: 700, type: 'number', unit: 'km' },

      // Audio volumes
      'audio.volume.master': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.volume.eew': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.volume.earthquake': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.volume.tsunami': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.volume.weather': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.volume.voice': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.volume.system': { min: 0, max: 100, type: 'number', unit: '%' },

      // Quake volumes by intensity
      'audio.quakeVolume.intensity1': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.intensity2': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.intensity3': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.intensity4': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.intensity5Lower': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.intensity5Upper': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.intensity6Lower': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.intensity6Upper': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.intensity7': { min: 0, max: 100, type: 'number', unit: '%' },
      'audio.quakeVolume.overseas': { min: 0, max: 100, type: 'number', unit: '%' },

      // Speech settings
      'voice.volume': { min: 0, max: 100, type: 'number', unit: '%' }
    };
  }

  /**
  * Load configuration from storage
  */
  async loadConfig() {
    this.config = await window.ContentBridge.getConfig();
  }

  /**
  * Save configuration to storage
  */
  async saveConfig() {
    // Set button to saving state
    this.updateSaveButtonState('saving');

    try {
      if (window.ContentBridge && window.ContentBridge.setConfig) {
        await window.ContentBridge.setConfig(this.config);
        this.isDirty = false;
        this.showMessage('設定を保存しました', 'success');
        this.updateSaveButtonState('saved');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      this.showMessage('設定の保存に失敗しました', 'error');
      this.updateSaveButtonState('normal');
    }
  }

  /**
   * Update save button state
   */
  updateSaveButtonState(state) {
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn) return;

    switch (state) {
      case 'saving':
        saveBtn.textContent = '保存中...';
        saveBtn.className = 'btn btn-secondary';
        saveBtn.disabled = true;
        break;
      case 'saved':
        saveBtn.textContent = '保存済み';
        saveBtn.className = 'btn btn-success-disabled';
        saveBtn.disabled = true;
        // Reset after 2 seconds
        setTimeout(() => {
          this.updateSaveButtonState('normal');
        }, 2000);
        break;
      case 'normal':
      default:
        saveBtn.textContent = '保存';
        saveBtn.className = 'btn btn-primary';
        saveBtn.disabled = false;
        break;
    }
  }

  /**
  * Merge configurations with deep merge
  */
  mergeConfig(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /**
  * Setup event listeners
  */
  setupEventListeners() {
    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        if (section) {
          this.switchSection(section);
        }
      });
    });

    // Settings form inputs
    document.addEventListener('input', (e) => {
      if (e.target.matches('input[data-config], select[data-config], textarea[data-config]')) {
        this.handleInputChange(e);
      }
    });

    // Range input display updates
    document.addEventListener('input', (e) => {
      if (e.target.type === 'range') {
        this.updateRangeDisplay(e.target);
      }
    });

    // Save button
    const saveBtn = document.getElementById('save-btn');
    saveBtn.addEventListener('click', () => this.saveConfig());

    // Reset button
    const resetBtn = document.getElementById('reset-all-btn');
    resetBtn.addEventListener('click', () => this.resetToDefaults());

    // Import/Export buttons
    const importBtn = document.getElementById('import-btn');
    importBtn.addEventListener('click', () => this.importSettings());

    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', () => this.exportSettings());

    // Debug buttons
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    clearCacheBtn.addEventListener('click', () => this.clearCache());

    // const showConsoleBtn = document.getElementById('show-console');
    // showConsoleBtn.addEventListener('click', () => this.showConsole());

    const testEewBtn = document.getElementById('test-eew');
    if (testEewBtn) {
      testEewBtn.addEventListener('click', () => this.sendTestEEW());
    }

    const testEarthquakeBtn = document.getElementById('test-earthquake');
    if (testEarthquakeBtn) {
      testEarthquakeBtn.addEventListener('click', () => this.sendTestEarthquake());
    }

    // Shortcut buttons for ticker text
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('shortcut-btn')) {
        this.insertShortcut(e.target.dataset.shortcut);
      }
    });
  }

  /**
   * Handle input change events
   */
  handleInputChange(event) {
    const input = event.target;
    const configPath = input.dataset.config;
    let value = input.value;

    // Clear previous error
    this.clearFieldError(input);

    // Convert value based on input type
    if (input.type === 'number' || input.type === 'range') {
      value = parseFloat(value);
    } else if (input.type === 'checkbox') {
      value = input.checked;
    }

    // Validate the value
    const validation = this.validateValue(configPath, value);
    if (!validation.isValid) {
      this.showFieldError(input, validation.error);
      return;
    }

    // Set the config value
    this.setConfigValue(configPath, value);

    // Mark as dirty and reset save button state
    this.isDirty = true;
    this.updateSaveButtonState('normal');
    this.isDirty = true;

    // Apply live preview if applicable
    this.applyPreview(configPath, value);
  }

  /**
  * Validate a configuration value
  */
  validateValue(configPath, value) {
    const rule = this.validationRules[configPath];
    if (!rule) {
      return { isValid: true };
    }

    if (rule.type === 'number') {
      if (isNaN(value)) {
        return { isValid: false, error: '数値を入力してください' };
      }
      if (rule.min !== undefined && value < rule.min) {
        return { isValid: false, error: `最小値は ${rule.min} です` };
      }
      if (rule.max !== undefined && value > rule.max) {
        return { isValid: false, error: `最大値は ${rule.max} です` };
      }
    }

    return { isValid: true };
  }

  /**
  * Set a configuration value using dot notation path
  */
  setConfigValue(path, value) {
    const keys = path.split('.');
    let obj = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
  }

  /**
  * Get a configuration value using dot notation path
  */
  getConfigValue(path) {
    const keys = path.split('.');
    let obj = this.config;

    for (const key of keys) {
      if (obj === null || obj === undefined || !obj.hasOwnProperty(key)) {
        return undefined;
      }
      obj = obj[key];
    }

    return obj;
  }

  /**
  * Switch to a different settings section
  */
  switchSection(sectionName) {
    // Update sidebar
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === sectionName);
    });

    // Update content sections
    document.querySelectorAll('.setting-section').forEach(section => {
      section.classList.toggle('active', section.id === `${sectionName}-section`);
    });

    this.currentSection = sectionName;
  }

  /**
  * Render initial state from configuration
  */
  renderInitialState() {
    // Set all input values from config
    document.querySelectorAll('input[data-config], select[data-config], textarea[data-config]').forEach(input => {
      const configPath = input.dataset.config;
      const value = this.getConfigValue(configPath);

      if (value !== undefined) {
        if (input.type === 'checkbox') {
          input.checked = Boolean(value);
        } else {
          input.value = value;
        }

        // Update range displays
        if (input.type === 'range') {
          this.updateRangeDisplay(input);
        }
      }
    });

    // Update ticker text list
    this.updateTickerTextList();

    // Apply theme
    this.applyTheme();
  }

  /**
  * Update range input display value
  */
  updateRangeDisplay(input) {
    if (input.type !== 'range') return;

    const display = input.parentElement.getElementsByClassName('range-value')[0];
    if (display) {
      const unit = input.dataset.unit || '';
      if (unit === "%"){
        display.textContent = (input.value * 100).toFixed(0) + "%";
      } else {
        display.textContent = input.value + " " + unit;
      }
    }
  }

  /**
  * Apply live preview for certain settings
  */
  applyPreview(configPath, value) {
    switch (configPath) {
      case 'display.theme.mode':
        this.applyTheme();
        break;
      case 'display.window.opacity':
        // Preview opacity change
        window.ContentBridge.SetWindowOpacity(value - 0);
        break;
    }
  }

  /**
  * Apply theme settings
  */
  applyTheme() {
    const themeMode = this.getConfigValue('display.theme.mode');

    document.documentElement.setAttribute('data-theme', themeMode || 'dark');
  }

  /**
  * Reset all settings to defaults
  */
  async resetToDefaults() {
    if (confirm('すべての設定をリセットしますか？この操作は元に戻せません。')) {
      this.config = { ...this.defaultConfig };
      this.renderInitialState();
      await this.saveConfig();
      this.showMessage('設定をリセットしました', 'info');
    }
  }

  /**
  * Export settings to file
  */
  exportSettings() {
    const dataStr = JSON.stringify(this.config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ndv-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    this.showMessage('設定をエクスポートしました', 'success');
  }

  /**
  * Import settings from file
  */
  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedConfig = JSON.parse(text);

        // Validate imported config structure
        if (typeof importedConfig === 'object' && importedConfig !== null) {
          this.config = this.mergeConfig(this.defaultConfig, importedConfig);
          this.renderInitialState();
          await this.saveConfig();
          this.showMessage('設定をインポートしました', 'success');
        } else {
          this.showMessage('無効な設定ファイルです', 'error');
        }
      } catch (error) {
        console.error('Import failed:', error);
        this.showMessage('設定ファイルの読み込みに失敗しました', 'error');
      }
    };

    input.click();
  }

  /**
  * Initialize ticker text management
  */
  initTickerTextManagement() {
    // Add ticker text button
    const addTickerBtn = document.getElementById('add-ticker-text');
    if (addTickerBtn) {
      addTickerBtn.addEventListener('click', () => this.showTickerTextModal());
    }

    // Initialize ticker text list display
    this.updateTickerTextList();
  }

  /**
  * Initialize ticker text modal
  */
  initTickerTextModal() {
    const modal = document.getElementById('ticker-text-modal');
    const saveBtn = document.getElementById('save-ticker-text');
    const cancelBtn = document.getElementById('cancel-ticker-text');
    const closeBtn = modal?.querySelector('.modal-close');

    // 既存のイベントリスナーを削除（重複防止）
    if (saveBtn) {
      // 既存のクリックイベントを複製して削除
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
      newSaveBtn.addEventListener('click', () => this.saveTickerText());
    }

    if (cancelBtn) {
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
      newCancelBtn.addEventListener('click', () => this.hideTickerTextModal());
    }

    if (closeBtn) {
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      newCloseBtn.addEventListener('click', () => this.hideTickerTextModal());
    }

    // Close modal on background click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideTickerTextModal();
        }
      });
    }

    // ESC key to close modal（これは一度だけ登録すればOK）
    if (!this.escKeyListenerAdded) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'block') {
          this.hideTickerTextModal();
        }
      });
      this.escKeyListenerAdded = true;
    }

    // Text type change handler
    const textTypeInputs = document.querySelectorAll('input[name="text-type"]');
    textTypeInputs.forEach(input => {
      input.addEventListener('change', () => this.handleTextTypeChange());
    });

    // Variable options change handler
    const shortcutOptions = document.querySelectorAll('#shortcut-info-section input[type="radio"]');
    shortcutOptions.forEach(radio => {
      radio.addEventListener('change', () => this.updateVariablePreview());
    });

    // Rich text editor button handler
    const richTextEditorBtn = document.getElementById('open-rich-text-editor');
    if (richTextEditorBtn) {
      richTextEditorBtn.addEventListener('click', () => this.openRichTextEditor());
    }

    // Initialize rich text content
    this.currentRichTextContent = null;
  }

  /**
  * Show ticker text modal
  */
  showTickerTextModal(index = null) {
    console.log('=== showTickerTextModal開始 ===');
    console.log('渡されたindex:', index);
    console.log('設定前のcurrentTickerIndex:', this.currentTickerIndex);

    const modal = document.getElementById('ticker-text-modal');
    const titleElement = modal.querySelector('.modal-title');
    const titleInput = document.getElementById('ticker-text-title');
    const enabledCheckbox = document.getElementById('ticker-text-enabled');
    const customRadio = document.getElementById('text-type-custom');
    const shortcutRadio = document.getElementById('text-type-shortcut');

    if (!modal || !titleInput || !enabledCheckbox) return;

    this.currentTickerIndex = index;
    console.log('設定後のcurrentTickerIndex:', this.currentTickerIndex);

    if (index !== null) {
      // Edit mode
      titleElement.textContent = 'ティッカーテキストを編集';
      const tickerTexts = this.getConfigValue('config.ticker.normal.text') || [];
      const tickerText = tickerTexts[index];

      if (tickerText) {
        titleInput.value = tickerText.title || '';
        enabledCheckbox.checked = tickerText.enabled !== false;

        if (tickerText.type === 'shortcut') {
          // Shortcut preset mode
          shortcutRadio.checked = true;
          this.currentRichTextContent = null;

          // Set shortcut option
          const shortcutType = tickerText.shortcutType || tickerText.shortcutOptions || 'temperature';
          const shortcutRadioElement = document.querySelector(`#shortcut-info-section input[name="shortcut-type"][value="${shortcutType}"]`);
          if (shortcutRadioElement) {
            shortcutRadioElement.checked = true;
          } else {
            document.getElementById('shortcut-temperature').checked = true;
          }
        } else {
          // Custom rich text mode (includes legacy text without type)
          customRadio.checked = true;

          // Handle rich text content or legacy text
          if (tickerText.richContent) {
            this.currentRichTextContent = tickerText.richContent;
          } else if (tickerText.text) {
            // Convert legacy text to rich text format
            this.currentRichTextContent = {
              content: [
                {
                  type: 'text',
                  content: tickerText.text,
                  styles: {}
                }
              ],
              styles: {}
            };
          } else {
            this.currentRichTextContent = null;
          }

          // Reset shortcut options
          document.getElementById('shortcut-temperature').checked = true;
        }
      }
    } else {
      // Add mode
      titleElement.textContent = 'ティッカーテキストを追加';
      titleInput.value = '';
      enabledCheckbox.checked = true;
      customRadio.checked = true;
      this.currentRichTextContent = null;

      // Reset shortcut options
      document.getElementById('shortcut-temperature').checked = true;
    }

    this.handleTextTypeChange();
    modal.style.display = 'block';
    titleInput.focus();
  }

  /**
  * Hide ticker text modal
  */
  hideTickerTextModal() {
    const modal = document.getElementById('ticker-text-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentTickerIndex = null;
  }

  /**
  * Save ticker text
  */
  saveTickerText() {
    // 実行回数をカウント
    if (!this.saveCallCount) this.saveCallCount = 0;
    this.saveCallCount++;

    console.log('=== saveTickerText開始 ===');
    console.log('実行回数:', this.saveCallCount);
    console.log('関数開始時のcurrentTickerIndex:', this.currentTickerIndex);

    const titleInput = document.getElementById('ticker-text-title');
    const enabledCheckbox = document.getElementById('ticker-text-enabled');
    const customRadio = document.getElementById('text-type-custom');
    const shortcutRadio = document.getElementById('text-type-shortcut');

    if (!titleInput || !enabledCheckbox) return;

    const tickerTexts = this.getConfigValue('config.ticker.normal.text') || [];
    const title = titleInput.value.trim();

    console.log('保存前のtickerTexts配列:', JSON.parse(JSON.stringify(tickerTexts)));
    console.log('DOM要素確認後のcurrentTickerIndex:', this.currentTickerIndex);

    let newTickerText;

    if (customRadio.checked) {
      // Custom mode: Rich text content
      console.log('保存しようとしているリッチテキストデータ:', this.currentRichTextContent);

      if (!this.currentRichTextContent || !this.currentRichTextContent.content || this.currentRichTextContent.content.length === 0) {
        this.showMessage('リッチテキストエディタでメッセージを作成してください', 'error');
        return;
      }

      newTickerText = {
        title: title,
        id: this.currentTickerIndex !== null ? tickerTexts[this.currentTickerIndex].id : Date.now(),
        enabled: enabledCheckbox.checked,
        type: 'custom',
        richContent: this.currentRichTextContent
      };

      console.log('保存される新しいTickerText (カスタム):', newTickerText);
    } else if (shortcutRadio.checked) {
      // Shortcut mode: Preset selection
      const selectedShortcutOption = document.querySelector('#shortcut-info-section input[name="shortcut-type"]:checked');

      if (!selectedShortcutOption) {
        this.showMessage('定型メッセージを選択してください', 'error');
        return;
      }

      const presetContent = this.generateShortcutContent(selectedShortcutOption.value);

      newTickerText = {
        title: title || presetContent.title,
        id: this.currentTickerIndex !== null ? tickerTexts[this.currentTickerIndex].id : Date.now(),
        enabled: enabledCheckbox.checked,
        type: 'shortcut',
        shortcutType: selectedShortcutOption.value,
        presetContent: presetContent
      };

      console.log('保存される新しいTickerText (ショートカット):', newTickerText);
    }

    console.log('配列操作直前のcurrentTickerIndex:', this.currentTickerIndex);
    console.log('条件判定: this.currentTickerIndex !== null →', this.currentTickerIndex !== null);

    if (this.currentTickerIndex !== null) {
      // Update existing
      console.log('=== 既存アイテム更新モード ===');
      console.log('更新対象インデックス:', this.currentTickerIndex);
      console.log('配列長:', tickerTexts.length);
      console.log('更新前のアイテム:', JSON.parse(JSON.stringify(tickerTexts[this.currentTickerIndex])));
      tickerTexts[this.currentTickerIndex] = newTickerText;
      console.log('更新後のアイテム:', JSON.parse(JSON.stringify(tickerTexts[this.currentTickerIndex])));
    } else {
      // Add new
      console.log('=== 新規アイテム追加モード ===');
      tickerTexts.push(newTickerText);
    }

    console.log('最終的なtickerTexts配列:', JSON.parse(JSON.stringify(tickerTexts)));

    this.setConfigValue('config.ticker.normal.text', tickerTexts);

    const action = this.currentTickerIndex !== null ? '更新' : '追加';

    // モーダルを閉じる（この時点でcurrentTickerIndexがnullになる）
    this.hideTickerTextModal();
    this.updateTickerTextList();
    this.isDirty = true;

    this.showMessage(`ティッカーテキストを${action}しました`, 'success');

    // 実行回数をリセット
    this.saveCallCount = 0;
  }

  /**
  * Edit ticker text
  */
  editTickerText(index) {
    this.showTickerTextModal(index);
  }

  /**
  * Remove ticker text
  */
  removeTickerText(index) {
    console.log('=== removeTickerText呼び出し ===');
    console.log('削除対象インデックス:', index);

    if (!confirm('このティッカーテキストを削除しますか？')) {
      console.log('削除がキャンセルされました');
      return;
    }

    console.log('削除が確認されました');
    const tickerTexts = this.getConfigValue('config.ticker.normal.text') || [];
    console.log('削除前の配列長:', tickerTexts.length);

    tickerTexts.splice(index, 1);
    console.log('削除後の配列長:', tickerTexts.length);

    this.setConfigValue('config.ticker.normal.text', tickerTexts);
    this.updateTickerTextList();
    this.isDirty = true;

    console.log('削除処理完了');
  }

  /**
  * Toggle ticker text enabled state
  */
  toggleTickerText(index) {
    console.log('=== toggleTickerText呼び出し ===');
    console.log('切り替え対象インデックス:', index);

    const tickerTexts = this.getConfigValue('config.ticker.normal.text') || [];
    if (tickerTexts[index]) {
      const oldState = tickerTexts[index].enabled;
      tickerTexts[index].enabled = !tickerTexts[index].enabled;
      const newState = tickerTexts[index].enabled;

      console.log('状態変更:', oldState, '→', newState);

      this.setConfigValue('config.ticker.normal.text', tickerTexts);
      this.updateTickerTextList();
      this.isDirty = true;

      console.log('切り替え処理完了');
    } else {
      console.log('対象のアイテムが見つかりません');
    }
  }

  /**
  * Update ticker text list display
  */
  updateTickerTextList() {
    const listContainer = document.getElementById('ticker-text-list');
    if (!listContainer) return;

    const tickerTexts = this.getConfigValue('config.ticker.normal.text') || [];
    console.log('リスト更新中 - tickerTexts:', JSON.parse(JSON.stringify(tickerTexts)));

    if (tickerTexts.length === 0) {
      listContainer.innerHTML = '<div class="empty-state">ティッカーテキストが設定されていません</div>';
      return;
    }

    listContainer.innerHTML = tickerTexts.map((tickerText, index) => {
      const displayTitle = tickerText.title || '';
      let displayText = '';
      let typeIndicator = '';

      // Handle different text types
      if (tickerText.type === 'shortcut') {
        typeIndicator = '<span class="text-type-indicator shortcut">ショートカット</span>';
        // Create shortcut display description
        const shortcutType = tickerText.shortcutType || tickerText.shortcutOptions || 'temperature';
        const presetContent = this.generateShortcutContent(shortcutType);
        displayText = presetContent.content;
      } else if (tickerText.type === 'custom') {
        typeIndicator = '<span class="text-type-indicator custom">カスタム</span>';
        // Render rich text content for display
        if (tickerText.richContent && tickerText.richContent.content) {
          displayText = this.renderTickerTextDisplay(tickerText.richContent.content);
        } else {
          displayText = tickerText.text || '';
        }
      } else {
        // Legacy text format
        typeIndicator = '<span class="text-type-indicator custom">テキスト</span>';
        displayText = tickerText.text || '';
      }

      const escapedDisplayText = this.escapeHtml(displayText);

      return `
      <div class="ticker-text-item ${!tickerText.enabled ? 'disabled' : ''}" data-index="${index}">
        <div class="ticker-text-content">
          ${displayTitle ? `<div class="ticker-text-title">${this.escapeHtml(displayTitle)}</div>` : ''}
          <div class="ticker-text-type">${typeIndicator}</div>
          <div class="ticker-text-text">${escapedDisplayText}</div>
          <span class="ticker-text-status ${tickerText.enabled ? 'enabled' : 'disabled'}">
            ${tickerText.enabled ? '有効' : '無効'}
          </span>
        </div>
        <div class="ticker-text-actions">
          <button type="button" class="toggle-ticker-text" title="${tickerText.enabled ? '無効にする' : '有効にする'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${tickerText.enabled
                ? '<path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle>'
                : '<circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>'
              }
            </svg>
          </button>
          <button type="button" class="edit-ticker-text" title="編集">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="remove-ticker-text" title="削除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
            </svg>
          </button>
        </div>
      </div>`;
    }).join('');

    // Add event listeners using event delegation
    this.setupTickerTextEventDelegation();
  }

  /**
   * Setup event delegation for ticker text items (called once)
   */
  setupTickerTextEventDelegation() {
    const listContainer = document.getElementById('ticker-text-list');
    if (!listContainer) {
      console.log('ticker-text-listが見つかりません');
      return;
    }

    // クラスプロパティでフラグを管理（DOM再生成に影響されない）
    if (this.hasTickerTextEventDelegation) {
      console.log('既にイベント委譲が設定済みです - スキップ');
      return;
    }

    // Mark as having event delegation to prevent duplicate setup
    this.hasTickerTextEventDelegation = true;
    console.log('=== イベント委譲を設定中... ===');

    listContainer.addEventListener('click', (e) => {
      console.log('=== リストクリックイベント ===');
      console.log('クリックされた要素:', e.target);

      const item = e.target.closest('.ticker-text-item');
      if (!item) {
        console.log('ticker-text-itemが見つかりません');
        return;
      }

      const index = parseInt(item.dataset.index);
      if (isNaN(index)) {
        console.log('無効なインデックス:', item.dataset.index);
        return;
      }

      console.log('クリックされたアイテムのインデックス:', index);

      if (e.target.closest('.toggle-ticker-text')) {
        console.log('=== 有効・無効ボタンがクリックされました ===');
        e.preventDefault();
        e.stopPropagation();
        this.toggleTickerText(index);
      } else if (e.target.closest('.edit-ticker-text')) {
        console.log('=== 編集ボタンがクリックされました ===');
        e.preventDefault();
        e.stopPropagation();
        this.editTickerText(index);
      } else if (e.target.closest('.remove-ticker-text')) {
        console.log('=== 削除ボタンがクリックされました ===');
        e.preventDefault();
        e.stopPropagation();
        this.removeTickerText(index);
      }
    });

    console.log('=== イベント委譲の設定完了 ===');
  }

  /**
   * Render rich text content for ticker text display (simplified version)
   */
  renderTickerTextDisplay(content) {
    if (!content || !Array.isArray(content)) return '';

    return content.map(item => {
      switch (item.type) {
        case 'text':
          return this.escapeHtml(item.content || item.text);
        case 'variable':
          return `<span class="variable-placeholder">${this.escapeHtml(item.name)}</span>`;
        case 'icon':
          return `<span class="icon-element">🔷</span>`;
        default:
          return '';
      }
    }).join('');
  }

  /**
   * Attach event listeners to ticker text items
   */
/**
* Escape HTML characters
*/
escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
* Show field error
*/
showFieldError(input, message) {
  const settingItem = input.closest('.setting-item');
  if (!settingItem) return;

  let errorElement = settingItem.querySelector('.field-error');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    settingItem.appendChild(errorElement);
  }

  errorElement.textContent = message;
  input.classList.add('error');
}

/**
 * Clear field error
 */
clearFieldError(input) {
  const settingItem = input.closest('.setting-item');
  if (!settingItem) return;

  const errorElement = settingItem.querySelector('.field-error');
  if (errorElement) {
    errorElement.remove();
  }

  input.classList.remove('error');
}

/**
 * Show status message
 */
showMessage(message, type = 'info') {
  // Create or update status message
  let statusElement = document.getElementById('status-message');
  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = 'status-message';
    statusElement.className = 'status-message';
    document.body.appendChild(statusElement);
  }

  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  statusElement.style.display = 'block';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

/**
 * Update connection status
 */
updateConnectionStatus() {
  const statusEl = document.getElementById('connection-status');
  if (statusEl) {
    // This would typically check actual connection status
    statusEl.textContent = '接続中';
    statusEl.className = 'status connected';
  }

  const lastUpdateEl = document.getElementById('last-update');
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `最終更新: ${new Date().toLocaleTimeString()}`;
  }
}

/**
 * Update system information in debug section
 */
async updateSystemInfo() {
  try {
    if (window.ContentBridge && window.ContentBridge.getSystemInfo) {
      const systemInfo = await window.ContentBridge.getSystemInfo();

      const infoContainer = document.getElementById('system-info');
      if (infoContainer && systemInfo) {
        infoContainer.innerHTML = `
          <div class="info-item">
            <span class="info-label">OS:</span>
            <span class="info-value">${systemInfo.platform || 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">アーキテクチャ:</span>
            <span class="info-value">${systemInfo.arch || 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Node.js:</span>
            <span class="info-value">${systemInfo.nodeVersion || 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Electron:</span>
            <span class="info-value">${systemInfo.electronVersion || 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">メモリ使用量:</span>
            <span class="info-value">${systemInfo.memoryUsage || 'Unknown'}</span>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Failed to update system info:', error);
  }
}

/**
* Clear application cache
*/
async clearCache() {
  if (confirm('キャッシュをクリアしますか？アプリケーションが再起動される場合があります。')) {
    try {
      if (window.ContentBridge && window.ContentBridge.clearCache) {
        await window.ContentBridge.clearCache();
        this.showMessage('キャッシュをクリアしました', 'success');
      } else {
        this.showMessage('キャッシュクリア機能は利用できません', 'warning');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      this.showMessage('キャッシュのクリアに失敗しました', 'error');
    }
  }
}

// /**
// * Show developer console
// */
// showConsole() {
//   if (window.ContentBridge && window.ContentBridge.showDevTools) {
//     window.ContentBridge.showDevTools();
//   } else {
//     // Fallback for development
//     console.log('Developer console would be opened here');
//     this.showMessage('開発者コンソールを開きました', 'info');
//   }
// }

/**
* Send test EEW
*/
sendTestEEW() {
  if (confirm('テスト用緊急地震速報を送信しますか？')) {
    const testData = {
      type: 'eew',
      magnitude: 5.5,
      epicenter: 'テスト震源',
      maxIntensity: '震度4',
      isTest: true
    };

    if (window.ContentBridge && window.ContentBridge.sendTestData) {
      window.ContentBridge.sendTestData(testData);
    } else {
      console.log('Test EEW would be sent:', testData);
    }

    this.showMessage('テスト用EEWを送信しました', 'info');
  }
}

/**
* Send test earthquake information
*/
sendTestEarthquake() {
  if (confirm('テスト用地震情報を送信しますか？')) {
    const testData = {
      type: 'earthquake',
      magnitude: 4.2,
      epicenter: 'テスト地域',
      depth: '10km',
      maxIntensity: '震度3',
      occurredAt: new Date().toISOString(),
      isTest: true
    };

    if (window.ContentBridge && window.ContentBridge.sendTestData) {
      window.ContentBridge.sendTestData(testData);
    } else {
      console.log('Test earthquake would be sent:', testData);
    }

    this.showMessage('テスト用地震情報を送信しました', 'info');
  }
}

/**
 * Insert shortcut into ticker text input
 */
insertShortcut(shortcut) {
  const textInput = document.getElementById('ticker-text-input');
  if (!textInput) return;

  const start = textInput.selectionStart;
  const end = textInput.selectionEnd;
  const currentValue = textInput.value;

  // Insert the shortcut at cursor position
  const newValue = currentValue.slice(0, start) + shortcut + currentValue.slice(end);
  textInput.value = newValue;

  // Set cursor position after the inserted shortcut
  const newCursorPos = start + shortcut.length;
  textInput.focus();
  textInput.setSelectionRange(newCursorPos, newCursorPos);

  // Show success message
  this.showMessage(`ショートカット "${shortcut}" を挿入しました`, 'success');
}

/**
 * Update ticker text preview in modal
 */
updateTickerTextPreview() {
  const textInput = document.getElementById('ticker-text-input');
  const previewArea = document.getElementById('ticker-text-preview');

  if (!textInput || !previewArea) return;

  const text = textInput.value;
  if (!text.trim()) {
    previewArea.innerHTML = '';
    return;
  }

  // Escape HTML for preview display
  const escapedText = this.escapeHtml(text);
  previewArea.innerHTML = escapedText;
}

/**
 * Handle text type change (shortcut vs custom)
 */
  handleTextTypeChange() {
    const customRadio = document.getElementById('text-type-custom');
    const shortcutRadio = document.getElementById('text-type-shortcut');
    const customSection = document.getElementById('custom-text-section');
    const shortcutSection = document.getElementById('shortcut-info-section');

    if (customRadio.checked) {
      // Custom mode: Show rich text editor controls
      customSection.style.display = 'block';
      shortcutSection.style.display = 'none';
      this.updateRichTextPreview();
    } else if (shortcutRadio.checked) {
      // Shortcut mode: Show preset selection
      customSection.style.display = 'none';
      shortcutSection.style.display = 'block';
      this.updateVariablePreview();
    }
  }  /**
   * Get shortcut option label
   */
  getShortcutOptionLabel(value) {
    const labels = {
      'temperature': '天気概況メッセージ',
      'precipitation': '降水情報メッセージ',
      'wind': '風・気圧メッセージ',
      'warning': '警報・注意報メッセージ'
    };
    return labels[value] || value;
  }  /**
   * Open Rich Text Editor for custom content creation
   */
  async openRichTextEditor() {
    try {
      // Pass current rich text content if it exists
      const editorData = this.currentRichTextContent || null;

      // Open rich text editor window
      const richTextWindow = window.open(
        '../rich-text-editor/index.html',
        'richTextEditor',
        'width=1200,height=800,resizable=yes,scrollbars=yes'
      );

      if (!richTextWindow) {
        throw new Error('ポップアップがブロックされました。ポップアップを許可してください。');
      }

      // Wait for editor to load and pass data
      richTextWindow.addEventListener('load', () => {
        if (editorData) {
          richTextWindow.postMessage({
            type: 'INIT_EDITOR',
            data: editorData
          }, '*');
        }
      });

      // Listen for editor results
      const messageHandler = (event) => {
        if (event.source !== richTextWindow) return;

        if (event.data.type === 'EDITOR_SAVE') {
          // Receive rich text content from editor
          console.log('=== エディタからデータ受信 ===');
          console.log('受信時のcurrentTickerIndex:', this.currentTickerIndex);
          console.log('エディタからデータを受信:', event.data.data);
          console.log('受信前のcurrentRichTextContent:', this.currentRichTextContent);
          this.currentRichTextContent = event.data.data;
          console.log('受信後のcurrentRichTextContent:', this.currentRichTextContent);
          console.log('データ受信後のcurrentTickerIndex:', this.currentTickerIndex);
          this.updateRichTextPreview();
          richTextWindow.close();
          window.removeEventListener('message', messageHandler);
        } else if (event.data.type === 'EDITOR_CANCEL') {
          richTextWindow.close();
          window.removeEventListener('message', messageHandler);
        }
      };

      window.addEventListener('message', messageHandler);

      // Handle window close without save
      const checkClosed = setInterval(() => {
        if (richTextWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
        }
      }, 1000);

    } catch (error) {
      console.error('Rich text editor open error:', error);
      this.showMessage(`エディタを開けませんでした: ${error.message}`, 'error');
    }
  }

  /**
   * Update rich text preview in modal
   */
  updateRichTextPreview() {
    const previewElement = document.getElementById('rich-text-preview');
    if (!previewElement) return;

    console.log('プレビュー更新中 - currentRichTextContent:', this.currentRichTextContent);

    if (!this.currentRichTextContent || !this.currentRichTextContent.content || this.currentRichTextContent.content.length === 0) {
      previewElement.innerHTML = '<p class="preview-placeholder">編集ボタンをクリックしてメッセージを作成してください</p>';
      return;
    }

    // Render rich text content to preview
    const contentHtml = this.renderRichTextContent(this.currentRichTextContent.content);
    console.log('生成されたプレビューHTML:', contentHtml);
    previewElement.innerHTML = `<div class="rich-content">${contentHtml}</div>`;
  }

  /**
   * Render rich text content to HTML for preview
   */
  renderRichTextContent(content) {
    if (!content || !Array.isArray(content)) return '';

    return content.map(item => {
      switch (item.type) {
        case 'text':
          let html = this.escapeHtml(item.content || item.text || '');

          // Apply styling with correct property names
          if (item.styles && Object.keys(item.styles).length > 0) {
            const styles = item.styles;
            let styleString = '';

            if (styles.fontWeight === 'bold') {
              html = `<strong>${html}</strong>`;
            }
            if (styles.fontStyle === 'italic') {
              html = `<em>${html}</em>`;
            }
            if (styles.textDecoration === 'underline') {
              html = `<u>${html}</u>`;
            }
            if (styles.color) {
              styleString += `color: ${styles.color}; `;
            }
            if (styles.backgroundColor) {
              styleString += `background-color: ${styles.backgroundColor}; `;
            }
            if (styles.fontSize) {
              styleString += `font-size: ${styles.fontSize}; `;
            }

            if (styleString) {
              html = `<span style="${styleString}">${html}</span>`;
            }
          }

          return html;

        case 'variable':
          return `<span class="variable-placeholder">${this.escapeHtml(item.name)}</span>`;

        case 'icon':
          return `<span class="icon-element">${item.svg || '🔷'}</span>`;

        default:
          return '';
      }
    }).join('');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generate shortcut preset content
   */
  generateShortcutContent(shortcutType) {
    const presets = {
      temperature: {
        title: '天気概況',
        content: '現在の気温は${currentTemp}°C、最高気温${maxTemp}°C、最低気温${minTemp}°Cとなっています。天候は${weather}です。'
      },
      precipitation: {
        title: '降水情報',
        content: '1時間降水量: ${precipitation1h}mm、24時間降水量: ${precipitation24h}mm。降水確率は${precipitationProb}%です。'
      },
      wind: {
        title: '風・気圧情報',
        content: '風速${windSpeed}m/s、風向${windDirection}、気圧${pressure}hPa、湿度${humidity}%となっています。'
      },
      warning: {
        title: '警報・注意報',
        content: '現在、${warningArea}に${warningType}が発表されています。詳細は気象庁の情報をご確認ください。'
      }
    };

    return presets[shortcutType] || presets.temperature;
  }

  /**
   * Update variable preview for shortcut presets
   */
  updateVariablePreview() {
    const previewElement = document.getElementById('ticker-text-preview');
    if (!previewElement) return;

    const selectedShortcut = document.querySelector('#shortcut-info-section input[name="shortcut-type"]:checked');
    if (!selectedShortcut) return;

    const presetContent = this.generateShortcutContent(selectedShortcut.value);
    previewElement.textContent = presetContent.content;
  }

  /**
   * Attach event listeners to ticker text items
   */
  attachTickerTextEventListeners() {
    const listContainer = document.getElementById('ticker-text-list');
    if (!listContainer) return;

    // Remove existing event listeners
    const buttons = listContainer.querySelectorAll('button');
    buttons.forEach(button => {
      button.replaceWith(button.cloneNode(true));
    });

    // Add new event listeners
    listContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.ticker-text-item');
      if (!item) return;

      const index = parseInt(item.dataset.index);
      if (isNaN(index)) return;

      if (e.target.closest('.edit-ticker-text')) {
        this.editTickerText(index);
      } else if (e.target.closest('.remove-ticker-text')) {
        this.removeTickerText(index);
      } else if (e.target.closest('.toggle-ticker-text')) {
        this.toggleTickerText(index);
      }
    });
  }
}

// External link handler
function openExternal(url) {
  if (window.ContentBridge && window.ContentBridge.openExternal) {
    window.ContentBridge.openExternal(url);
  } else {
    window.open(url, '_blank');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SettingsManager();
});
