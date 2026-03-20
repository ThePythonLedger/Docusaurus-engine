import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import styles from './styles.module.css';

export default function InteractivePython({ children }) {
  const initialCode = children.props.children.trim();
  const [code, setCode] = useState(initialCode);
  const [isSkulptReady, setIsSkulptReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const outputRef = useRef(null);
  const inputContainerRef = useRef(null);
  const inputPromptRef = useRef(null);
  const inputFieldRef = useRef(null);
  const resolveInputRef = useRef(null);

  const appendOutput = (text) => {
    if (outputRef.current) outputRef.current.textContent += text;
  };

  const clearOutput = () => {
    if (outputRef.current) outputRef.current.textContent = '';
  };

  const showInput = (prompt) => {
    if (!inputContainerRef.current) return;
    inputPromptRef.current.textContent = prompt;
    inputFieldRef.current.value = '';
    inputContainerRef.current.style.display = 'flex';
    inputFieldRef.current.focus();
  };

  const hideInput = () => {
    if (!inputContainerRef.current) return;
    inputContainerRef.current.style.display = 'none';
  };

  const submitInput = () => {
    const value = inputFieldRef.current.value;
    const prompt = inputPromptRef.current.textContent;
    hideInput();
    appendOutput(prompt + value + "\n");
    if (resolveInputRef.current) {
      const resolve = resolveInputRef.current;
      resolveInputRef.current = null;
      resolve(value);
    }
  };

  useEffect(() => {
    if (inputContainerRef.current) {
      inputContainerRef.current.style.display = 'none';
    }
  }, []);

  useEffect(() => {
    const loadScript = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

    async function initSkulpt() {
      try {
        if (!window.Sk) {
          await loadScript("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js");
        }
        setIsSkulptReady(true);
      } catch (err) {
        console.error("Failed to load Skulpt scripts", err);
      }
    }
    initSkulpt();
  }, []);

  const runCode = () => {
    if (!isSkulptReady || !window.Sk) return;

    clearOutput();
    hideInput();
    setIsRunning(true);
    resolveInputRef.current = null;

    window.Sk.configure({
      output: (text) => appendOutput(text),
      read: (x) => {
        if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
          throw "File not found: '" + x + "'";
        return window.Sk.builtinFiles["files"][x];
      },
      inputfunTakesPrompt: true,
      execLimit: 10000, // 10 sec
      yieldLimit: 100,
      inputfun: (prompt) => {
        return new Promise((resolve) => {
          resolveInputRef.current = resolve;
          showInput(prompt);
        });
      },
      __future__: window.Sk.python3
    });

    window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody("<stdin>", false, code, true)
    ).then(
      () => { setIsRunning(false); hideInput(); },
      (err) => {
        appendOutput("\n" + err.toString());
        setIsRunning(false);
        hideInput();
      }
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* ── Header ── */}
      <div className={styles.codeHeader}>
        <span className={styles.codeHeaderText}>Python Ledger Editor</span>
        <span className={`${styles.codeHeaderStatus} ${isSkulptReady ? styles.ready : ''}`}>
          {isSkulptReady ? '● READY' : '○ LOADING...'}
        </span>
      </div>

      <CodeMirror
        value={code}
        theme={oneDark}
        extensions={[python()]}
        onChange={(value) => setCode(value)}
      />

      {/* ── Run Button ── */}
      <button
        className={styles.runButton}
        onClick={runCode}
        disabled={!isSkulptReady || isRunning}
      >
        {isRunning ? '⏳ Running...' : '▶  Execute Program'}
      </button>

      {/* ── Console ── */}
      <div className={styles.console}>
        <pre ref={outputRef} className={styles.output} />
        <div ref={inputContainerRef} className={styles.inputForm}>
          <span ref={inputPromptRef} className={styles.promptText} />
          <input
            ref={inputFieldRef}
            type="text"
            className={styles.terminalInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitInput();
              }
            }}
          />
          <button type="button" className={styles.submitInputBtn} onClick={submitInput}>
            Enter ↵
          </button>
        </div>
      </div>
    </div>
  );
}