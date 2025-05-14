/** 気象情報管理のトップ */
const Downpour = require("./Downpour");
const Landslide = require("./Landslide");
const Observation = require("./Observation");
const Tornado = require("./Tornado");
const Typhoon = require("./Typhoon");
const Warning = require("./Warning");

module.exports = class {
  #data_object = {};
  constructor (){
    this.#data_object.downpour = new Downpour();
    this.#data_object.landslide = new Landslide();
    this.#data_object.observation = new Observation();
    this.#data_object.tornado = new Tornado();
    this.#data_object.typhoon = new Typhoon();
    this.#data_object.warning = new Warning();
  }
}