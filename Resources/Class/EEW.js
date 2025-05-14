/** 緊急地震速報のデータを管理します。 */
const http_request = require("../Modules/http_request");
const handleIntervalFunction = require("../Modules/handle_interval_function");

// https://zukucode.com/2017/04/javascript-date-format.html
function formatDate(date, format){
  format = format.replaceAll("yyyy", date.getFullYear());
  format = format.replaceAll("MM", ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replaceAll("dd", ('0' + date.getDate()).slice(-2));
  format = format.replaceAll("HH", ('0' + date.getHours()).slice(-2));
  format = format.replaceAll("mm", ('0' + date.getMinutes()).slice(-2));
  format = format.replaceAll("ss", ('0' + date.getSeconds()).slice(-2));
  format = format.replaceAll("SSS", ('00' + date.getMilliseconds()).slice(-3));
  return format;
};

module.exports = class {
  #raw = {};
  #data = {
    eventID: {},
    idList: []
  };

  constructor (){
    const kyoshin_domain = ["east", "west"][Math.floor(Math.random() * 2)];
    http_request.create("kmoni-yahoo-eew", "https://weather-kyoshin."+kyoshin_domain+".edge.storage-yahoo.jp/RealTimeData/20220729/20220729141155.json", {
      method: "GET",
      responseType: "json",
      handlename: "緊急地震速報ソース１",
      sourceurl: "https://weather-kyoshin."+kyoshin_domain+".edge.storage-yahoo.jp/RealTimeData/{yyyyMMdd}/{yyyyMMddHHmmss}.json",
      customData: { domain: kyoshin_domain }
    });
  }

  /**
   * 緊急地震速報の発報イベントを処理します。
   * 複数報の管理に対応。
   * @param {String} source - データの取得元IDで、大文字・小文字の区別は行いません。
   * @param {Object} data - データ
   */
  eventHandler (source, data){
    if(!source) throw new Error("Where are you from?");
    if(!data) throw new Error("data is required");

    let memory = {};
    switch (source.toLocaleLowerCase()) {
      case "iedred":
        if(typeof data === "string") data = JSON.parse(data);
        memory.eventId = data.EventID;
        memory.serial = data.Serial;
        // memory.titleCode = data.Title.Code; // dmdataの方で使えないので（暫定）
        memory.statusCode = data.Status.Code;
        memory.announcedTime = data.AnnouncedTime.UnixTime;
        memory.isWarning = data.Warn;
        memory.isFinal = data.Type.Code > 7;
        memory.isCancel = data.Title.Code === 39;
        memory.earthquake = {
          isAssumption: data.Hypocenter.isAssumption,
          originTime: data.OriginTime.UnixTime,
          hypocenter: {
            code: data.Hypocenter.Code,
            jaName: data.Hypocenter.Name,
            latitude: data.Hypocenter.Location.Lat,
            longitude: data.Hypocenter.Location.Long,
            depth: data.Hypocenter.Depth.Int,
            isSea: data.Hypocenter.isSea
          },
          magnitude: data.Hypocenter.Magnitude.Float,
          maxIntensity: [ data.MaxIntensity.From, data.MaxIntensity.To ]
        };
        if (memory.isWarning){
          memory.earthquake.warnInformation = {
            warnForecast: {
              hypocenter: {
                areaCode: data.WarnForecast.Hypocenter.Code,
                jaName: data.WarnForecast.Hypocenter.Name
              },
              region: data.WarnForecast.District,
              prefecture: data.WarnForecast.LocalAreas,
              district: data.WarnForecast.Regions
            }
          }
        }
        memory.earthquake.forecastArea = [];
        for (let area of data.Forecast){
          memory.earthquake.forecastArea.push({
            areaCode: area.Intensity.Code,
            areaName: { ja: area.Intensity.Name }, // todo: english
            intensity_str: [ area.Intensity.From, area.Intensity.To ],
            isWarn: area.Warn,
            arrival: {
              isArrived: area.Arrival.Flag,
              condition: area.Arrival.Condition,
              time: area.Arrival.Time ? Math.floor(memory.createdTime / 86400000) * 86400 + ((area.Arrival.Time.slice(0,2)+15)%24+9) * 3600 + area.Arrival.Time.slice(3,5) * 60 + (area.Arrival.Time.slice(6,8)-0) - 32400 : 0
            }
          });
        }
        memory.accuracy = {
          epicenter: data.Hypocenter.Accuracy.Epicenter.Code,
          epicenter2: data.Hypocenter.Accuracy.Epicenter.Rank2,
          depth: data.Hypocenter.Accuracy.Depth.Code,
          magnitudeCalculation: data.Hypocenter.Accuracy.Magnitude.Code,
          numberOfMagnitudeCalculation: data.Hypocenter.Accuracy.NumberOfMagnitudeCalculation
        };
        memory.createdTime = Math.floor(Date.now() / 1000);
        break;

      case "dmdata": // vxse44基準
        if(typeof data === "string") data = JSON.parse(data);
        memory.eventId = data.eventId;
        memory.serial = data.serialNo;
        memory.isWarning = data.body.isWarning;
        memory.isFinal = data.body.isLastInfo;
        memory.earthquake = {
          isAssumption: false,  //--//--  判別方法不明  --//--//
          originTime: data.body.earthquake.originTime,
          hypocenter: {
            code: data.body.earthquake.code,
            jaName: data.body.earthquake.hypocenter.name,
            latitude: data.body.earthquake.hypocenter.coordinate.latitude.value - 0,
            longitude: data.body.earthquake.hypocenter.coordinate.longitude.value - 0,
            depth: -data.body.earthquake.hypocenter.coordinate.height.value / 1000,
            isSea: data.body.earthquake.hypocenter.landOrSea === "海域"
          },
          magnitude: data.body.earthquake.magnitude.value,
          maxIntensity: [ data.body.intensity.forecastMaxInt.from, data.body.intensity.forecastMaxInt.to ]
        };
        if (memory.isWarning){
          memory.earthquake.warnInformation = {
            warnForecast: {
              hypocenter: {
                areaCode: data.body.earthquake.hypocenter.reduce.code,
                jaName: data.body.earthquake.hypocenter.reduce.name
              },
              region: "",
              prefecture: "",
              district: ""
            }
          }
        }
        memory.earthquake.forecastArea = [];
        for (let area of data.body.intensity.regions){
          memory.earthquake.forecastArea.push({
            areaCode: area.code,
            areaName: { ja: area.name }, // todo: english
            intensity_str: [ area.forecastMaxInt.from, area.forecastMaxInt.to ],
            isWarn: area.isWarning,
            isPlum: area.isPlum,
            arrival: {
              isArrived: area.condition === "既に主要動到達と推測",
              condition: area.condition ?? "",
              time: (area.condition === "既に主要動到達と推測" || area.isPlum) ? "" : Math.floor((new Date(area.arrivalTime)-0) / 1000)
            }
          });
        }
        memory.accuracy = {
          epicenter: data.body.earthquake.hypocenter.accuracy.epicenters[0],
          epicenter2: data.body.earthquake.hypocenter.accuracy.epicenters[1],
          depth: data.body.earthquake.hypocenter.accuracy.depth,
          magnitudeCalculation: data.body.earthquake.hypocenter.accuracy.magnitudeCalculation,
          numberOfMagnitudeCalculation: data.body.earthquake.hypocenter.accuracy.numberOfMagnitudeCalculation
        };
        memory.createdTime = Math.floor(Date.now() / 1000);

        this.dispatchEvent(new CustomEvent("eewReceived", {
          detail: {
            handledData: memory,
            eventTypeCode: "eew",
            eventTypeString: "Earthquake Early Warning"
          }
        }));
        break;

      default:
        return null;
    }
    let isNewEvent = false;
    if (!Object.hasOwn(this.#data.eventID, memory.eventId)){
      this.#data.eventID[memory.eventId] = [];
      this.#data.idList.push(memory.eventId);
      isNewEvent = true;
    }
    this.#data.eventID[memory.eventId].push(memory);
    return { data: memory, isNewEvent };
  }
  /** 過去のログ、試験データも含めた緊急地震速報のデータを返します */
  get historyData (){

  }
  /** 現在発令されている緊急地震速報のデータを返します */
  get immediateData (){

  }
  /**
   * イベントIDから現在有効のデータを返します。
   * @param {String} eventid イベントID
   */
  getFromEventID (eventid){

  }
  /**
   *
   * @param {String} optionCode "reset"の場合は全てをリセットし、その他の場合は有効なデータのみ残してリセットする
   * @returns
   */
  clearHistory (optionCode){
    optionCode = optionCode.toLocaleLowerCase();
    switch (optionCode) {
      case "":
      default:

        break;
      case "reset":
        this.#data = [];
        break;
    }
    return 0;
  }
  test (){
    console.log(this);
  }

  /**
   *  Yahoo!強震モニタから情報を取得します。
   */
  set interval_kmoni_yahoo_eew (ms){
    if (handleIntervalFunction.isRegisted("kmoni-yahoo-eew")){
      handleIntervalFunction.change("kmoni-yahoo-eew", ms);
    } else {
      handleIntervalFunction.regist("kmoni-yahoo-eew", this.load_kmoni_yahoo_eew.bind(this), ms);
    }
  }
  get interval_kmoni_yahoo_eew (){
    return handleIntervalFunction.getInterval("kmoni-yahoo-eew");
  }
  load_kmoni_yahoo_eew (){
    const currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() - 6);
    http_request.change_url("kmoni-yahoo-eew", "https://weather-kyoshin."+http_request.get_customdata("kmoni-yahoo-eew").domain+".edge.storage-yahoo.jp/RealTimeData/"+formatDate(currentDate, "yyyyMMdd/yyyyMMddHHmmss")+".json");
    http_request.send("kmoni-yahoo-eew").then(data => {
      if(data.hypoInfo) this.eventHandler("kmoni-yahoo", data);
    }).catch(error => {
      try {
        console.error("[Connection Error] "+(error.request.res ? "["+error.request.res.statusCode+"] " : "")+error.config.url);
      } catch (e) {
        // console.error(error.request.res);
        console.error(e);
      }
    });
  }
}
