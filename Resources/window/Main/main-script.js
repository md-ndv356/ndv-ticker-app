// Release Note: アプデ前にアーカイブを取ること (2021-07-29から)
// Release Note: 必ずバージョンを更新すること
// Release Note: Update the Created Date!
//  manifest.jsonも
//  ホームページも
//  Google Apps Scriptも
//  _ContentVersionsも
//  _appVersionも

let _ContentVersions, _appVersion, _appVersionView, _latestCreatedDate;
(async function(){
  const appInfo = await ContentBridge.requestAppInfo();
  _ContentVersions = appInfo.history;
  _appVersion = appInfo.versionDatabase[appInfo.current].viewname;
  _appVersionView = _appVersion.replaceAll("_alpha", "a").replaceAll("_betas", "b");
  _latestCreatedDate = new Date(appInfo.lastModified).toISOString().replaceAll(/[-:TZ]/g, "").replace(/\.(.*)/, "");
  let releaseNoteList = [""];
  for (const key in appInfo.versionDatabase){
    const item = appInfo.versionDatabase[key];
    releaseNoteList.push("  ("+item.releaseDate+") "+item.viewname+" "+item.detail);
  }

  console.log(`%cNDV %c(Natural Disaster Viewer)%c   v.${_appVersion}%c${releaseNoteList.join("\n")}`,
    "background: #9f9; font-family: sans-serif; font-weight: 700; padding: 2px; font-size: 19px; font-style: italic;",
    "background: #9f9; font-family: sans-serif; font-weight: 700; padding: 2px; font-size: 11px; font-style: italic;",
    "background: #9f9; font-family: sans-serif; font-weight: 700; padding: 2px; font-size: 9px; color: #888;",
    "background: #fff; font-family: sans-serif; font-weight: 400; padding: 2px; font-size: 9px; color: #333;"
  );
})();

console.log('window name is "viewer"');
console.log("%cProgram Started at: "+(new Date()).toISOString(),
  "background: #55f; font-family: sans-serif; font-weight: 300; padding: 2px; font-size: 14px; color: white;"
);

const _U = undefined;
const _N = null;
const _T = true;
const _F = false;
const gElByCl = (name,index=0)=>document.getElementsByClassName(name)[Number(index)];
window.sleep = (ms=0)=>{return new Promise((resolve,reject)=>{setTimeout(()=>{resolve()},ms)})};
let PlatformOS = null;

const screenWhileStarting = function(){
  if(!screenWhileStarting.preparing) return;
  screenWhileStarting.elapsedFrame++;
  ct_time.fillStyle = "black";
  ct_time.fillRect(0, 0, 128, 128);
  ct_time.fillStyle = "white";
  ct_time.font = "bold 24px monospace";
  ct_time.fillText("Latest Created", 8,  34, 114);
  ct_time.fillText(_latestCreatedDate, 8,  58, 114);
  ct_time.fillText((" NDV v"+_appVersionView).padEnd(14, " "), 8,  82, 114);
  ct_time.fillText("frames = "+("    "+screenWhileStarting.elapsedFrame).slice(-5), 8,  116, 114);

  if(window.webgl && webgl.textures.loadingInfo) {
    let buffers = webgl.buffers.loadingInfo;
    webgl.fun.registerBufferData(webgl.gl, buffers[0].data[0], buffers[1].data[0], buffers[0].index);
    webgl.gl.clear(webgl.gl.DEPTH_BUFFER_BIT | webgl.gl.COLOR_BUFFER_BIT);
    webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.textures.loadingInfo);
    webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 0);
  }
  requestAnimationFrame(screenWhileStarting);
};
screenWhileStarting.elapsedFrame = 0;
screenWhileStarting.preparing = true;
requestAnimationFrame(screenWhileStarting);

// 起動からの経過時間
var elapsedFrame = 0;
// earthquake variables
var allcitydata = [], allcity = [], allprefecture = [], allcitykana = [];

// 情報の読み込みを管理するオブジェクトです。
// TODO: メインプロセスに移行
// const XHRs = {
//   diderr: function(){ console.error("読み込み時にエラーが発生しました"); },
//   didtimeout: function(){ console.warn("タイムアウトです。\n"+this.timeout+"ミリ秒が経過したため、読み込みは中断されました。")},
//   mscale: {
//     body: new XMLHttpRequest(),
//     load: function(){
//       this.body.timeout = this.timeout;
//       this.body.open("GET", 'https://weathernews.jp/mscale/json/scale.json?_='+new Date().getTime());
//       this.body.send();
//     },
//     timeout: 8500,
//     does: "WeathernewsのMスケール"
//   },
//   teideninfo: {
//     body: new XMLHttpRequest(),
//     load: function(){
//       this.body.timeout = this.timeout;
//       this.body.open("GET", 'https://teideninfo.tepco.co.jp/flash/xml/00000000000.xml?'+new Date().getTime());
//       this.body.send();
//     },
//     timeout: 28000,
//     does: "東京電力の停電情報"
//   },
//   getJMAforecast: {
//     body: new XMLHttpRequest(),
//     load: function(){
//       // this.body.timeout = this.timeout;
//       // this.body.open("GET", 'https://www.jma.go.jp/bosai/forecast/data/forecast/map.json?'+new Date().getTime());
//       // this.body.send();
//     },
//     timeout: 61000,
//     does: "気象庁天気予報"
//   },
//   river: {
//     body: new XMLHttpRequest(),
//     load: function(){
//       this.body.timeout = this.timeout;
//       this.body.open("GET", 'https://weathernews.jp/river/csv_v2/latest.csv?'+new Date().getTime());
//       this.body.send();
//     },
//     timeout: 350000,
//     does: "気象庁天気予報"
//   },
//   wnlTimetable: {
//     body: new XMLHttpRequest(),
//     load: function(){
//       this.body.timeout = this.timeout;
//       this.body.open("GET", 'https://smtgvs.weathernews.jp/a/solive_timetable/timetable.json?_='+new Date().getTime());
//       this.body.send();
//     },
//     timeout: 5000,
//     does: "ウェザーニュースLiVEの番組表"
//   }
// };
// XHRs.mscale.body.parent = XHRs.mscale;
// XHRs.mscale.body.addEventListener("load", function(){
//   let json = JSON.parse(this.response);
//   lastGet.wniMScale = getCTime();
//   updateLoadedTime();
//   if(mscale !== json.mscale-1) SetMscale(mscale);
// });
// XHRs.mscale.body.addEventListener("error", XHRs.diderr);
// XHRs.mscale.body.addEventListener("timeout", XHRs.didtimeout);
// XHRs.teideninfo.body.parent = XHRs.teideninfo;
// XHRs.teideninfo.body.addEventListener("load", function(){
//   let c = this.responseXML;
//   lastGet.tepcoTeiden = getCTime();
//   updateLoadedTime();
//   teidentext = $(c).find('東京電力停電情報 > お知らせ').text() + "　";
//   let teidenkensu_zentai = Number($(c).find('東京電力停電情報 > 停電軒数').text());
//   let teidenkensu_kenbetsu = [];
//   let teidenkensu_areas = Array.from(c.getElementsByTagName('エリア'));
//   for(let c2 of teidenkensu_areas){
//     if($(c2).find('停電軒数').text()){
//       teidenkensu_kenbetsu.push({
//         code: $(c2).attr('コード'),
//         name: $(c2).find('名前').text(),
//         value: Number($(c2).find('停電軒数').text())
//       });
//     }
//   }
//   teidenkensu_kenbetsu.forEach(function(c2){
//       teidentext += "　" + c2.name + "：約" + c2.value + "軒";
//   });
//   teidentext += "　(総数：" + teidenkensu_zentai + "軒)";
//   if (!teidenkensu_zentai) {
//     teidentext = "現在、停電情報はございません。";
//   }
// });
// XHRs.teideninfo.body.addEventListener("error", XHRs.diderr);
// XHRs.teideninfo.body.addEventListener("timeout", XHRs.didtimeout);
// XHRs.getJMAforecast.body.parent = XHRs.getJMAforecast;
// XHRs.getJMAforecast.body.addEventListener("load", function(){});
// XHRs.getJMAforecast.body.addEventListener("error", XHRs.diderr);
// XHRs.getJMAforecast.body.addEventListener("timeout", XHRs.didtimeout);
// XHRs.river.body.parent = XHRs.river;
// XHRs.river.body.addEventListener("load", function(){
//   let riverWarnDatas = [];
//   lastGet.wniRiver = getCTime();
//   updateLoadedTime();
//   let text = this.response;
//   let lines = text.split(/[\r\n]/);
//   let headers = [];
//   {
//     let w = lines[0].split(/,/);
//     for(let i=0, l=w.length; i<l; i++){
//       headers.push(w[i]);
//     }
//   }
//   for(let i=2, l=lines.length; i<l; i++){
//     let w = lines[i].split(/,/);
//     let point = {};
//     for(let i2=0, l2=w.length; i2<l2; i2++){
//       point[headers[i2]] = w[i2];
//     }
//     let id = point.id;
//     if(riverPoints.hasOwnProperty(id)){
//       let volume = point.volume-0;
//       let diff = volume-point.pre_volume;
//       let announced_time = new Date(point.announced_time*1000);
//       riverWarnDatas.push({
//         id, volume, diff, announced_time, rank: point.rank,
//         point_name: `${riverPoints[id].river_name} ${riverPoints[id].parent_river}水系 ${riverPoints[id].point_name}`
//       });
//     }
//   }
//   // riverlevel[0] = data.filter(function(arr){ return arr['properties']['LEVEL'] == -1 });
//   riverlevel[1] = riverWarnDatas.filter(function(arr){ return arr.rank == "0" });
//   riverlevel[2] = riverWarnDatas.filter(function(arr){ return arr.rank == "1" });
//   riverlevel[3] = riverWarnDatas.filter(function(arr){ return arr.rank == "2" });
//   riverlevel[4] = riverWarnDatas.filter(function(arr){ return arr.rank == "3" });
//   riverlevel[5] = riverWarnDatas.filter(function(arr){ return arr.rank == "4" });
//   riverlevel[6] = riverWarnDatas.filter(function(arr){ return arr.rank == "5" });
//   for(var i=1; i<7; i++){
//     if(riverlevel[i].length) rivertext[i] = "　　【河川水位情報 "+["平常","水防団待機水位","氾濫注意水位","出動水位","避難判断水位","氾濫危険水位","計画高水位"][i]+"】　"; else rivertext[i] = "";
//     rivertext[i] += riverlevel[i].map((a)=>{return a.point_name}).join("　/　");
//   }
//   rivertext[0] = "";
//   riveralltext = arrayCombining(rivertext);
// });
// XHRs.river.body.addEventListener("error", XHRs.diderr);
// XHRs.river.body.addEventListener("timeout", XHRs.didtimeout);
// XHRs.wnlTimetable.body.parent = XHRs.wnlTimetable;
// XHRs.wnlTimetable.body.addEventListener("load", function(){
//   let data = JSON.parse(this.response);
//   lastGet.wniliveTimeTable = getCTime();
//   updateLoadedTime();
//   timetableStr = "";
//   data.forEach(function(value){
//     timetableStr += value.hour+" → "+value.title+"　　";
//   });
// });
// XHRs.wnlTimetable.body.addEventListener("error", XHRs.diderr);
// XHRs.wnlTimetable.body.addEventListener("timeout", XHRs.didtimeout);
// var lastGet = {
//   iedred7584EEW: "---",
//   nhkQuake1: "---",
//   nhkQuake2: "---",
//   tenkiJPtsunami: "---",
//   wniMScale: "---",
//   wniSorabtn: "---",
//   wniRiver: "---",
//   jmaTableCsvPre1h00_rct: "---",
//   jmaTableCsvPre24h00_rct: "---",
//   jmaTableCsvMxwsp00_rct: "---",
//   jmaTableCsvMxtemsadext00_rct: "---",
//   jmaTableCsvMntemsadext00_rct: "---",
//   jmaDevFeedExtra: "---",
//   wniliveTimeTable: "---",
//   tepcoTeiden: "---"
// };

