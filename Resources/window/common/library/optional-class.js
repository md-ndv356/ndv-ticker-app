class LoadError extends Error {
  constructor(url, message) {
    super(message);
    this.name = "LoadError";
    this.url = url;
  }
}

class AudioV2 extends Audio {
  constructor(url, options = {}){
    super();
    options.preload && (this.preload = options.preload);
    this.src = url;
  }
}
