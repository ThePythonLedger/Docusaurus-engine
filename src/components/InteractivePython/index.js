import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';

export default function InteractivePython({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;

  const { colorMode } = useColorMode();

  const rawCode = children?.props?.children?.trim() || '';
  const lines = rawCode.split('\n').length;
  const minLines = 5;

  const initialCode =
    lines < minLines
      ? rawCode + '\n'.repeat(minLines - lines)
      : rawCode;
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);

  const workerRef = useRef(null);
  const outputRef = useRef(null);
  const inputContainerRef = useRef(null);
  const inputPromptRef = useRef(null);
  const inputFieldRef = useRef(null);

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

    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'INPUT_RESPONSE', payload: value });
    }
  };

  useEffect(() => {
    return () => stopWorker();
  }, []);

  const stopWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsRunning(false);
      hideInput();
      appendOutput("\n[Process Terminated]");
    }
  };

  const runCode = () => {
    clearOutput();
    hideInput();
    setIsRunning(true);

    if (workerRef.current) {
      workerRef.current.terminate();
    }

    workerRef.current = new Worker(`${baseUrl}skulpt.worker.js`);

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;

      switch (type) {
        case 'OUTPUT':
          appendOutput(payload);
          break;
        case 'INPUT_PROMPT':
          showInput(payload);
          break;
        case 'FINISHED':
          setIsRunning(false);
          appendOutput("\n[Program Finished]");
          break;
        case 'ERROR':
          setIsRunning(false);
          appendOutput("\n" + payload);
          break;
        default:
          break;
      }
    };

    workerRef.current.postMessage({ type: 'RUN_CODE', payload: code });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.codeHeader}>
        <span className={styles.codeHeaderText}>Python Sandbox</span>
      </div>

      <CodeMirror
        value={code}
        theme={colorMode === 'dark' ? oneDark : 'light'}
        extensions={[python()]}
        onChange={(value) => setCode(value)}
      />

      <div className={styles.buttonGroup}>
        <button
          className={styles.runButton}
          onClick={runCode}
          disabled={isRunning}
        >
          ▶ Execute Program
        </button>

        <button
          className={`${styles.runButton} ${styles.stopButton}`}
          onClick={stopWorker}
          disabled={!isRunning}
        >
          ■ Stop Execution
        </button>
      </div>

      <div className={styles.console}>
        <pre ref={outputRef} className={styles.output} />

        <form
          ref={inputContainerRef}
          className={styles.inputForm}
          style={{ display: 'none' }}
          onSubmit={(e) => {
            e.preventDefault();
            submitInput();
          }}
        >
          <span ref={inputPromptRef} className={styles.promptText} />
          <input
            ref={inputFieldRef}
            type="text"
            className={styles.terminalInput}
          />
          <button type="submit" className={styles.submitInputBtn}>
            Enter ↵
          </button>
        </form>
      </div>
    </div>
  );
}
