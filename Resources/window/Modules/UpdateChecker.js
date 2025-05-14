const http_request = require("../../Modules/http_request");
const crypto = require("crypto");

module.exports = class {
  constructor (url, currentVersion){
    this.url = url;
    this.ver = currentVersion;
    this.httpkey = "app_update_check_" + crypto.randomUUID();
    http_request.create(this.httpkey, url, {
      method: "GET",
      cache_invalid: true,
      responseType: "json",
      hiddenRequest: true
    });
  }
  check (){
    const code = this.ver;
    const httpkey = this.httpkey;
    return new Promise((resolve, reject) => {
      http_request.send(httpkey).then(function(response){
        const data = response.data;
        const versionInfo = data.app_alpha.version_list[data.app_alpha.version_list.findIndex(item => item.code === code)];
        const latestInfo = data.app_alpha.version_list[data.app_alpha.version_list.findIndex(item => item.code === data.app_alpha.latest_info.code)];
        let info = {
          isExist: data.app_alpha.latest_info.code !== code, // 新しいバージョンがある
          isStop: !!data.stopcode["0" || versionInfo.stopcode]
        };
        if(info.isExist) info.latest = {
          label: latestInfo.label,
          id: latestInfo.code,
          features: latestInfo.features
        };
        resolve(info);
      }).catch(function(e){
        if (e.constructor.name === "AxiosError"){
          reject({
            error: e,
            timestamp: Math.floor(Date.now() / 1000),
            key: httpkey
          });
        } else {
          throw e;
        }
      });
    });
  }
};