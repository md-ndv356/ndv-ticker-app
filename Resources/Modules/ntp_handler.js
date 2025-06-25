const ConfigReader = require("./config_reader");

const NTP = require("ntp-time").Client;
const Config = {
  ntpTimeOffset: -2208988800,
  lv1start: 0x80000000,
  offset32bit: 0x100000000
};
const thisExport = {
  client: null,
  config: Config,
  syncTime: async () => {
    if (!thisExport.client) {
      thisExport.client = new NTP(await ConfigReader.getValue("appInfo.ntpServer"), 123, { timeout: 5000 });
    }
    const time = await thisExport.client.syncTime();
    // 2036年問題を無視しています。これは深刻です！！！！！！
    return {
      differenceMs: (time.rxTimestamp + Config.ntpTimeOffset - time.d) * 1000,
      pollIntervalMs: 2 ** time.poll * 1000
    };
  }
};
module.exports = thisExport;
