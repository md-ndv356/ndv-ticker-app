type CreditsData = {
  name: string;
  license: string;
};

declare module AppInitialConfig {
  function get(): {
    current: string;
    lastModified: string;
    history: string[];
    versionDatabase: {};
    part: {
      ticker: string;
      eewmap: string;
    };
    credits: CreditsData[];
  }
}

export = AppInitialConfig;
