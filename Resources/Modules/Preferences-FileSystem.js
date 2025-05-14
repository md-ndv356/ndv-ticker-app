/** アプリケーションデータフォルダ管理 */

const fs = require("fs");
const path = require("path");
const basePath = path.join(require("electron").app.getPath("userData"), "./appdata/");
if(!fs.existsSync(basePath)) fs.mkdirSync(basePath);

module.exports = {
  /**
   * アプリケーションデータフォルダ内にあるファイルまたはディレクトリの存在を確認します。
   * 存在する場合はtrueを、存在しない場合はfalseを返します。
   * @param {String} filePath 対象のファイルへのパス
   * @returns {Promise}
   */
  exists: (filePath) => {
    let targetPath = path.join(basePath, filePath);
    return new Promise(resolve => {
      if(fs.existsSync(targetPath)) resolve(true); else resolve(false);
    });
  },
  /**
   * アプリケーションデータフォルダからデータを読み込みます。
   * @param {String} filePath 対象のファイルへのパス
   * @param {String} format 読み込んだデータの出力形式です。 "text", "json", "xml" を指定できます。
   * @param {String} charset 文字コード
   * @return {Promise}
   */
  read: (filePath, format = "text", charset = "utf-8") => {
    let targetPath = path.join(basePath, filePath);
    return new Promise((resolve, reject) => {
      fs.readFile(targetPath, {encoding: charset}, (err, data) => {
        if (err) reject(err);
        switch (format) {
          case "text":
          default :
            resolve(data);
            break;
          case "json":
            try {
              resolve(JSON.parse(data));
            } catch(e) {
              reject(e);
            }
            break;
          case "xml":
            resolve((new DOMParser()).parseFromString(data, "application/xml"));
            break;
        }
      });
    });
  },
  /**
   * アプリケーションデータフォルダにあるファイルへ書き込みを行います。
   * @param {String} filePath 対象のファイルへのパス
   * @param {*} data データ
   * @param {String} [charset] 文字コード
   * @returns {Promise}
   */
  save: (filePath, data, charset = "utf-8") => {
    let targetPath = path.join(basePath, filePath);
    return new Promise((resolve, reject) => {
      fs.writeFile(targetPath, data, {encoding: charset}, err => {
        if(err) reject(err);
        resolve();
      });
    });
  },
  /**
   * アプリケーションデータフォルダ内にディレクトリを作成します。
   * @param {String} filePath 対象のディレクトリへのパス
   * @returns {Promise}
   */
  createDir: (filePath) => {
    let targetPath = path.join(basePath, filePath);
    return new Promise((resolve, reject) => {
      fs.mkdir(targetPath, (err) => {
        if(err) reject(err);
        resolve();
      });
    });
  }
};