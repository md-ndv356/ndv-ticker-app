declare namespace AppErrorHandler {
  namespace set {
    function main_warning(warning: ErrorEvent): string;
    function main_uncaughtException(err: ErrorEvent): string;
    function connection_error(err: object): string;
    function window(msg: object): string;
  }
  function get(): object;
}

export = AppErrorHandler;
