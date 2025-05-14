declare namespace handleIntervalFunction {
  function regist(key: string, func: Function, time: number): void;
  function change(key: string, time: number): void;
}

export = handleIntervalFunction;