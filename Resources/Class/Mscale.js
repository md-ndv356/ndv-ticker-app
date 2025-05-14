// Mスケールを管理する
const http_request = require("../Modules/http_request");
const handleIntervalFunction = require("../Modules/handle_interval_function");
module.exports = class {
  constructor (){
    http_request.create("wni-mscale", "https://weathernews.jp/mscale/json/scale.json", {
      method: "GET",
      responseType: "json",
      handlename: "Mスケール取得先"
    });
    this.load();
  }
  #eventhandler = {
    change: ()=>{}
  };
  #mscale = 1;

  /**
   * Mスケール情報を保存します
   * @param {Number} mscale - 1, 2 or 3
   */
  set scale (mscale){
    this.#mscale = mscale - 0;
  }
  /**
   * Mスケール情報を取得します。
   * @returns {Number} - 1, 2 or 3
   */
  get scale (){
    return this.#mscale;
  }
  set interval (ms){
    if (handleIntervalFunction.isRegisted("wni-mscale")){
      handleIntervalFunction.change("wni-mscale", ms);
    } else {
      handleIntervalFunction.regist("wni-mscale", this.load.bind(this), ms);
    }
  }
  get interval (){
    return handleIntervalFunction.getInterval("wni-mscale");
  }

  load (){
    const mscale_object = this;
    const event_change = this.#eventhandler.change;
    http_request.send("wni-mscale").then(data => {
      const mscale = data.data.mscale - 0;
      mscale_object.scale = mscale;
      event_change(mscale);
      // console.log(this.#mscale);
    });
  }
  /**
   * イベントを登録します。複数の登録に対応していません。
   * @param {String} event イベントの種類
   * @param {String} handler イベントハンドラー
   */
  on (event, handler){
    if (Object.hasOwn(this.#eventhandler, event)){
      this.#eventhandler[event] = handler;
    }
  }
}
