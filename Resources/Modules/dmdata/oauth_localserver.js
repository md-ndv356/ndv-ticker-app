const express = require("express");

module.exports = class {
  /** @type {URL} */ #redirect_uri;
  /** @type {number} */ #port;
  /** @type {string} */ #path;
  /** @type {import("http").Server?} */ #server = null;
  /** @type {Function?} */ #on_callback = null;

  /**
   * @param {number} port
   * @param {string} path
   */
  constructor (port = Math.floor(Math.random() * 16384) + 49152, path = "code"){
    this.#redirect_uri = new URL("http://localhost:" + port + "/" + path);
    this.#port = port;
    this.#path = path;
  }

  /**
   * サーバーを開放します。
   */
  open (){
    if (!this.#on_callback) throw Error("Callback is not set.");

    const app = express();
    app.get("/" + this.#path, (req, res) => {
      const { code, state } = req.query;
      this.#on_callback(code, state, res);
    });

    this.#server = app.listen(this.#port-0);
  }

  /**
   * サーバーを閉じます。
   */
  close (){
    this.#server.close();
  }

  get onCallback (){
    return this.#on_callback;
  }
  set onCallback (fn){
    if (!(fn instanceof Function)) throw Error("Callback must be function.");
    this.#on_callback = fn;
  }

  get redirectURI (){
    return this.#redirect_uri;
  }
};