// TODO:
// // chrome storage
// chrome.storage.sync.get(['mode0', 'mode3', 'settings', 'app'], function(c){
//   let isSaving = false;
//   // Release note: 必ず追加すること
//   console.log(JSON.stringify(c));
//   if(!c.app){
//     isSaving = true;
//   } else {
//     if(c.app.lastVer !== _appVersion) isSaving = true;
//     if(_ContentVersions.indexOf(c.app.lastVer) < 3){
//       // β0.1.2以前
//       if(c.settings.volume.eewH == 100){
//         alert("（ "+c.app.lastVer+" からのバージョンアップを検知しました）\n緊急地震速報(警報)時の音量を再確認し、必ず保存してください。");
//       }
//     }
//     if(_ContentVersions.indexOf(c.app.lastVer) < 7 || c.app.newUser || c.settings.sendEEW === undefined){
//       // β0.1.6以前 または 初回起動時
//       isSaving = true;
//       confirmSendingEEWdatasAutomatically();
//     } else {
//       EEWsendingAllowed = c.settings.sendEEW;
//     }
//   }
//   viewSendingEEWdatasAutomatically(EEWsendingAllowed);
//
//   if(c.app.newUser) isSaving = true;
//   console.log(c);
//   document.getElementById('message1').value = c.mode0.main[0];
//   document.getElementById('message2').value = c.mode0.main[1];
//   document.getElementById('message3').value = c.mode0.main[2];
//   document.getElementById('message4').value = c.mode0.main[3];
//   document.getElementById('message5').value = c.mode0.main[4];
//   document.getElementById('title1').value = c.mode0.title[0];
//   document.getElementById('title2').value = c.mode0.title[1];
//   document.getElementById('title3').value = c.mode0.title[2];
//   document.getElementById('title4').value = c.mode0.title[3];
//   document.getElementById('title5').value = c.mode0.title[4];
//   document.getElementById('BNtitle').value = c.mode3[0];
//   document.getElementById('BNtext1').value = c.mode3[1];
//   document.getElementById('BNtext2').value = c.mode3[2];
//   document.getElementsByName('recordingwheneewreceived')[0].checked = c.settings.autorecord;
//   document.getElementById('isSoraview').checked = c.settings.soraview;
//   document.getElementById('setClipEEW').checked = c.settings.clipboard.eew;
//   document.getElementById('setClipQuake').checked = c.settings.clipboard.quake;
//   document.getElementById('setIntervalIedred').value = c.settings.interval.iedred7584EEW;
//   document.getElementById('setIntervalNHKquake').value = c.settings.interval.nhkQuake;
//   document.getElementById('setIntervalJmaWt').value = c.settings.interval.jmaDevFeed;
//   document.getElementById('setIntervalTenkiJpTsu').value = c.settings.interval.tenkiJPtsunami;
//   document.getElementById('setIntervalWNImscale').value = c.settings.interval.wniMScale;
//   document.getElementById('setIntervalWNIsorabtn').value = c.settings.interval.wniSorabtn;
//   document.getElementById('setIntervalWNIriver').value = c.settings.interval.wniRiver;
//   document.getElementById('setIntervalWNItm').value = c.settings.interval.wniliveTimeTable;
//   document.getElementById('setIntervalTpcBlackOut').value = c.settings.interval.tepcoTeiden;
//   document.getElementById('volEEWl').value = c.settings.volume.eewL;
//   document.getElementById('volEEWh').value = c.settings.volume.eewH;
//   document.getElementById('volGL').value = c.settings.volume.gl;
//   document.getElementById('volNtc').value = c.settings.volume.ntc;
//   document.getElementById('volSpW').value = c.settings.volume.spW;
//   document.getElementById('volTnm').value = c.settings.volume.tnm;
//   document.getElementById('volHvRa').value = c.settings.volume?.hvra ?? 100;
//   document.getElementById('volFldOc').value = c.settings.volume?.fldoc ?? 100;
//   document.getElementsByName("themeColors")[0].value = c.settings?.theme?.color ?? 0;
//   colorThemeMode = c.settings?.theme?.color ?? 0;
//   if(isSaving) savedata();
//   audioAPI.gainNode.gain.value = c.settings.volume.eewH / 100;
//   isSoraview = c.settings.soraview;
// });
// function savedata(){
//   var data = {
//     mode0: {
//       title: [
//         document.getElementById('title1').value,
//         document.getElementById('title2').value,
//         document.getElementById('title3').value,
//         document.getElementById('title4').value,
//         document.getElementById('title5').value
//       ],
//       main: [
//         document.getElementById('message1').value,
//         document.getElementById('message2').value,
//         document.getElementById('message3').value,
//         document.getElementById('message4').value,
//         document.getElementById('message5').value
//       ]
//     },
//     mode3: [
//       document.getElementById('BNtitle').value,
//       document.getElementById('BNtext1').value,
//       document.getElementById('BNtext2').value
//     ],
//     settings: {
//       autorecord: document.getElementsByName('recordingwheneewreceived')[0].checked,
//       fixitem: [
//         document.getElementsByName('scrollfix')[0].checked,
//         document.getElementsByName('scrollfix')[1].checked,
//         document.getElementsByName('scrollfix')[2].checked,
//         document.getElementsByName('scrollfix')[3].checked,
//         document.getElementsByName('scrollfix')[4].checked
//       ],
//       soraview: document.getElementById('isSoraview').checked,
//       details: {
//         earthquake: {
//           intensity: document.getElementsByName('minint')[0].value,
//           magnitude: document.getElementsByName('minmag')[0].value,
//           depth: document.getElementsByName('depmin')[0].value
//         },
//         eew: {
//           intensity: document.getElementsByName('eewminint')[0].value,
//           unknown: document.getElementsByName('eewintunknown')[0].value,
//           magnitude: document.getElementsByName('eewminmag')[0].value,
//           depth: document.getElementsByName('eewdepmin')[0].value
//         }
//       },
//       clipboard: {
//         eew: document.getElementById("setClipEEW").checked,
//         quake: document.getElementById("setClipQuake").checked
//       },
//       interval: {
//         iedred7584EEW: document.getElementById("setIntervalIedred").valueAsNumber,
//         nhkQuake: elements.id.setIntervalNHKquake.valueAsNumber,
//         jmaDevFeed: elements.id.setIntervalJmaWt.valueAsNumber,
//         tenkiJPtsunami: document.getElementById("setIntervalTenkiJpTsu").valueAsNumber,
//         wniMScale: elements.id.setIntervalWNImscale.valueAsNumber,
//         wniSorabtn: elements.id.setIntervalWNIsorabtn.valueAsNumber,
//         wniRiver: elements.id.setIntervalWNIriver.valueAsNumber,
//         wniliveTimeTable: elements.id.setIntervalWNItm.valueAsNumber,
//         tepcoTeiden: elements.id.setIntervalTpcBlackOut.valueAsNumber
//       },
//       volume: {
//         eewL: document.getElementById("volEEWl").valueAsNumber,
//         eewH: document.getElementById("volEEWh").valueAsNumber,
//         gl: document.getElementById("volGL").valueAsNumber,
//         ntc: document.getElementById("volNtc").valueAsNumber,
//         spW: document.getElementById("volSpW").valueAsNumber,
//         tnm: document.getElementById("volTnm").valueAsNumber,
//         hvra: document.getElementById('volHvRa').valueAsNumber,
//         fldoc: document.getElementById('volFldOc').valueAsNumber
//       },
//       theme: {
//         color: document.getElementsByName("themeColors")[0].value
//       },
//       sendEEW: EEWsendingAllowed,
//       style: 0
//     },
//     app:{
//       lastVer: _appVersion,
//       newUser: false
//     }
//   }
//   chrome.storage.sync.set(data, function(){/* console.log("Data recorded.", data)*/});
// }
// var saveinttime = setInterval(savedata, 60000);

var summary = false;
var debugmode = false; // testNow

function bit(number, bitL){
  return number&(2**bitL)&&1;
}
function toRad(deg){
  return deg*(Math.PI/180);
}
function stringRepeat(times, string) {
  var resultText = "";
  for(var i=0; i<times; i++){
    resultText += string;
  }
  return resultText;
}

// define images object
const images = {
  eew: {},
  quake: {
    title: [[], [], []],
    texts: {
      maxInt: [],
      center: {},
      depth: {},
      ocTime: {},
      intensity: { "#ffffff":[], "#333333":[] }
    }
  },
  background: {},
  texture_cv: {
    // "Microsoft Sans Serif": {
    //   40: {
    //     style_bold: {base:"Microsoft-Sans-Serif",px:40,weight:"bold",color:"fff"}
    //   }
    // }
  },
  texture: {
    "AdobeGothicStd-Bold": {
      none: {
        46: {}
      }
    },
    "AdobeHeitiStd-Regular": {
      bold: {
        46: {}
      }
    },
    "Microsoft-Sans-Serif": {
      bold: {
        40: {}
      }
    },
    "HelveticaNeue-CondensedBold": {
      bold: {
        50: {}
      }
    }
  }
};

