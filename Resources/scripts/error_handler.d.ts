declare module "error_handler" {
  interface ErrorData {
    type: string;
    from: string;
    data: any;
    time: number;
    osVersion: string;
  }

  interface ErrorHandlerSet {
    main_warning(warning: Error): string;
    main_uncaughtException(err: Error): string;
    connection_error(err: {
      error: Error;
      key: string;
      timestamp: number;
    }): string;
    window(msg: {
      type: string;
      from: string;
      data: any;
    }): string | undefined;
  }

  interface ErrorHandler {
    set: ErrorHandlerSet;
    get(id: string): ErrorData | undefined;
  }

  const ErrorHandler: ErrorHandler;
  export = ErrorHandler;
}
