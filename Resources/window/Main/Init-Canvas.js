{
  const context = [];
  // 時計
  context[0] = {};
  context[0].canvas = document.getElementById("timer");
  context[0].ctx = context[0].canvas.getContext('2d');
  // 文字系
  context[1] = {};
  context[1].canvas = document.createElement("canvas");
  context[1].ctx = context[1].canvas.getContext('2d');

  /**
   * グローバル変数にwebglが必要
   * @param {Number} width 幅
   * @param {Number} height 高さ
   * @param {CanvasRenderingContext2D} context CanvasRenderingContext2D
   * @param {Function} init 引数: WebGLRenderingContext
   * @param {HTMLImageElement} [imgElement] 任意
   * @param {any} [params] 任意パラメーター
   * @returns {Promise} Promise
   */
  const ctxToTexture = function (width, height, context, init, imgElement = document.createElement("img"), ...params){
    return new Promise(resolve => {
      const canvas = context.canvas;
      const webgl = window.webgl;
      canvas.width = width;
      canvas.height = height;
      init(context, ...params);
      canvas.toBlob(blob => {
        let img = imgElement;
        img.onload = () => {
          const texture = webgl.fun.createTexture(webgl.gl, img);
          resolve({ img, texture });
        };
        img.src = URL.createObjectURL(blob);
      }, "image/png");
    });
  };

  /**
   * 非同期じゃないので注意！　グローバル変数にwebglが必要
   * @param {Number} width 幅
   * @param {Number} height 高さ
   * @param {CanvasRenderingContext2D} context CanvasRenderingContext2D
   * @param {Function} init 引数: WebGLRenderingContext
   * @param {any} [params] 任意パラメーター
   * @returns {Promise} Promise
   */
  const canvasTexture = function (width, height, context, init, ...params){
    const canvas = context.canvas;
    const webgl = window.webgl;
    canvas.width = width;
    canvas.height = height;
    init(context, ...params);
    return webgl.fun.createTexture(webgl.gl, context.getImageData(0, 0, width, height));
  };

  /**
   * 非同期じゃないので注意！　グローバル変数にwebglが必要
   * @param {Number} width 幅
   * @param {Number} height 高さ
   * @param {CanvasRenderingContext2D} context CanvasRenderingContext2D
   * @param {Function} init 引数: WebGLRenderingContext
   * @param {any} [params] 任意パラメーター
   * @returns {Promise} Promise
   */
  const canvasImageData = function (width, height, context, init, ...params){
    const canvas = context.canvas;
    canvas.width = width;
    canvas.height = height;
    init(context, ...params);
    return context.getImageData(0, 0, width, height);
  };

  /**
   * グローバル変数にwebglが必要
   * @param {Number} width 幅
   * @param {Number} height 高さ
   * @param {CanvasRenderingContext2D} context CanvasRenderingContext2D
   * @param {Function} init 引数: WebGLRenderingContext
   * @returns {Promise} Promise
   */
  const ctxToImage = function (width, height, context, init){
    return new Promise(resolve => {
      const canvas = context.canvas;
      const webgl = window.webgl;
      canvas.width = width;
      canvas.height = height;
      init(context);
      canvas.toBlob(blob => {
        let img = document.createElement("img");
        img.onload = () => {
          resolve(img);
        };
        img.src = URL.createObjectURL(blob);
      }, "image/png");
    });
  };

  const fontToTextures = function (ct, font, color, characters, width, height) {
    const textures = {};
    ct.save();
    for (const chara of characters) {
      textures[chara] = canvasTexture(width, height, ct, (ct, chara, width, height, font, color) => {
        ct.font = font;
        ct.fillStyle = color;
        ct.textAlign = "center";
        ct.clearRect(0, 0, width, height);
        ct.fillText(chara, width/2, height-1);
        console.log(chara, width, height, font, color);
      }, chara, width, height, font, color);
    }
    ct.restore();
    return textures;
  }

  window.canvasData = { context, fun: { ctxToTexture, ctxToImage, canvasTexture, canvasImageData, fontToTextures }, images: {} };
  window.ct_time = context[0].ctx;
}

/*

// main canvas
const canvas1 = document.createElement("canvas");
const context = canvas1.getContext('2d');
// clock canvas
const clock = document.getElementById('sub1');
const time = canvas2.getContext('2d');
// 気象速報サブタイトル
const canvas3 = document.createElement("canvas");
const ctx3 = canvas3.getContext('2d');
// // 左側三角
// const canvas4 = document.createElement("canvas");
// canvas4.width = "230px";
// canvas4.height = "68px";
// const ctx4 = canvas3.getContext('2d');
// // 右側三角その他
// const canvas5 = document.createElement("canvas");
// canvas5.width = "30px";
// canvas5.height = "68px";
// const ctx5 = canvas3.getContext('2d');
// // メインテキスト仮保存
// const canvas6 = document.createElement("canvas");
// canvas6.width = "2160px";
// canvas6.height = "68px";
// const ctx6 = canvas3.getContext('2d');

*/