// system Sounds
var AreaForecastLocalM, JMAWarnTypeList, MapData1, TyphoonTranslate, multilingual, multilingual_pls, Japan_geojson;
const refreshLoadingState = (text, subtext) => {
  let data = canvasData.fun.canvasTexture(1080, 128, canvasData.context[1].ctx, (ct, text, subtext) => {
    ct.fillStyle = "#333";
    ct.fillRect(0, 0, 1080, 128);
    ct.fillStyle = "#fff";
    ct.font = "500 20px 'ヒラギノ角ゴシック', sans-serif";
    ct.fillText("The programs are starting...", 5, 22, 270);
    ct.fillText(subtext, 100, 105, 880);
    ct.font = "500 30px 'ヒラギノ角ゴシック', sans-serif";
    ct.fillText(text, 70, 75, 940);
  }, text, subtext);
  let buffers = webgl.fun.convertSquareData(0, [[0, 0, 1080, 128]], [[0, 0, 1, 1]]);
  webgl.textures.loadingInfo = data;
  webgl.buffers.loadingInfo = buffers;
  data = null;
  buffers = null;
};
const Sounds = {};
const loadAudios = src => {
  return new Promise(resolve => {
    let audio = new Audio();
    refreshLoadingState("音声ファイル読み込み中", src);
    audio.src = audio.srcData = src;
    audio.oncanplay = () => {
      resolve(audio);
    };
    audio.onerror = (e) => {
      throw new LoadError(e.path[0].srcData);
    };
    audio.preload = true;
  });
};
const fetchJSON = url => {
  return new Promise(resolve => {
    fetch(url).then(response => response.json()).then(json => resolve(json));
  });
};
const loadImages = src => {
  return new Promise(resolve => {
    let img = new Image();
    refreshLoadingState("画像を読み込み中...", src);
    img.src = img.srcData = src;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      throw new LoadError(e.path[0].srcData);
    };
  });
};
const loadTexture = (webgl, src) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    refreshLoadingState("テクスチャ読み込み中", src);
    img.src = src;
    img.onload = () => {
      webgl.fun.createTexture(webgl.gl, img);
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
};
Object.defineProperties(CanvasRenderingContext2D.prototype, {
  drawTextureText: {
    writable: false,
    value: function(text, x, y, option, maxWidth){
      let context = this;
      text = text + "";
      if(!option.color) option.color = context.fillStyle.slice(1);
      let target = images.texture[option.base][option.weight?option.weight:"none"][option.px];
      let letters = target.data.letters;
      let z = 0;
      let wholeWidth = 0;
      let ratio = 1;
      let letterSpacing = option.letterSpacing ?? 2;
      if(maxWidth) {
        for(let i=0,l=text.length; i<l; i++){
          wholeWidth += letters[text[i]].font.width + letterSpacing;
        }
        ratio = Math.min(1, maxWidth/(wholeWidth-letterSpacing));
      }
      for(let i=0,l=text.length; i<l; i++){
        let data = letters[text[i]];
        let img = target[option.color];
        let measure = data.font;
        let fx = data.position.x;
        let fy = data.position.y;
        // context.putImageData(
        //   img,
        //   x-measure.actualBoundingBoxLeft,
        //   y-measure.actualBoundingBoxAscent,
        //   Math.floor(fx-measure.actualBoundingBoxLeft),
        //   Math.floor(fy-measure.actualBoundingBoxAscent),
        //   Math.ceil(measure.width+1),
        //   Math.ceil(measure.actualBoundingBoxAscent+measure.actualBoundingBoxDescent+1)
        // );
        context.drawImage(
          img,
          fx-measure.actualBoundingBoxLeft,
          fy-measure.actualBoundingBoxAscent,
          Math.ceil(measure.width+1),
          Math.ceil(measure.actualBoundingBoxAscent+measure.actualBoundingBoxDescent+1),
          x-measure.actualBoundingBoxLeft+z*ratio,
          y-measure.actualBoundingBoxAscent,
          Math.ceil(measure.width+1)*ratio,
          Math.ceil(measure.actualBoundingBoxAscent+measure.actualBoundingBoxDescent+1)
        );
        z += measure.width + letterSpacing;
      }
    }
  },
  drawTextImage: {
    writable: false,
    value: Object.defineProperties({}, {
      EEW_epicenter: {
        writable: false,
        value: function (type, x, y, option){
          let context = this;
          if (!images.texture.EEW_epicenter_JP_350.hasOwnProperty("data")) return false;
          if (!images.texture.EEW_epicenter_JP_328.hasOwnProperty("data")) return false;
          switch (type) {
            case "JP_350":
            case "JP_328":
              if (!option.id) return;
              let data = images.texture["EEW_epicenter_" + type].data.datas;
              let image = images.texture["EEW_epicenter_" + type].image;
              let position = data[data.findIndex(item => item.id === option.id)].position;
              if (position === -1) return false;
              context.drawImage(image, position.x, position.y - 55, 352, 68, x, y, 352, 68);
              break;
          }
          return true;
        }
      },
      EEW_intensity: {
        writable: false,
        value: function (x, y, index){
          let context = this;
          context.drawImage(images.texture.EEW_intensity, 0, index*68, 100, 68, x, y, 100, 68);
        }
      }
    })
  }
});

// アニメーション
var earthquake_telop_times = 0;
var earthquake_telop_remaining = 1500;
const Animations = {
  cnv_anim1: new Variable_Animation(440, "sliding", {}), // cnv_anim1
  sorabtn: {
    view: new Variable_Animation(250, "sliding_3", {s:1081, e:1}), // anim_soraview
    color: new Variable_Animation(250, "linear", {s:0, e:255}), // anim_soraview_color
    open: new Variable_Animation(2100, "sliding", {s:0, e:210}) // anim_soraopen
  },
  startup_anim: new Variable_Animation(1200, "ease-out-cubic", {s:1080, e:0}),
  normal_mode_change: new Variable_Animation(1800, "ease-out-in-quart", {s:0, e:2, datas: {before: 0}}),
};

