import "electron";
declare module PreferencesFileLoader {
  function exists (filePath: string): Promise<Boolean>;
  function read (filePath: string, format: "text", charset: string): Promise<String>;
  function read (filePath: string, format: "json", charset: string): Promise<Object | Array<any>>;
  function read (filePath: string, format: "xml", charset: string): Promise<XMLDocument>;
  function save (filePath: string, data: string | NodeJS.ArrayBufferView, charset: string ): Promise<void>;
  function createDir (filePath: string): void;
}

export = PreferencesFileLoader;