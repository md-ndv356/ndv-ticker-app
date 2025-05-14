class AppUpdateChecker {
  constructor (url: string, currentVersion: string);
  check (): Promise<{
    isExist: boolean;
    isStop: boolean;
  }>
}

export = AppUpdateChecker;
