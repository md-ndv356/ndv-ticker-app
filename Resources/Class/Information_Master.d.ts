interface http_connection_interval {
  iedred7584EEW: number;
  nhkQuake: number;
  jmaDevFeed: number;
  tenkiJPtsunami: number;
  wniMScale: number;
  wniSorabtn: number;
  wniRiver: number;
}

class Information_Master {
  constructor ();
  regist_interval (timer: http_connection_interval): void;
  load_weather (): void;
  load_earthquake (): void;
  load_eew (): void;
  load_river (): void;
  load_tsunami (): void;
}

export = Information_Master;
