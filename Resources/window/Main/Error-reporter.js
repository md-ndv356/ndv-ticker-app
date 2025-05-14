{
  /**
   * @param {String} trace stacktrace
   * @returns {String}
   */
  const remove = function(trace){
    let stacks = [];
    trace.split("\n").forEach(line => {
      if(line.slice(0,6) === "    at"){
        let space = line.split(" ");
        let last = space.pop();
        if(!last.includes("<anonymous>")){
          if(last.slice(0,1) === "("){
            space.push("("+(new URL(/\((.*:\d*:\d*)\)/.exec(last)[1])).pathname.split("/").at(-1)+")");
          } else {
            space.push((new URL(/(.*:\d*:\d*)/.exec(last)[1])).pathname.split("/").at(-1));
          }
        }
        stacks.push(space.join(" "));
      } else stacks.push(line);
    });
    trace = stacks.join("\n");
    return trace;
  };

  Error.stackTraceLimit = 100;
  window.onerror = (...events) => {
    if(!events[1]) return; // except DevTools
    if(!(events[2] || events[3])) return; // except DevTools
    trace = remove(events[4]?.stack || "");
    console.error("%c例外が発生しました。 / I'm sorry, but an uncaught exception occurred.%c\nTraceback:%c\n"+trace,
      "color: #f12; padding: 2px 5px; font-size: 16px;",
      "color: #333; padding: 2px 5px; font-size: 11px;",
      "color: #333; padding: 2px 5px 2px 25px; font-size: 11px;"
    );
    ContentBridge.send({
      from: "viewer",
      type: "Exception",
      time: Math.trunc(new Date()/1000),
      data: {
        message: events[0] + ((events[4] instanceof LoadError) ? (' (src: "' + events[4].url + '")') : ""),
        url: events[1],
        line: events[2],
        column: events[3],
        stacktrace: trace
      }
    });
  };
  window.addEventListener("unhandledrejection", (event)=>{
    console.log(event);
    trace = remove(event.reason.stack || "");
    console.warn("%c非同期処理の制御に失敗しました。 / I'm sorry, but an unhandled promise rejection occurred.%c\nReason:%c\n"+event.reason,
      "color: #ed9c2a; padding: 2px 5px; font-size: 16px;",
      "color: #333333; padding: 0 5px; font-size: 11px;",
      "color: #333333; padding: 0 5px 0 25px; font-size: 11px;"
    );
    console.log(event.reason.stack);
    ContentBridge.send({
      from: "viewer",
      type: "UnhandledRejection",
      time: Math.trunc(new Date()/1000),
      data: {
        isTrusted: event.isTrusted,
        bubbles: event.bubbles,
        cancelBubble: event.cancelBubble,
        cancelable: event.cancelable,
        composed: event.composed,
        defaultPrevented: event.defaultPrevented,
        eventPhase: event.eventPhase,
        reason: {
          message: event.reason.message,
          stack: trace
        },
        returnValue: event.returnValue,
        timeStamp: event.timeStamp
      }
    });
  });
}