const NTP = require("ntp-time").Client;
const Client = new NTP("ntp.nict.jp", 123, { timeout: 5000 });
const Config = {
  ntpTimeOffset: -2208988800,
  lv1start: 0x80000000,
  offset32bit: 0x100000000
};
const ExportObject = {
  config: Config,
  syncTime: async () => {
    const time = await Client.syncTime();
    // 2036年問題を無視しています。これは深刻です！！！！！！
    return {
      differenceMs: (time.rxTimestamp + Config.ntpTimeOffset - time.d) * 1000,
      pollIntervalMs: 2 ** time.poll * 1000
    };
  }
};
module.exports = ExportObject;
