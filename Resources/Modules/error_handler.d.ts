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
      error: {
        toJSON(): {
          message: string;
          name: string;
          code: string;
          status: number;
          config: {
            method: string;
            url: string;
          };
        };
      };
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
