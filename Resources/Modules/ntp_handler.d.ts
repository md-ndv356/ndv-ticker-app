namespace UserNTP {
  interface Output {
    differenceMs: number;
    pollIntervalMs: number;
  }
  interface Config {
    ntpTimeOffset: number;
    lv1start: number;
    offset32bit: number;
  }
}

interface UserNTPHandler {
  config: UserNTP.Config;
  syncTime(): Promise<UserNTP.Output>;
}

export = UserNTPHandler;
