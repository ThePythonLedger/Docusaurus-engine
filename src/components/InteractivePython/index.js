import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function InteractivePython({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;

  const initialCode = children?.props?.children?.trim() || '';
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
    
    // Send the input back to the worker to resume execution
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'INPUT_RESPONSE', payload: value });
    }
  };

  // Cleanup worker on component unmount
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

    // Terminate any existing worker before starting a new one
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Initialize the Web Worker
    workerRef.current = new Worker(`${baseUrl}skulpt.worker.js`);

    // Handle incoming messages from Skulpt
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

    // Send the code to the worker to start execution
    workerRef.current.postMessage({ type: 'RUN_CODE', payload: code });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.codeHeader}>
        <span className={styles.codeHeaderText}>Python Sandbox</span>
      </div>

      <CodeMirror
        value={code}
        theme={oneDark}
        extensions={[python()]}
        onChange={(value) => setCode(value)}
      />

      <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
        <button
          className={styles.runButton}
          onClick={runCode}
          disabled={isRunning}
        >
          ▶ Execute Program
        </button>
        
        {/* The Kill Switch */}
        <button
          className={styles.runButton}
          onClick={stopWorker}
          disabled={!isRunning}
          style={{ backgroundColor: isRunning ? '#d9534f' : '#555' }}
        >
          ■ Stop Execution
        </button>
      </div>

      <div className={styles.console}>
        <pre ref={outputRef} className={styles.output} />
        <div ref={inputContainerRef} className={styles.inputForm} style={{ display: 'none' }}>
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