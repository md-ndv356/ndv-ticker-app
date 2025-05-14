class Variable_Animation {
  /**
   * @param {Number} time アニメーション時間 (ms)
   * @param {String} type "linear", "ease-in-cubic", "ease-out-cubic", "ease-in-out-cubic", "ease-in-quad", "ease-out-quad", "ease-in-out-quad", "ease-in-quart", "ease-out-quart", "bc_4", "bc_3", "sliding", "r_sliding", "sliding_3"
   * @param {Object} data オプション項目
   * @param {Boolean} floor 結果の小数点以下を切り捨てるか？
   */
  constructor(time, type, data, floor) {
    this.time = time;
    this.type = type;
    this.start_n = data.s;
    this.end_n = data.e;
    this.startTime = -1;
    this.nowTime = -1;
    this.helps = "";
    this.data = data;
    this.savedData = data.datas;
    this.fl = floor ?? false;
  }
  start() {
    this.startTime = Date.now();
  }
  get aIsEnd() {
    return (Date.now()-this.startTime)/this.time >= 1 || this.startTime === -1;
  }
  get current() {
    this.nowTime = Date.now();
    let t = (this.nowTime-this.startTime)/this.time;
    let ret;
    switch (this.type) {
      case "Normal":
      case "linear":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)/this.time*(this.nowTime-this.startTime);
          // 5+(9-5)/2000*(150000-149500)=6
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-in-cubic":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*t*t;
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-out-cubic":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*(1-Math.pow(1-t,3));
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-in-out-cubic":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*(t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2);
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-in-quad":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*t*t;
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-out-quad":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*(1-(1-t)*(1-t));
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-in-out-quad":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*(t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2);
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-in-quart":
        if(t < 1){
          ret = this.start_n+t**4*(this.end_n-this.start_n);
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-out-quart":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*(1-(1-t)**4);
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-in-out-quart":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*(t<0.5 ? 8*(t**4) : 1-(-2*t+2)**4/2);
        } else {
          ret = this.end_n;
        }
        break;
      case "ease-out-in-quart":
        if(t < 1){
          ret = this.start_n+(this.end_n-this.start_n)*(t<0.5 ? (1-(1-2*t)**4)/2 : ((2*t-1)**4+1)/2);
        } else {
          ret = this.end_n;
        }
        break;
      case "bc_4":
        if(t>1)t=1;
        var tp = 1-t;
        ret = t*t*t*this.data[3] + 3*t*t*tp*this.data[2] + 3*t*tp*tp*this.data[1] + tp*tp*tp*this.data[0];
        break;
      case "bc_3":
        if(t>1)t=1;
        var tp = 1-t;
        ret = tp*tp*this.data[0] + 2*tp*t*this.data[1] + t*t*this.data[2];
        break;
      case "sliding":
        var tp = 1-(this.nowTime-this.startTime)/this.time;
        if(tp<0)tp=0;
        ret = this.start_n+Math.sqrt(1-Math.pow(tp,2))*(this.end_n-this.start_n);
        break;
      case "r_sliding":
        var tp = (this.nowTime-this.startTime)/this.time;
        if(tp>1)tp=1;
        ret = this.start_n+Math.sqrt(1-Math.pow(tp,2))*(this.end_n-this.start_n);
        break;
      case "sliding_3":
        var tp = 1-(this.nowTime-this.startTime)/this.time;
        if(tp<0)tp=0;
        ret = this.start_n+Math.sqrt(1-Math.pow(tp,3))*(this.end_n-this.start_n);
        break;
      default:
        console.error(`Variable_Animation/error: Unknown type!(${this.type})`);
        ret = NaN;
        break;
    }
    if(this.startTime !== -1) {
      if(this.fl){
        return Math.floor(ret);
      } else {
        return ret;
      }
    } else {
      return this.end_n;
    }
  }
  reset() {
    this.nowTime = -1;
    this.startTime = -1;
    this.helps = "";
  }
}
