/** 一定間隔で定期的に実行する */

const intervalData = {
  // _sample: {
  //   func: function (){},
  //   lastTimestamp: 0,
  //   intervalTime: 1500,
  //   executedCount: 0
  // }
};

function mainLoop(){
  const currentTime = Date.now();
  for (const key in intervalData) {
    if (Object.hasOwnProperty.call(intervalData, key)) {
      const item = intervalData[key];
      if ((currentTime > item.lastTimestamp + item.intervalTime) && item.isActive){
        item.func(++item.executedCount);
        item.lastTimestamp = currentTime;
      }
    }
  }
}
setInterval(mainLoop, 1000 / 30);
console.log("Executed: setInterval(mainLoop, 1000 / 30);");

module.exports = {
  regist: function (key, func, time){
    intervalData[key] = {
      func: func,
      lastTimestamp: Date.now(),
      intervalTime: time,
      executedCount: 0,
      isActive: true
    };
  },
  change: function (key, time){
    intervalData[key].intervalTime = time;
  },
  getInterval: function (key){
    return intervalData[key].intervalTime;
  },
  setActive: function (key, bool){
    intervalData[key].isActive = !!bool;
  },
  isRegisted: function (key){
    return Object.hasOwn(intervalData, key);
  }
};