// デバッグしやすいようにObject
const Routines = {
  memory: {
    lastTime: "",
    syncTime: {
      ms: 0,
      interval_low: 1024,
      lastAdjustment: 0
    }
  },
  isDrawNormalTitle: true,
  subCanvasTime: function drawClock(targetTime){
    let timeString1=(" "+targetTime.getHours()+":"+("0" + targetTime.getMinutes()).slice(-2)).slice(-5);
    let timeString2=("0"+(targetTime.getFullYear()-2000)).slice(-2)+"-"+("0"+(targetTime.getMonth()+1)).slice(-2)+"-"+("0" + targetTime.getDate()).slice(-2);
    if(canvasData.images.clock_background) ct_time.drawImage(canvasData.images.clock_background, 0, 0);
    ct_time.fillStyle = ColorScheme[0][6][2];
    ct_time.font = "bold 50px '7barSP'";
    ct_time.fillText(timeString1, 10, 108, 108);
    ct_time.font = "bold 29px '7barSP'";
    ct_time.fillText(timeString2, 10, 63, 108);
  },
  md0title: function mode0titie(){
    ct.fillStyle = ColorScheme[userData.colorThemeMode][1][userData.mscale];
    ct.fillRect(0, 0, 1080, 60);
    ct.save();
    ct.beginPath();
    ct.rect(0, 0, 1080, 60);
    ct.clip();
    ct.fillStyle = ColorScheme[userData.colorThemeMode][1][userData.mscale];
    ct.fillRect(0, 0, 1080, 60);
    ct.font = "bold 28px 'Microsoft Sans Serif', JPAPGothic";
    switch (Dcnt){
      case 5:
        ct.fillStyle = mscale===1 ? ColorScheme[userData.colorThemeMode][4][0] : ColorScheme[userData.colorThemeMode][4][1];
        ct.fillText(DText[5 + (Nnum+4)%Dcnt], 895, 55, 185);
      case 4:
        ct.fillStyle = mscale===1 ? ColorScheme[userData.colorThemeMode][4][0] : ColorScheme[userData.colorThemeMode][4][1];
        ct.fillText(DText[5 + (Nnum+3)%Dcnt], 685, 55, 185);
      case 3:
        ct.fillStyle = mscale===1 ? ColorScheme[userData.colorThemeMode][4][0] : ColorScheme[userData.colorThemeMode][4][1];
        ct.fillText(DText[5 + (Nnum+2)%Dcnt], 475, 55, 185);
      case 2:
        ct.fillStyle = mscale===1 ? ColorScheme[userData.colorThemeMode][4][0] : ColorScheme[userData.colorThemeMode][4][1];
        ct.fillText(DText[5 + (Nnum+1)%Dcnt], 265, 55, 185);
        break;
    }
    ct.fillStyle = ColorScheme[userData.colorThemeMode][3][userData.mscale];
    ct.font = "bold 45px 'Microsoft Sans Serif', JPAPGothic";
    ct.fillText(DText[5+Nnum], 10, 47, 250);
    ct.restore();
  },
  md3title: function breakingNewsTitle(){
    ct.fillStyle = ColorScheme[userData.colorThemeMode][1][userData.mscale];
    ct.fillRect(0, 0, 1600, 60);
    ct.font = "bold 42px JPAPGothic, 'ヒラギノ角ゴ ProN', sans-serif";
    ct.fillStyle = ColorScheme[userData.colorThemeMode][5][3][userData.mscale];
    ct.fillText(userData.weather.articles[0].subText, 35, 45, 1600);
  },
  main: {
    root: function(){
      // Alpha情報を初期化
      webgl.gl.uniform1f(webgl.positions.uTextureAlpha, 1);
      let main = Routines.main;
      let lastAdjustData = Routines.memory.syncTime;
      let currentTime = Date.now() / 1000; // 基本的にUnixタイムスタンプで管理する
      main.currentTime();
      if(lastAdjustData.lastAdjustment + lastAdjustData.interval_low < currentTime) main.adjustTime(true);
      main.modes[userData.data.mode]();
      requestAnimationFrame(main.root);
    },
    currentTime: function(){
      let targetTime = new Date();
      targetTime.setMilliseconds(targetTime.getMilliseconds()+Routines.memory.syncTime.ms);
      let currentTimeDate = Math.floor(targetTime.getTime()/1000/60);
      if(currentTimeDate != Routines.memory.lastTime) Routines.subCanvasTime(targetTime);
    },
    adjustTime: function(ignore){
      return new Promise((resolve, reject) => {
        Routines.memory.syncTime.lastAdjustment = Date.now() / 1000;
        ContentBridge.syncTime().then((time)=>{
          Routines.memory.syncTime.ms = time.differenceMs;
          Routines.memory.syncTime.interval_low = time.pollIntervalMs + 5000;
          resolve(time.differenceMs);
        }).catch((e)=>{
          if(ignore) resolve(null); else reject(e);
        });
      });
    },
    modes: [
      function(){
        // init
        const $t7 = userData.data.normal;
        const $t1 = webgl.textures.normal.items;
        const $t2 = $t1.title.t;
        const $t3 = $t1.title.f;
        // 項目変更アニメーション
        Animations.normal_mode_change.type = "linear";
        const mode_change_current_linear = Animations.normal_mode_change.current; // type: linear
        Animations.normal_mode_change.type = "ease-out-in-quart";
        const mode_change_current_ease = Animations.normal_mode_change.current; // type: ease-out-in-quart
        const mode_change_sData = Animations.normal_mode_change.savedData;
        // let $t4 = $t1.text;
        const $t9 = mode_change_current_linear < 0.6 ? mode_change_sData.before : userData.data.normal.view;
        const $t5 = $t1.text[$t7.view];
        const $t8 = 12 - Math.abs(Math.min(Math.max(mode_change_current_linear, 0.57), 0.63) - 0.6) * 400;
        const $t8_1 = 63 - $t8;
        const $t8_2 = 115 - $t8;

        // プロトタイプなので、表示されるデータは固定（index 0)
        // テキスト基準のx座標を userData.config.config.ticker.scrollSpeed だけ減らす
        let xt = ($t7.xt -= userData.config.config.ticker.scrollSpeed);
        // テキストの表示が終わったら、色々リセットする
        // console.log("   xt: "+xt.toFixed(0).padStart(5)+"   $5.width: "+$t5.width.toFixed(0).padStart(5)+"   $t7.view: "+$t7.view.toFixed(0).padStart(5)+"   Animations.normal_mode_change.isEnd: "+Animations.normal_mode_change.isEnd);
        if(xt < -$t5.width) Routines.sub.change_normal_view_item();
        // 項目変更アニメーション中はxtを1081に固定
        if(!Animations.normal_mode_change.aIsEnd) xt = $t7.xt = 1081;
        // ティッカーに表示するテキストの座標を計算する
        const x1p = ($t7.x1 = -(((-xt % 1080)+1080) % 1080) );
        const x1i = Math.floor(xt / -1080);
        const x2p = ($t7.x2 = x1p + 1080);
        const x2i = x1i + 1;
        const x3p = x2p + 1080;
        // console.log("   xt: "+xt.toFixed(0).padStart(5)+"   x1p: "+x1p.toFixed(0).padStart(5)+"   x1i: "+x1i.toFixed(0).padStart(5)+"   x2p: "+x2p.toFixed(0).padStart(5)+"   x2i: "+x2i.toFixed(0).padStart(5)+"   x3p: "+x3p.toFixed(0).padStart(5));

        // WebGLのバッファデータ（オリジナル形式） (最後null代入してるからletで)
        let buffers = {v:[], f:[]};
        // 背景と起動時のアニメーションの分のバッファを作成 (0 ~ 23)
        const startup_anim_current = Animations.startup_anim.current;
        buffers.v.push([0, 0, 1080, 128], [0, 0, 1080, 128]);
        buffers.f.push([0, 0, 1, 1], [0, 0, 1, 1]);
        // タイトルのバッファを作成 (24 ~ 47)
        buffers.v.push([10, 0, 670, 60], [690, 0, 1030, 60]);
        buffers.f.push([0, 0, 1, 1], [0, 0, 1, 1]);
        // テキストのバッファを作成 (48 ~ 71)
        buffers.v.push([x1p, 60, x2p, 128], [x2p, 60, x3p, 128]);
        buffers.f.push([0, 0, 1, 1], [0, 0, 1, 1]);
        // 項目変更アニメーション時のバッファを作成 (72 ~ 119)
        buffers.v.push(
          [620, 63, 620 + $t1.num_limit.width, 115],
          [516, $t8_1, 547, $t8_2],
          [547, $t8_1, 578, $t8_2],
          [578, $t8_1, 609, $t8_2]
        );
        buffers.f.push([0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1]);
        // オーバーレイのバッファを作成 (120 ~ 131)
        buffers.v.push([0, 0, 1080, 128]);
        buffers.f.push([0, 0, 1, 1]);
        // バッファのデータを更新
        const bufferData = webgl.fun.convertSquareData(0, buffers.v, buffers.f);
        webgl.fun.registerBufferData(webgl.gl, bufferData[0].data.flat(), bufferData[1].data.flat(), bufferData[0].index);
        webgl.gl.clear(webgl.gl.DEPTH_BUFFER_BIT | webgl.gl.COLOR_BUFFER_BIT);
        // 背景を描画
        webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.textures.normal.background.b0_0);
        webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 0);
        // タイトルを描画
        webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, $t2[$t9*3].texture);
        webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 24);
        webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, $t3[($t9*3+3)%$t3.length].texture);
        webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 36);
        // テキストをティッカーに描画
        // 1つ目のテキストが存在する場合は描画
        if (0 <= x1i && $t5.list.length > x1i) {
          webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, $t5.list[x1i]);
          webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 48);
        }
        // 2つ目のテキストが存在する場合は描画
        if(0 <= x2i && $t5.list.length > x2i){
          webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, $t5.list[x2i]);
          webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 60);
        }
        // 項目変更アニメーション
        if(mode_change_current_linear !== 2){
          webgl.gl.uniform2f(webgl.positions.uPositionOffset, - mode_change_current_ease * 90, 0);
          webgl.gl.uniform1f(webgl.positions.uTextureAlpha, 1 - Math.abs(mode_change_current_ease - 1));
          webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, $t1.num_limit.texture);
          webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 72);
          const $v1 = $t9 + 1;
          const $v2 = $v1 % 10;
          const $v3 = Math.floor(($v1 % 100) / 10);
          const $v4 = Math.floor(($v1 % 1000) / 100);
          const $v5 = Math.floor(Math.log10($v1)) + 1;
          switch ($v5) {
            default:
              webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.textures.fonts.JPAPGothic_14[$v4]);
              webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 84);
            case 2:
              webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.textures.fonts.JPAPGothic_14[$v3]);
              webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 96);
            case 1:
              webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.textures.fonts.JPAPGothic_14[$v2]);
              webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 108);
          }
          webgl.gl.uniform2f(webgl.positions.uPositionOffset, 0, 0);
          webgl.gl.uniform1f(webgl.positions.uTextureAlpha, 1);
        }
        // オーバーレイを描画
        webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.textures.normal.overlay);
        webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 120);

        // スタートアップアニメーション
        if(startup_anim_current) {
          webgl.gl.enable(webgl.gl.SCISSOR_TEST);
          webgl.gl.scissor(0, 0, startup_anim_current, 128);
          webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.textures.loadingInfo);
          webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 12);
          webgl.gl.disable(webgl.gl.SCISSOR_TEST);
        }

        // context.fillText(DText[5+Nnum], 10, 47, 250);
        // context.fillText(DText[5 + (Nnum+1)%Dcnt], 265, 55, 185);
        buffers = null;
      }, // Normal
      function(){
        // WebGLのバッファデータ（オリジナル形式） (最後null代入してるからletで)
        let buffers = {v:[], f:[]};
        // EEW表示のバッファを作成 (0 ~ 11)
        buffers.v.push([0, 0, 1080, 128]);
        buffers.f.push([0, 0, 1, 1]);
        // バッファのデータを更新
        const bufferData = webgl.fun.convertSquareData(0, buffers.v, buffers.f);
        webgl.fun.registerBufferData(webgl.gl, bufferData[0].data.flat(), bufferData[1].data.flat(), bufferData[0].index);
        webgl.gl.clear(webgl.gl.DEPTH_BUFFER_BIT | webgl.gl.COLOR_BUFFER_BIT);
        // メインのテクスチャを描画
        webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.textures.eew.current.main);
        webgl.gl.drawElements(webgl.gl.TRIANGLES, 6, webgl.gl.UNSIGNED_SHORT, 0);
      }, // EEW
      function(){}, // Quake
      function(){}  // News
    ]
  },
  sub: {
    img_quake: function (maxint = 0, maxint_design = 0, magnitude = "0.0", depth = "000", epicenter = {ja:"震源", en:"Epicenter Name"}, ocTime = "00:00", theme = userData.colorThemeMode, mscale = userData.mscale){
      InitCanvas2D(1600, 60, (ct)=>{
        ct.fillStyle = ColorScheme[theme][1][mscale];
        ct.fillRect(0, 0, 1600, 60);

        ct.drawImage(images.quake.title[theme][mscale], 0, 0);
        ct.strokeStyle = "#ffffff";
        ct.beginPath();
        ct.moveTo(235,  0);
        ct.lineTo(265, 30);
        ct.lineTo(235, 60);
        ct.moveTo(460,  0);
        ct.lineTo(490, 30);
        ct.lineTo(460, 60);
        ct.moveTo(660,  0);
        ct.lineTo(690, 30);
        ct.lineTo(660, 60);
        ct.moveTo(1050,  0);
        ct.lineTo(1080, 30);
        ct.lineTo(1050, 60);
        ct.moveTo(1310,  0);
        ct.lineTo(1340, 30);
        ct.lineTo(1310, 60);
        ct.stroke();
        ct.fillStyle = "#f2f241";
        ct.fillRect(224, 2, 10, 56);

        ct.drawImage(images.quake.texts.maxInt[maxint_design].en[maxint], 300, 0);
        ct.drawImage(images.quake.texts.magni, 525, 0);
        ct.drawImage(images.quake.texts.center.en, 760, 0);
        if(depth!="") ct.drawImage(images.quake.texts.depth.en, 1125, 3);
        if(depth!="ごく浅い" && depth!="ごく浅く" && depth!="") ct.drawImage(images.quake.texts.depth_km, 1250, 25);
        ct.drawImage(images.quake.texts.ocTime.en, 1345, 3);
        ct.drawImage(images.quake.texts.jst, 1420, 29);
        ct.fillStyle = mscale==1 ? "#333333" : "#ffffff";
        ct.drawTextureText(magnitude, 555, 45, {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",letterSpacing:0});
        ct.drawTextureText(depth, 1185, 45, {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",letterSpacing:0}, 60);
        ct.font = "bold 30px Arial, JPAPGothic, sans-serif";
        ct.fillText(epicenter.en, 730, 53, 300);
        ct.font = "bold 50px '7barSP'";
        ct.fillText(ocTime, 1470, 50, 100);
      }).then((img) => { CanvasData.quake.en = img; });
      InitCanvas2D(1600, 60, (ct)=>{
        ct.fillStyle = ColorScheme[theme][1][mscale];
        ct.fillRect(0, 0, 1600, 60);

        ct.drawImage(images.quake.title[theme][mscale], 0, 0);
        ct.strokeStyle = "#ffffff";
        ct.beginPath();
        ct.moveTo(235,  0);
        ct.lineTo(265, 30);
        ct.lineTo(235, 60);
        ct.moveTo(460,  0);
        ct.lineTo(490, 30);
        ct.lineTo(460, 60);
        ct.moveTo(660,  0);
        ct.lineTo(690, 30);
        ct.lineTo(660, 60);
        ct.moveTo(1050,  0);
        ct.lineTo(1080, 30);
        ct.lineTo(1050, 60);
        ct.moveTo(1310,  0);
        ct.lineTo(1340, 30);
        ct.lineTo(1310, 60);
        ct.stroke();
        ct.fillStyle = "#f2f241";
        ct.fillRect(224, 2, 10, 56);

        ct.drawImage(images.quake.texts.maxInt[maxint_design].ja[maxint], 300, 0);
        ct.drawImage(images.quake.texts.magni, 525, 0);
        ct.drawImage(images.quake.texts.center.ja, 760, 0);
        if(depth!="") ct.drawImage(images.quake.texts.depth.ja, 1125, 3);
        if(depth!="ごく浅い" && depth!="ごく浅く" && depth!="") ct.drawImage(images.quake.texts.depth_km, 1250, 25);
        ct.drawImage(images.quake.texts.ocTime.ja, 1345, 3);
        ct.drawImage(images.quake.texts.jst, 1420, 29);
        ct.fillStyle = mscale==1 ? "#333" : "#fff";
        ct.drawTextureText(magnitude, 555, 45, {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",letterSpacing:0});
        ct.drawTextureText(depth, 1185, 45, {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",letterSpacing:0}, 60);
        ct.font = "bold 30px Arial, JPAPGothic, sans-serif";
        ct.fillText(epicenter.ja, 730, 53, 300);
        ct.font = "bold 50px '7barSP'";
        ct.fillText(ocTime, 1470, 50, 100);
      }).then((img) => { CanvasData.quake.ja = img; });
    },
    /**
     * 緊急地震速報のデータをもとに、テクスチャを新たに作成します。
     * @param {Array} eewData
     */
    create_texture_eew_main: function (...eewData) {
      /** @type {CanvasRenderingContext2D} */
      let ctx = canvasData.context[1].ctx;

      let eew_tex_c = webgl.textures.eew.current = {};
      let eew_img_c = canvasData.images.eew = {};
      eew_img_c.information = canvasData.fun.canvasTexture(905, 128, ctx,
        /**
         * eewDataから取得した値を使用して、Canvasを描画する
         * @param {Bool} is_alert 警報であるか
         * @param {Number} classcode 緊急地震速報のコード番号
         * @param {Bool} is_plum PLUM法であるか
         * @param {Bool} is_cancel 取り消し報であるか
         * @param {Number} maxint_id 最大震度のID
         * @param {Number} magitude マグニチュード
         * @param {Number} depth 深さ(km)
         * @param {Number} epicenter_id 震源地のID
         */
        (ct, datalist) => {
          // is_alert = false, classcode = 35, is_plum = false, is_cancel = false, maxint_id = 0, magitude = 0.1, depth = 790, epicenter_id = "999", latitude = 35, longitude = 135, forecast_data = []
          const {is_alert, classcode, is_plum, is_cancel, maxint_id, magnitude, depth, epicenter_id, latitude, longitude, warnAreas} = datalist;
          const eewTypeCode = is_plum ? "plum" : classcode == 35 ? "t35" : "def";
          let eewWarnText = "";
          let eewAboutHypocenter = "";
          if(eewIsAlert){
            eewWarnText = warnAreas.LocalAreas.join(" ");
            if(eewWarnText.length > 49){
              eewWarnText = warnAreas.District.join(" ");
            }
            eewAboutHypocenter = warnAreas.Hypocenter.Name;
          }

          ct.drawImage(images.eew[is_alert ? "pub" : "fc"][eewTypeCode], 0, 0, 1080, 128);
          ct.fillStyle = "#fff";
          if(eewTypeCode === "def"){
            ct.drawTextureText(depth+"km", 750, 123, {base:"Microsoft-Sans-Serif",px:40,weight:"bold",color:"ffffff",letterSpacing:1}, 100);
            ct.drawTextImage.EEW_intensity(50, 60, maxint_id);
            ct.font = "bold 58px 'Microsoft Sans Serif', JPAPGothic";
            ct.fillText((magnitude-0).toFixed(1), 205, 115, 100);
          } else if(eewTypeCode === "plum"){
            ct.drawTextImage.EEW_intensity(135, 60, maxint_id);
          } else {
            ct.font = "bold 55px 'ヒラギノ角ゴ ProN', JPAPGothic";
            ct.fillText("５弱程度以上", 50, 115, 235);
          }
          if(eewTypeCode === "plum") ct.drawTextImage.EEW_epicenter("JP_328", 366, 60, {id:epicenter_id}); else ct.drawTextImage.EEW_epicenter("JP_350", 344, 60, {id:epicenter_id});

          ct.fillStyle = "#777";
          ct.fillRect(900, 0, 5, 128);

          if(eewWarnText){
            ct.font = "bold 25px 'ヒラギノ角ゴ ProN', JPAexGothic, ArialMT, YuGo-Medium, sans-serif";
            ct.fillStyle = "yellow";
            ct.fillText(eewAboutHypocenter + "で地震。以下の地域では強い揺れに警戒。", 337, 26, 553);
            ct.fillStyle = "#fff";
            ct.fillText(eewWarnText, 337, 53, 553);
          } else {
            ct.fillStyle = "#ffea00";
            ct.font = "bold 25px Arial, 'Microsoft Sans Serif', 'ヒラギノ角ゴ ProN', JPAPGothic";
            ct.fillText(multilingual[0][Math.floor((startTime%(300*24))/300+33)].split("\r\n")[Math.floor((startTime%300)/(300/multilingual[0][Math.floor((startTime%(300*24))/300+33)].split("\r\n").length))], 337, 26, 553);
            ct.fillText(multilingual[1][Math.floor((startTime%(300*24))/300+33)].split("\r\n")[Math.floor((startTime%300)/(300/multilingual[1][Math.floor((startTime%(300*24))/300+33)].split("\r\n").length))], 337, 53, 553);
          }

          if(eewTypeCode === "def"){
            context.fillStyle = "#d00";
            context.strokeStyle = "#fff";
            context.lineWidth = 2;
            context.globalAlpha = 1 - (startTime % 60) / 78;
            context.beginPath();
            context.moveTo(eewEpiPos[0]- 6, eewEpiPos[1]-10);
            context.lineTo(eewEpiPos[0]-10, eewEpiPos[1]- 6);
            context.lineTo(eewEpiPos[0]- 4, eewEpiPos[1]   );
            context.lineTo(eewEpiPos[0]-10, eewEpiPos[1]+ 6);
            context.lineTo(eewEpiPos[0]- 6, eewEpiPos[1]+10);
            context.lineTo(eewEpiPos[0]   , eewEpiPos[1]+ 4);
            context.lineTo(eewEpiPos[0]+ 6, eewEpiPos[1]+10);
            context.lineTo(eewEpiPos[0]+10, eewEpiPos[1]+ 6);
            context.lineTo(eewEpiPos[0]+ 4, eewEpiPos[1]   );
            context.lineTo(eewEpiPos[0]+10, eewEpiPos[1]- 6);
            context.lineTo(eewEpiPos[0]+ 6, eewEpiPos[1]-10);
            context.lineTo(eewEpiPos[0]   , eewEpiPos[1]- 4);
            context.closePath();
            context.fill();
            context.stroke();
            context.lineWidth = 1;
            context.globalAlpha = 1;
          } else {
            context.fillStyle = "#d00";
            let t1 = (startTime % 60) / 60;
            let t2 = ((startTime + 15) % 60) / 60;
            let t3 = ((startTime + 30) % 60) / 60;
            let t4 = ((startTime + 45) % 60) / 60;
            context.globalAlpha = 0.5 - t1/2;
            context.beginPath();
            context.arc(eewEpiPos[0], eewEpiPos[1], t1*28.284271, 0, 2*Math.PI);
            context.fill();
            context.globalAlpha = 0.5 - t2/2;
            context.beginPath();
            context.arc(eewEpiPos[0], eewEpiPos[1], t2*28.284271, 0, 2*Math.PI);
            context.fill();
            context.globalAlpha = 0.5 - t3/2;
            context.beginPath();
            context.arc(eewEpiPos[0], eewEpiPos[1], t3*28.284271, 0, 2*Math.PI);
            context.fill();
            context.globalAlpha = 0.5 - t4/2;
            context.beginPath();
            context.arc(eewEpiPos[0], eewEpiPos[1], t4*28.284271, 0, 2*Math.PI);
            context.fill();
            context.globalAlpha = 1;
          }

          if(is_cancel) ct.drawImage(images.eew.cancel, 0, 0);

          ct.fillStyle = "#777";
          ct.fillRect(900, 0, 5, 128);

          //ct.fillText(multilingual[Math.floor((startTime%300)/150)][Math.floor((startTime%3000)/300+34)], 425, 50, 650);
          //ct.fillText("最大震度不明 M6.4 震源:あいうえおかきくけこ 深さ:590km (第89報)" ,10 ,115, 1060)
        },
      eewData);
      eew_img_c.map_navigation = canvasData.fun.canvasTexture(175, 128, ctx,
        /**
         * マップ作成
         * @param {Number} latitude 緯度
         * @param {Number} longitude 経度
         * @param {Array} warnAreas 強い揺れが予想される地域
         */
        (ct, data) => {
          let {longitude, latitude, warnAreas} = data;

          try {
            let areaCodes = [];
            for(let area of warnAreas){
              let code = AreaForecastLocalE[area.Intensity.Code + ""].parent;
              if(!areaCodes.includes(code)) areaCodes.push(code);
            }
            warnAreas = areaCodes;
          } catch (error) {
            warnAreas = [];
            console.error(error);
          }

          eewEpiPos = [87, 63]; // Initialize
          let lineWidth = 1;

          if(latitude<33) eewEpiPos[1] += (33-latitude)*3;
          if(latitude>45) eewEpiPos[1] += (45-latitude)*3;
          if(latitude>36){
            if(longitude<137) eewEpiPos[0] += (longitude-137)*3;
          } else {
            if(longitude<128) eewEpiPos[0] += (longitude-128)*3;
          }
          if(longitude>146) eewEpiPos[0] += (longitude-146)*3;
          let magnification = 1; // await window.connect2sandbox("quakemap_calc_magnification", { warn:warnAreas, lon:longitude, lat:latitude });
          lineWidth = 2.5/Math.max(magnification, 2.5);
          // console.log("magnification = "+magnification+"\n    lineWidth = "+lineWidth);

          magnification = (magnification < 1) ? 70 : 70 / magnification;
          context.fillStyle = "#89abd1";
          context.fillRect(905,0,175,128);
          context.strokeStyle = "#333";
          context.lineWidth = lineWidth;
          Japan_geojson.features.forEach(function(int){
            if(warnAreas.includes(int.properties.code)) context.fillStyle = "#fdab29"; else context.fillStyle = "#32a852";
            switch (int.geometry.type) {
              case "MultiPolygon":
                int.geometry.coordinates.forEach(function(points){
                  context.beginPath();
                  for (let i=0; i<points[0].length; i++) {
                    let point = points[0][i];
                    if(i === 0){
                      context.moveTo((point[0]-(longitude-eewEpiPos[0]/magnification))*magnification,(-point[1]+(latitude+eewEpiPos[1]/magnification))*magnification);
                    } else {
                      context.lineTo((point[0]-(longitude-eewEpiPos[0]/magnification))*magnification,(-point[1]+(latitude+eewEpiPos[1]/magnification))*magnification);
                    }
                  }
                  context.fill();
                  context.stroke();
                });
                break;
              case "Polygon":
                int.geometry.coordinates.forEach(function(points){
                  context.beginPath();
                  for (let i=0; i<points.length; i++) {
                    let point = points[i];
                    if(i === 0){
                      context.moveTo((point[0]-(longitude-eewEpiPos[0]/magnification))*magnification,(-point[1]+(latitude+eewEpiPos[1]/magnification))*magnification);
                    } else {
                      context.lineTo((point[0]-(longitude-eewEpiPos[0]/magnification))*magnification,(-point[1]+(latitude+eewEpiPos[1]/magnification))*magnification);
                    }
                  }
                  context.fill();
                  context.stroke();
                });
                break;
            }
          });
          context.lineWidth = 1;
          eewMapImage = context.getImageData(905, 0, 175, 128);

      }, eewData);
      eew_tex_c.main = canvasData.fun.canvasTexture(1080, 128, ctx, ct => {
        ct.clearRect(0, 0, 1080, 128);
        ct.putImageData(eew_img_c.information, 0, 0, 0, 0, 900, 128);
        ct.putImageData(eew_img_c.map_navigation, 905, 0, 0, 0, 175, 128);
      });
    },
    create_texture_eew_texts: function () {

    },
    create_texture_eew_maps: function () {

    },
    /**
     * 通常画面のテキストのテクスチャを作成します。
     */
    create_normal_texts: function (){
      /** @type {Array} */
      // console.log(userData.config.config);
      const textureItems = webgl.textures.normal.items;
      const textList = userData.config.config.ticker.normal.text;
      /** @type {CanvasRenderingContext2D} */
      const ctx = canvasData.context[1].ctx;
      /** @type {Number} */
      const colorThemeCode = userData.config.config.ticker.themeColor.ticker;

      textureItems.title.t = [];
      textureItems.title.f = [];
      textureItems.text = [];

      const $t4 = textureItems.text;
      for (let i1=0, l1=textList.length; i1<l1; i1++) {
        const $t3 = textList[i1];
        const $t5 = [];
        for (let i2=0; i2<3; i2++) {
          textureItems.title.t.push({ texture: canvasData.fun.canvasTexture(660, 60, ctx, (ct, text, textColor) => {
            ct.clearRect(0, 0, 660, 60);
            ct.font = "bold 45px 'Microsoft Sans Serif', JPAPGothic";
            ct.fillStyle = textColor;
            ct.fillText(text, 10, 50, 640);
          }, $t3.title, ColorScheme[colorThemeCode][3][i2]), size: [660, 60] });

          textureItems.title.f.push({ texture: canvasData.fun.canvasTexture(340, 60, ctx, (ct, text, textColor) => {
            ct.clearRect(0, 0, 340, 60);
            ct.font = "bold 28px 'Microsoft Sans Serif', JPAPGothic";
            ct.fillStyle = textColor;
            ct.fillText(text, 10, 50, 320);
          }, $t3.title, ColorScheme[colorThemeCode][4][i2 % 2]), size: [340, 60] });
        }

        ctx.font = "40px 'ヒラギノ角ゴ ProN', JPAexGothic, ArialMT, YuGo-Medium, sans-serif";
        const textSizeData = ctx.measureText($t3.text);
        const TextLeftPos = Math.ceil(textSizeData.actualBoundingBoxLeft);
        const textWidth = textSizeData.actualBoundingBoxRight + TextLeftPos;
        const textureCount = Math.ceil(textWidth / 1080);
        console.log(textSizeData, textureCount, $t3.text);
        for (let i=0; i<textureCount; i++) {
          $t5.push(canvasData.fun.canvasTexture(1080, 68, ctx, (ct, text, textColor, posX) => {
            ct.fillStyle = textColor;
            ct.font = "40px 'ヒラギノ角ゴ ProN', JPAexGothic, ArialMT, YuGo-Medium, sans-serif";
            ct.clearRect(0, 0, 1080, 68);
            ct.fillText(text, posX, 50);
          }, $t3.text, ColorScheme[colorThemeCode][5][1], TextLeftPos - i * 1080));
          // console.log("text_start["+text_start+"] - i["+i+"] * 1080 = "+(text_start - i * 1080));
        }
        // console.log("text_start : "+text_start);
        // console.log("text_width : "+text_width);
        // console.log("text_textureCount : "+text_textureCount);
        $t4.push({ start: TextLeftPos, width: textWidth, list: $t5 });
      }

      ctx.font = "50px JPAPMincho";
      let limit_width = Math.ceil(ctx.measureText(textList.length).width); // 半角空白: 11.6015625px, 半角スラッシュ: 20px
      textureItems.num_limit = {
        texture: canvasData.fun.canvasTexture(limit_width + 41, 52, ctx, (ct, text, textColor) => {
          ct.fillStyle = textColor;
          ct.font = "50px JPAPMincho";
          ct.fillText(text, 1, 51);
        }, "/ "+textList.length, "#333"),
        width: limit_width + 41
      };
    },
    change_normal_view_item: function (mode = userData.data.normal.view + 1) {
      Animations.normal_mode_change.savedData.before = userData.data.normal.view;
      userData.data.normal.view = mode = mode % webgl.textures.normal.items.text.length;
      Animations.normal_mode_change.start();
    }
  },
  animationBeforeMain: {
    count: 0,
    empty: ()=>{},
    start: function(){
      return new Promise((resolve, reject) => {
        let it = Routines.animationBeforeMain;
        it.resolve = resolve;
        it.reject = reject;
        it.constant.CLOCK_VIEW_FRAME = it.fun.cor.indexOf(6);
        it.constant.CLOCK_ANIM_FRAME = it.constant.CLOCK_VIEW_FRAME + 6;
        it.constant.ANIM_END_FRAME = it.fun.cor.length;
        it.main();
      });
    },
    main: function(){
      let it = Routines.animationBeforeMain;
      let count = it.count;
      (it.fun.frames[it.fun.cor[count]] ?? it.empty)(count);
      if(it.count < it.constant.ANIM_END_FRAME) requestAnimationFrame(it.main); else it.resolve();
      it.count++;
    },
    constant: {},
    fun: {
      cor: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        -1,
        2,
        -1,
        3,
        -1,
        4,
        -1,
        5,
        -1,
        6,
        -1,
        7,
        -1,
        8,
        -1,
        9,
        -1,
        10,
        -1,
        11,
        -1,
        12,
        -1,
        13,
        -1,
        14,
        -1,
        15,
        -1,
        16,
        -1,
        17,
        -1,
        18,
        -1,
        19,
        -1,
        20,
        -1,
        21,
        -1,
        22,
        -1,
        23,
        -1,
        24,
        -1,
        25,
        -1,
        26,
        -1,
        27,
        -1,
        28,
        -1,
        29,
        -1,
        30,
        -1,
        31,
        -1
      ], // 60fps
      frames: [
        () => {
          0;
          ct_time.fillStyle = ColorScheme[0][6][0];
          ct_time.fillRect(0, 0, 128, 128);
          ct.fillStyle = "#000";
          ct.fillRect(0, 0, 1600, 128);
        },
        () => {
          1;
          ct_time.fillStyle = ColorScheme[0][6][1];
          ct_time.font = "bold 25px 'Tahoma'";
          ct_time.fillText("Date", 5, 31);
          ct.fillStyle = ColorScheme[userData.colorThemeMode][5][0];
          ct.fillRect(0, 60, 1600, 68);
        },
        () => {
          2;
          ct.fillStyle = ColorScheme[userData.colorThemeMode][1][0];
          ct.fillRect(0, 0, 1600, 60);
        },
        () => {
          3;
          ct.font = "bold 42px JPAPGothic, 'ヒラギノ角ゴ ProN', sans-serif";
          ct.fillStyle = ColorScheme[userData.colorThemeMode][5][3][userData.mscale];
          ct.fillText("ニュース速報タイトル", 25, 45, 1550);
        },
        () => {
          4;
          ct.font = "31px JPAPGothic, 'ヒラギノ角ゴ ProN', sans-serif";
          ct.fillStyle = ColorScheme[userData.colorThemeMode][5][2];
          ct.fillText("ニュース速報サブタイトル", 37, 122, 1526);
        },
        () => {
          5;
          ct.fillStyle = ColorScheme[userData.colorThemeMode][5][2];
          ct.font = "23px JPAPGothic, 'ヒラギノ角ゴ ProN', sans-serif";
          ct.fillText("ニュース速報本文", 17, 88);
        },
        () => {
          6;
          ct_time.fillStyle = ColorScheme[0][6][3];
          ct_time.font = "bold 50px '7barSP'";
          ct_time.fillText("88:88", 10, 108, 108);
        },
        () => {
          7;
          ct.fillStyle = ColorScheme[userData.colorThemeMode][5][0];
          ct.fillRect(0, 60, 1600, 68);
        },
        () => {
          8;
          ct.fillStyle = ColorScheme[userData.colorThemeMode][1][0];
          ct.fillRect(0, 0, 1600, 60);
        },
        () => {
          9;
          ct.font = '40px "ヒラギノ角ゴ ProN", JPAexGothic, ArialMT, YuGo-Medium, sans-serif';
          ct.fillStyle = ColorScheme[userData.colorThemeMode][5][2];
          ct.fillText("地震情報テキスト　<各地の震度情報> <震度速報>", 52, 110);
        },
        () => {
          10;
          ct.drawImage(images.quake.title[1][0], 0, 0);
        },
        () => {
          11;
          ct_time.fillStyle = ColorScheme[0][6][3];
          ct_time.font = "bold 29px '7barSP'";
          ct_time.fillText("88-88-88", 10, 63, 108);

          ct.fillStyle = ColorScheme[userData.colorThemeMode][0][0];
          ct.fillRect(0, 60, 200, 68);
        },
        () => {
          12;
          ct.drawImage(images.quake.texts.maxInt[0].ja[0], 240, 0);
          ct.drawImage(images.quake.texts.center.ja, 536, 0);
          ct.drawImage(images.quake.texts.depth.ja, 817, 0);
          ct.drawImage(images.quake.texts.depth_km, 925, 25);
          ct.drawImage(images.quake.texts.ocTime.ja, 960, 0);
          ct.drawImage(images.quake.texts.magni, 406, 0);
        },
        () => {
          13;
          ct.fillStyle = "#fff";
          ct.drawTextureText("1.234678", 432, 45, {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",letterSpacing:0});
          ct.drawTextureText("590", 866, 45, {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",letterSpacing:0}, 60);
        },
        () => {
          14;
          ct.font = "bold 30px Arial, JPAPGothic, sans-serif";
          ct.fillText("震源", 526, 53, 300);
          ct.drawImage(images.quake.texts.intensity["#ffffff"][0], 10, 60);
        },
        () => {
          15;
          ct.fillStyle = "#2b4aad";
          ct.fillRect(0, 60, 900, 68);
        },
        () => {
          16;
          ct.fillStyle = "#233d91";
          ct.fillRect(0, 0, 900, 60);
        },
        () => {
          17;
          ct.drawImage(images.eew.fc, 0, 0, 320, 60);
        },
        () => {
          18;
          ct.fillStyle = "#000";
          ct.fillRect(320,4,10,54);
        },
        () => {
          19;
          ct.fillStyle = "#fff";
          ct.font = 'bold 28px "ヒラギノ角ゴ ProN", JPAexGothic, ArialMT, YuGo-Medium, sans-serif';
          ct.fillText("最大", 3, 88, 45);
          ct.fillText("震度", 3, 121, 45);
        },
        () => {
          20;
          ct.fillText("震", 318, 90, 23);
          ct.fillText("源", 318, 119, 23);
        },
        () => {
          21;
          ct.fillText("深さ", 725, 88, 45);
          ct.font = "bold 40px 'Microsoft Sans Serif', JPAPGothic";
          ct.fillText("M", 170, 118, 35);
        },
        () => {
          22;
          ct.drawTextureText("650km", 750, 123, {base:"Microsoft-Sans-Serif",px:40,weight:"bold",color:"ffffff",letterSpacing:1}, 100);
          ct.font = "bold 55px 'Microsoft Sans Serif', 'ヒラギノ角ゴ ProN', JPAPGothic";
          ct.fillText("1", 50, 115, 95);
        },
        () => {
          23;
          ct.font = 'bold 55px "ヒラギノ角ゴ ProN", JPAexGothic, ArialMT, YuGo-Medium, sans-serif';
          ct.fillText("どこか", 344, 115, 350);
          ct.font = "bold 58px 'Microsoft Sans Serif', JPAPGothic";
          ct.fillText("2.0", 205, 115, 100);
        },
        () => {
          24;
          ct.fillStyle = "#777";
          ct.fillRect(900, 0, 5, 128);
        },
        () => {
          25;
          ct.fillStyle = ColorScheme[userData.colorThemeMode][5][0];
          ct.fillRect(0, 60, 1600, 68);
        },
        () => {
          26;
          ct.fillStyle = ColorScheme[userData.colorThemeMode][1][userData.mscale];
          ct.fillRect(0, 0, 1600, 60);
        },
        () => {
          27;
          ct.fillStyle = "#d1d90099";
          ct.beginPath();
          ct.moveTo( 0, 127);
          ct.lineTo(30,  94);
          ct.lineTo( 0,  60);
          ct.fill();
        },
        () => {
          28;
          ct.strokeStyle = "#fff";
          ct.beginPath();
          ct.moveTo( 0, 123);
          ct.lineTo(26,  94);
          ct.lineTo( 0,  64);
          ct.stroke();
        },
        () => {
          29;
          ct.beginPath();
          ct.moveTo(0,  64);
          ct.lineTo(4,  64);
          ct.stroke();
          ct.beginPath();
          ct.moveTo(0, 123);
          ct.lineTo(4, 123);
          ct.stroke();
        },
        () => {
          30;
          ct.fillStyle = "#ff3d3d99";
          ct.beginPath();
          ct.moveTo(1600, 127);
          ct.lineTo(1570,  94);
          ct.lineTo(1600,  60);
          ct.fill();
        },
        () => {
          31;
          ct.strokeStyle = "#fff";
          ct.beginPath();
          ct.moveTo(1600, 123);
          ct.lineTo(1576,  94);
          ct.lineTo(1600,  64);
          ct.stroke();
          ct.beginPath();
          ct.moveTo(1600,  64);
          ct.lineTo(1596,  64);
          ct.stroke();
          ct.beginPath();
          ct.moveTo(1600, 123);
          ct.lineTo(1596, 123);
          ct.stroke();
        }
      ],
      helper: {}
    }
  }
};
Routines.animationBeforeMain.count = 0;

// ここまで文字を表示してはいけない
webglInitialize().then(async webgl => {
    window.webgl = webgl;
    refreshLoadingState("フォントを準備中", "");
    return await loadAllWebFonts();
  })
  .then(async () => {
    refreshLoadingState("データ取得中", "../../data/AreaForecastLocalM.json");
    return fetchJSON("../../data/AreaForecastLocalM.json");
  })
  .then(async json => {
    AreaForecastLocalM = json;
    refreshLoadingState("データ取得中", "../../data/JMAWarnTypeList.json");
    return fetchJSON("../../data/JMAWarnTypeList.json");
  })
  .then(async json => {
    JMAWarnTypeList = json;
    refreshLoadingState("データ取得中", "../../data/MapData1.json");
    return fetchJSON("../../data/MapData1.json");
  })
  .then(async json => {
    MapData1 = json;
    refreshLoadingState("データ取得中", "../../data/TyphoonTranslate.json");
    return fetchJSON("../../data/TyphoonTranslate.json");
  })
  .then(async json => {
    TyphoonTranslate = json;
    refreshLoadingState("データ取得中", "../../data/jma-multilingual.json");
    return fetchJSON("../../data/jma-multilingual.json");
  })
  .then(async json => {
    multilingual = json;
    refreshLoadingState("データ取得中", "../../data/tsunami-multilingual.json");
    return fetchJSON("../../data/tsunami-multilingual.json");
  })
  .then(async json => {
    multilingual_pls = json;
    refreshLoadingState("データ取得中", "../../data/japan.geojson");
    return fetchJSON("../../data/japan.geojson");
  })
  .then(async json => {
    Japan_geojson = json;
    refreshLoadingState("データ取得中", "../../data/stations_20210309.min.json");
    return fetchJSON("../../data/stations_20210309.min.json");
  })
  .then(async json => {
    allcitydata = json;
    for(i = 0; i < allcitydata.items.quake.length; i++){
      allcity.push(allcitydata.items.quake[i].city.name);
      allprefecture.push(allcitydata.items.quake[i].prefecture.name);
      allcitykana.push(allcitydata.items.quake[i].city.kana);
    }

    // 画像ファイル読み込み
    images.eew.fc = {
      def: await loadImages("./images/background/eew_fcst_bg_a.png"),
      t35: await loadImages("./images/background/eew_fcst_bg_b.png"),
      plum: await loadImages("./images/background/eew_fcst_bg_c.png")
    };
    images.eew.pub = {
      def: await loadImages("./images/background/eew_warn_bg_a.png"),
      t35: await loadImages("./images/background/eew_warn_bg_b.png"),
      plum: await loadImages("./images/background/eew_warn_bg_c.png")
    };
    images.eew.cancel = await loadImages("./images/eew_cancelled.png");
    for (let i=0; i<3; i++) for (let j=0; j<3; j++) images.quake.title[i][j] = await loadImages("./images/theme"+i+"quakeTop"+j+".png");
    for (let i=0; i<3; i++) {
      images.quake.texts.maxInt.push({ ja:[], en:[] });
      for (let j=0; j<9; j++) {
        images.quake.texts.maxInt[i].ja[j] = await loadImages(`./images/maxint/mscale${i}/ja/${j}.png`);
        images.quake.texts.maxInt[i].en[j] = await loadImages(`./images/maxint/mscale${i}/en/${j}.png`);
      }
    }
    images.quake.texts.magni = await loadImages("./images/magnitude.png");
    images.quake.texts.center.ja = await loadImages("./images/epicenter-ja.png");
    images.quake.texts.center.en = await loadImages("./images/epicenter-en.png");
    images.quake.texts.depth.ja = await loadImages("./images/depth-ja.png");
    images.quake.texts.depth.en = await loadImages("./images/depth-en.png");
    images.quake.texts.depth_km = await loadImages("./images/depth-km.png");
    images.quake.texts.ocTime.ja = await loadImages("./images/octime-ja.png");
    images.quake.texts.ocTime.en = await loadImages("./images/octime-en.png");
    images.quake.texts.jst = await loadImages("./images/quake-jst.png");
    // Mスケールが2の時に使用する
    images.quake.texts.magni2 = await loadImages("./images/M2-magnitude.png");
    images.quake.texts.center.ja2 = await loadImages("./images/M2-epicenter-ja.png");
    images.quake.texts.center.en2 = await loadImages("./images/M2-epicenter-en.png");
    images.quake.texts.depth.ja2 = await loadImages("./images/M2-depth-ja.png");
    images.quake.texts.depth.en2 = await loadImages("./images/M2-depth-en.png");
    images.quake.texts.depth_km2 = await loadImages("./images/M2-depth-km.png");
    images.quake.texts.ocTime.ja2 = await loadImages("./images/M2-octime-ja.png");
    images.quake.texts.ocTime.en2 = await loadImages("./images/M2-octime-en.png");
    images.quake.texts.jst2 = await loadImages("./images/M2-quake-jst.png");
    images.fullview = await loadImages("./images/fullview-message.png");
    for (let i=0; i<11; i++) {
      let zero = images.quake.texts.intensity["#ffffff"];
      let one = images.quake.texts.intensity["#333333"];
      zero[i] = await loadImages("./images/intensity/ffffff/"+i+".png");
      one[i] = await loadImages("./images/intensity/333333/"+i+".png");
    }
    images.background.default_0_0 = await loadImages("./images/background/0_default_0.png");
    images.background.default_0_1 = await loadImages("./images/background/0_default_1.png");
    images.background.default_0_2 = await loadImages("./images/background/0_default_2.png");
    images.background.default_1_0 = await loadImages("./images/background/1_default_0.png");
    images.background.default_1_1 = await loadImages("./images/background/1_default_1.png");
    images.background.default_1_2 = await loadImages("./images/background/1_default_2.png");
    images.background.eew_fcst = await loadImages("./images/background/eew_fcst.png");
    images.background.eew_warn = await loadImages("./images/background/eew_warn.png");

    await new Promise(async (resolve, reject) => {
      let textures = [
        {base:"AdobeGothicStd-Bold",px:46,weight:"",color:"000000"},
        {base:"AdobeHeitiStd-Regular",px:46,weight:"bold",color:"000000"},
        {base:"Microsoft-Sans-Serif",px:40,weight:"bold",color:"ffffff"},
        {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",color:"333333"},
        {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",color:"ffffff"}
      ];
      for (let s of textures){
        console.info(`images.texture["${s.base}"]["${s.weight?s.weight:"none"}"][${s.px}]`);
        let target = images.texture[s.base][s.weight?s.weight:"none"][s.px];
        let baseurl = "./images/texts/"+s.base+"_"+s.px+"px"+(s.weight?"_"+s.weight:"");
        if(!target.data){
          target.data = {};
          await new Promise(resolve => {
            refreshLoadingState("画像データ取得中", baseurl+".json");
            let xhr = new XMLHttpRequest();
            xhr.original = s;
            xhr.addEventListener("load", function(){
              console.log("Loaded: "+this.responseURL);
              let json = JSON.parse(this.response);
              let output = {};
              let texts = json.text;
              output.letters = {};
              for(let i=0, l=texts.length; i<l; i++){
                output.letters[texts[i]] = json.datas[i];
              }
              target.data = output;
              if(!images.texture_cv.hasOwnProperty(json.name)) images.texture_cv[json.name] = {};
              if(!images.texture_cv[json.name].hasOwnProperty(json.size)) images.texture_cv[json.name][json.size] = {};
              images.texture_cv[json.name][json.size]["style"+(json.bold?"_bold":"")+(json.italic?"_italic":"")] = this.original;
              resolve();
            });
            xhr.open("GET", baseurl+".json");
            xhr.send();
          });
        }
        target[s.color] = await loadImages(baseurl+"_"+s.color+".png");
      }
      resolve();
    });

    // 音声ファイル読み込み
    Sounds.start = await loadAudios("./sound/main_started.mp3");
    Sounds.quake = {
      main: await loadAudios("./sound/quake-EI.mp3"),
      warning: await loadAudios("./sound/quake-EI.m4a")
    };
    Sounds.warning = {
      Notice: await loadAudios("./sound/Notice.mp3"),
      GroundLoosening: await loadAudios("./sound/ground_loosening.mp3"),
      Emergency: await loadAudios("./sound/special_emergency_warning.mp3"),
      HeavyRain: loadAudios("./sound/heavy-rain.mp3"),
      Flood: await loadAudios("./sound/flood-occurred.mp3")
    };
    Sounds.tsunami = {
      Notice: await loadAudios("./sound/TW.mp3"),
      Watch: await loadAudios("./sound/TW.mp3"),
      Warning: await loadAudios("./sound/TW.mp3"),
      Majorwarning: await loadAudios("./sound/TW.mp3")
    };
    Sounds.eew = {
      first: await loadAudios("./sound/EEW_First.mp3"),
      continue: await loadAudios("./sound/EEW_Continue.mp3"),
      last: await loadAudios("./sound/EEW_End.mp3")
    };

    refreshLoadingState("NTP時刻調整中...", "");
    try {
      await Routines.main.adjustTime();
    } catch(e) {
      refreshLoadingState("時刻調整に失敗しました", e.message);
      await sleep(4500);
    }
    // await loadAudios("./sound/null.audio"); // Generate exception on purpose! (for debug)

    refreshLoadingState("", "Creating Textures...");
    canvasData.images.clock_background = await canvasData.fun.ctxToImage(128, 128, canvasData.context[1].ctx, (ct) => {
      ct.fillStyle = ColorScheme[0][6][0];
      ct.fillRect(0, 0, 128, 128);
      ct.fillStyle = ColorScheme[0][6][1];
      ct.font = "bold 25px 'Tahoma'";
      ct.fillText("Date", 5, 31);
      ct.fillStyle = ColorScheme[0][6][3];
      ct.font = "bold 50px '7barSP'";
      ct.fillText("88:88", 10, 108, 108);
      ct.font = "bold 29px '7barSP'";
      ct.fillText("88-88-88", 10, 63, 108);
    });
    // webgl.textures.default_0_0 = webgl.fun.createTexture(webgl.gl, images.background.default_0_0);
    // webgl.textures.default_0_1 = webgl.fun.createTexture(webgl.gl, images.background.default_0_1);
    // webgl.textures.default_0_2 = webgl.fun.createTexture(webgl.gl, images.background.default_0_2);
    // webgl.textures.default_1_0 = webgl.fun.createTexture(webgl.gl, images.background.default_1_0);
    // webgl.textures.default_1_1 = webgl.fun.createTexture(webgl.gl, images.background.default_1_1);
    // webgl.textures.default_1_2 = webgl.fun.createTexture(webgl.gl, images.background.default_1_2);

    webgl.textures.normal = {};
    const textureNormal = webgl.textures.normal;
    textureNormal.items = { title: { t: [], f: [] }, text: [] };
    textureNormal.background = {
      b0_0: webgl.fun.createTexture(webgl.gl, images.background.default_0_0),
      b0_1: webgl.fun.createTexture(webgl.gl, images.background.default_0_1),
      b0_2: webgl.fun.createTexture(webgl.gl, images.background.default_0_2),
      b1_0: webgl.fun.createTexture(webgl.gl, images.background.default_1_0),
      b1_1: webgl.fun.createTexture(webgl.gl, images.background.default_1_1),
      b1_2: webgl.fun.createTexture(webgl.gl, images.background.default_1_2),
    };
    webgl.textures.eew = {};
    // let $t2 = webgl.textures.eew;
    const eew_tex_c = webgl.textures.eew.current = {};
    const eew_img_c = canvasData.images.eew = {};
    eew_img_c.information = canvasData.fun.canvasImageData(905, 128, canvasData.context[1].ctx, ct => {
      ct.save();
      ct.fillStyle = "#333";
      ct.fillRect(0, 0, 900, 128);
      ct.fillStyle = "#777";
      ct.fillRect(900, 0, 5, 128);
      ct.fillStyle = "#999";
      ct.font = "italic 50px sans-serif";
      ct.textAlign = "center";
      ct.textBaseline = "middle";
      ct.fillText("まだ情報がありません！", 453, 64);
      ct.restore();
    });
    eew_img_c.map_navigation = canvasData.fun.canvasImageData(175, 128, canvasData.context[1].ctx, ct => {
      ct.save();
      ct.fillStyle = "#333";
      ct.fillRect(0, 0, 175, 128);
      ct.fillStyle = "#999";
      ct.font = "italic 50px sans-serif";
      ct.textAlign = "center";
      ct.textBaseline = "middle";
      ct.fillText("(地図)", 87, 64, 160);
      ct.restore();
    });
    eew_tex_c.main = canvasData.fun.canvasTexture(1080, 128, canvasData.context[1].ctx, ct => {
      ct.clearRect(0, 0, 1080, 128);
      ct.putImageData(eew_img_c.information, 0, 0, 0, 0, 900, 128);
      ct.putImageData(eew_img_c.map_navigation, 905, 0, 0, 0, 175, 128);
    });
    webgl.textures.eew_fcst = webgl.fun.createTexture(webgl.gl, images.background.eew_fcst);
    webgl.textures.eew_warn = webgl.fun.createTexture(webgl.gl, images.background.eew_warn);
    webgl.buffers.preset_0_0_1080_128 = webgl.fun.convertSquareData(0, [[0, 0, 1080, 128]], [[0, 0, 1, 1]]);

    refreshLoadingState("", "Creating Textures from woff2 files..."); // ビジー状態のため通常表示されないが、エラーが発生した場合に表示される
    webgl.textures.fonts = { JPAPGothic_14: {} };
    webgl.textures.fonts.JPAPGothic_14 = canvasData.fun.fontToTextures(canvasData.context[1].ctx, "50px JPAPMincho", "#333", "0123456789".split(""), 31, 52);

    webgl.textures.normal.overlay = canvasData.fun.canvasTexture(1080, 128, canvasData.context[1].ctx, (ct) => {
      ct.clearRect(0, 0, 1080, 128);
      //三角 左
      ct.fillStyle = "#d1d90099";
      ct.beginPath();
      ct.moveTo( 0, 127);
      ct.lineTo(30,  94);
      ct.lineTo( 0,  60);
      ct.fill();
      //三角 右
      ct.fillStyle = "#ff3d3d99";
      ct.beginPath();
      ct.moveTo(1080, 127);
      ct.lineTo(1050,  94);
      ct.lineTo(1080,  60);
      ct.fill();
      ct.strokeStyle = "#fff";
      ct.beginPath();
      ct.moveTo( 0, 123);
      ct.lineTo(26,  94);
      ct.lineTo( 0,  64);
      ct.moveTo(0,  64);
      ct.lineTo(4,  64);
      ct.moveTo(0, 123);
      ct.lineTo(4, 123);
      ct.moveTo(1080, 123);
      ct.lineTo(1054,  94);
      ct.lineTo(1080,  64);
      ct.moveTo(1080,  64);
      ct.lineTo(1076,  64);
      ct.moveTo(1080, 123);
      ct.lineTo(1076, 123);
      ct.stroke();
    });

    refreshLoadingState("", "Initializing...");
    userData = await mod_userData.initUserData();
    Routines.sub.create_normal_texts();

    // Routines.sub.img_quake();
    // refreshLoadingState("", "Initializing...");

    await ContentBridge.allowClosing();
    refreshLoadingState("準備が完了しました", "");
    await sleep(1000);

    // let buffers = webgl.fun.convertSquareData(0, [[0, 0, 1080, 128], [0, 0, 120, 128]], [[0, 0, 1, 1], [0, 0, 120 / 1080, 1]]);
    // webgl.fun.registerBufferData(webgl.gl, buffers[0].data.flat(), buffers[1].data.flat(), buffers[0].index);

    screenWhileStarting.preparing = false;
    // await Routines.animationBeforeMain.start();
    Animations.startup_anim.start();
    requestAnimationFrame(Routines.main.root);
  });

// document.querySelector("button").addEventListener("click", ()=>{
//   ContentBridge.saveStatus(value);
// });

/*

ct.fillStyle = ColorScheme[1][1][0];
ct.fillRect(0, 0, 1600, 60);
ct.fillStyle = ColorScheme[1][5][0];
ct.fillRect(0, 60, 1600, 68);

ct.drawImage(images.quake.title[1][0], 0, 0);
ct.strokeStyle = "#ffffff";
ct.beginPath();
ct.moveTo(235,  0);
ct.lineTo(265, 30);
ct.lineTo(235, 60);
ct.moveTo(460,  0);
ct.lineTo(490, 30);
ct.lineTo(460, 60);
ct.moveTo(660,  0);
ct.lineTo(690, 30);
ct.lineTo(660, 60);
ct.moveTo(1050,  0);
ct.lineTo(1080, 30);
ct.lineTo(1050, 60);
ct.moveTo(1310,  0);
ct.lineTo(1340, 30);
ct.lineTo(1310, 60);
ct.stroke();
ct.fillStyle = "#f2f241";
ct.fillRect(224, 2, 10, 56);

ct.drawImage(images.quake.texts.maxInt[0].en[7], 300, 0);
ct.drawImage(images.quake.texts.magni, 525, 0);
ct.drawImage(images.quake.texts.center.ja, 760, 0);
ct.drawImage(images.quake.texts.depth.ja, 1125, 3);
ct.drawImage(images.quake.texts.depth_km, 1250, 25);
ct.drawImage(images.quake.texts.ocTime.ja, 1355, 3);
ct.drawImage(images.quake.texts.jst, 1420, 29);
ct.fillStyle = "#fff";
ct.drawTextureText("6.2", 555, 45, {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",letterSpacing:0});
ct.drawTextureText("590", 1185, 45, {base:"HelveticaNeue-CondensedBold",px:50,weight:"bold",letterSpacing:0}, 60);
ct.font = "bold 30px Arial, JPAPGothic, sans-serif";
ct.fillText("ああああああああああ", 730, 53, 300);
ct.font = "bold 50px '7barSP'";
ct.fillText("21:47", 1470, 50, 100);

ct.font = '40px "ヒラギノ角ゴ ProN", JPAexGothic, ArialMT, YuGo-Medium, sans-serif';
ct.fillStyle = ColorScheme[1][5][2];
ct.fillText("地震情報テキスト　<各地の震度情報> <震度速報>", 52, 110);
ct.fillStyle = ColorScheme[1][0][0];
ct.fillRect(0, 60, 200, 68);
ct.fillStyle = ColorScheme[1][0][0]+"99";
ct.beginPath();
ct.moveTo(200, 127);
ct.lineTo(230,  94);
ct.lineTo(200,  60);
ct.closePath();
ct.fill();
ct.strokeStyle = "#ffffff";
ct.beginPath();
ct.moveTo(  4, 123);
ct.lineTo(200, 123);
ct.lineTo(226,  94);
ct.lineTo(200,  64);
ct.lineTo(  4,  64);
ct.stroke();
ct.drawImage(images.quake.texts.intensity["#ffffff"][0], 10, 60);


*/

