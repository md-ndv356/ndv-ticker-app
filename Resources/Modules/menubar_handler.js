/** メニューバー管理 */

const { app, Menu } = require("electron");
const WindowHandler = require("../Modules/window_handler");
const isMac = (process.platform === 'darwin');

const MenuJSON = [
  ...(isMac ? [{
      label: app.name,
      submenu: [
        {role:'about',      label:`${app.name}について` },
        {type:'separator'},
        {role:'services',   label:'サービス'},
        {type:'separator'},
        {role:'hide',       label:`${app.name}を隠す`},
        {role:'hideothers', label:'ほかを隠す'},
        {role:'unhide',     label:'すべて表示'},
        {type:'separator'},
        {role:'quit',       label:`${app.name}を終了`}
      ]
    }] : []),
  {
    label: 'ファイル',
    submenu: [
      isMac ? {role:'close', label:'ウィンドウを閉じる'} : {role:'quit', label:'終了'}
    ]
  },
  {
    label: '編集',
    submenu: [
      {role:'undo',  label:'元に戻す'},
      {role:'redo',  label:'やり直す'},
      {type:'separator'},
      {role:'cut',   label:'切り取り'},
      {role:'copy',  label:'コピー'},
      {role:'paste', label:'貼り付け'},
      ...(isMac ? [
        {role:'pasteAndMatchStyle', label:'ペーストしてスタイルを合わせる'},
        {role:'delete',    label:'削除'},
        {role:'selectAll', label:'すべてを選択'},
        {type:'separator' },
        {
          label: 'スピーチ',
          submenu: [
            {role:'startSpeaking', label:'読み上げを開始'},
            {role:'stopSpeaking',  label:'読み上げを停止'}
          ]
        }
      ] : [
        {role:'delete',    label:'削除'},
        {type:'separator'},
        {role:'selectAll', label:'すべてを選択'}
      ])
    ]
  },
  {
    label: '表示',
    submenu: [
      {role:'reload',         label:'再読み込み'},
      {role:'forceReload',    label:'強制的に再読み込み'},
      {role:'toggleDevTools', label:'開発者ツールを表示'},
      {type:'separator'},
      {role:'resetZoom',      label:'実際のサイズ'},
      {role:'zoomIn',         label:'拡大'},
      {role:'zoomOut',        label:'縮小'},
      {type:'separator'},
      {role:'togglefullscreen', label:'フルスクリーン'}
    ]
  },
  {
    label: 'ウィンドウ',
    submenu: [
      {role:'minimize', label:'最小化'},
      {role:'zoom',     label:'ズーム'},
      {type:'separator'},
      {
        label: '拡大率',
        submenu: [
          {
            label: '75%',
            type: 'radio',
            checked: true,
            click: function(e) {
            }
          }
        ]
      },
      {
        label: 'メイン画面を開く',
        click: () => {
          WindowHandler.open("main");
        }
      },
      {
        label: '設定を開く',
        click: () => {
          WindowHandler.open("settings");
        }
      },
      {
        label: '受信情報リストを開く',
        click: () => {
          WindowHandler.open("information");
        }
      },
      {
        label: 'トラフィックモニターを開く',
        click: () => {
          WindowHandler.open("traffic");
        }
      },
      {type:'separator'},
      ...(isMac ? [
        {role:'front',  label:'ウィンドウを手前に表示'},
        {type:'separator'},
        {role:'window', label:'ウィンドウ'}
      ] : [
        {role:'close',  label:'閉じる'}
      ])
    ]
  },
  {
    label:'ヘルプ',
    submenu: [
      {label:`${app.name} ヘルプ`},    // ToDo
      ...(isMac ? [] : [
        {type:'separator'} ,
        {role:'about',  label:`${app.name}について` }
      ])
    ]
  }
];
const menulist = {};

module.exports = {
  init: function (){
    menulist.default = Menu.buildFromTemplate(MenuJSON);
    Menu.setApplicationMenu(menulist.default);
  }
};
