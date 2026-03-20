// public/skulpt.worker.js

// 1. Load Skulpt directly into the worker
importScripts("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js");
importScripts("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js");

let inputResolve = null;

self.onmessage = function(e) {
  const { type, payload } = e.data;

  // Start execution
  if (type === 'RUN_CODE') {
    runPythonCode(payload);
  } 
  // Receive input from the user (React UI) and resume Python execution
  else if (type === 'INPUT_RESPONSE' && inputResolve) {
    inputResolve(payload);
    inputResolve = null;
  }
};

function runPythonCode(code) {
  self.Sk.configure({
    output: (text) => self.postMessage({ type: 'OUTPUT', payload: text }),
    read: (x) => {
      if (self.Sk.builtinFiles === undefined || self.Sk.builtinFiles["files"][x] === undefined) {
        throw "File not found: '" + x + "'";
      }
      return self.Sk.builtinFiles["files"][x];
    },
    inputfunTakesPrompt: true,
    inputfun: (prompt) => {
      return new Promise((resolve) => {
        inputResolve = resolve;
        // Ask React to show the input UI
        self.postMessage({ type: 'INPUT_PROMPT', payload: prompt }); 
      });
    },
    __future__: self.Sk.python3,
    yieldLimit: 100 // Keeps the worker responsive to messages
  });

  self.Sk.misceval.asyncToPromise(() =>
    self.Sk.importMainWithBody("<stdin>", false, code, true)
  ).then(
    () => self.postMessage({ type: 'FINISHED' }),
    (err) => self.postMessage({ type: 'ERROR', payload: err.toString() })
  );
}