type windowType = "main" | "settings" | "information" | "traffic";
type windowOptions = {
  closeable: boolean;
};

export namespace WindowHandler {
  function open(name: windowType, options: windowOptions): void;
  function setClosable(name: windowType, value: boolean)
}
