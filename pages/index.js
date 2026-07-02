// pages/index.js

import { useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const INPUT_TYPES = [
  'Article',
  'Research Paper',
  'Code',
  'Transcript',
  'PDF',
  'Documentation',
  'Meeting Notes',
  'Blog Post',
  'News',
  'Mixed/Other'
];

// Debounce delay in milliseconds (prevent rapid successive requests)
const DEBOUNCE_DELAY = 1000;

export default function Home() {
  const [content, setContent] = useState('');
  const [inputType, setInputType] = useState('Article');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  
  // Track last request time and abort controller for cancellation
  const lastRequestTimeRef = useRef(0);
  const abortControllerRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      setContent(text);
      setError('');
    } catch (err) {
      setError('Failed to read file. Please try a text or PDF file.');
    }
  };

  const handleSummarize = async () => {
    if (!content.trim()) {
      setError('Please enter or upload content to summarize');
      return;
    }

    // Debounce: prevent requests within DEBOUNCE_DELAY milliseconds
    const now = Date.now();
    if (now - lastRequestTimeRef.current < DEBOUNCE_DELAY) {
      setError('Please wait before submitting another request');
      return;
    }
    lastRequestTimeRef.current = now;

    // Cancel previous request if it's still in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          inputType,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Handle aborted requests
      if (!response.ok && response.status === 0) {
        return; // Request was cancelled
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
      setStats({
        inputLength: data.inputLength,
        inputType: data.inputType,
        timestamp: new Date(data.timestamp).toLocaleString(),
      });
    } catch (err) {
      // Don't show error if request was aborted
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `summary_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  return (
    <>
      <Head>
        <title>AI Summarizer - Free Content Summary Tool</title>
        <meta name="description" content="Convert any content into structured bullet-point summaries with AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1>🤖 AI Summarizer</h1>
          <p>Transform any content into structured bullet-point summaries</p>
        </header>

        <main className={styles.main}>
          <div className={styles.grid}>
            {/* Input Section */}
            <section className={styles.inputSection}>
              <h2>📝 Input</h2>

              {/* Input Type Selector */}
              <div className={styles.formGroup}>
                <label htmlFor="inputType">Content Type</label>
                <select
                  id="inputType"
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  disabled={loading}
                >
                  {INPUT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div className={styles.uploadBox}>
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileUpload}
                  disabled={loading}
                  accept=".txt,.md,.pdf"
                  style={{ display: 'none' }}
                />
                <label htmlFor="fileInput" className={styles.uploadLabel}>
                  📤 Drop file here or click to upload (.txt, .md, .pdf)
                </label>
              </div>

              {/* Text Input */}
              <div className={styles.formGroup}>
                <label htmlFor="content">Or paste content directly</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your article, research paper, code, transcript, or any text here..."
                  disabled={loading}
                  rows={12}
                />
                <small>{content.length.toLocaleString()} characters</small>
              </div>

              {/* Error Message */}
              {error && (
                <div className={styles.errorBox}>
                  ⚠️ {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleSummarize}
                disabled={loading || !content.trim()}
                className={styles.primaryBtn}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Analyzing...
                  </>
                ) : (
                  '🚀 Generate Summary'
                )}
              </button>
            </section>

            {/* Output Section */}
            <section className={styles.outputSection}>
              <h2>📋 Summary</h2>

              {summary ? (
                <>
                  {/* Stats */}
                  {stats && (
                    <div className={styles.statsBox}>
                      <p><strong>Input:</strong> {stats.inputLength.toLocaleString()} characters ({stats.inputType})</p>
                      <p><strong>Generated:</strong> {stats.timestamp}</p>
                    </div>
                  )}

                  {/* Summary Output */}
                  <div className={styles.summaryBox}>
                    <pre>{summary}</pre>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.buttonGroup}>
                    <button onClick={copySummary} className={styles.secondaryBtn}>
                      📋 Copy to Clipboard
                    </button>
                    <button onClick={downloadSummary} className={styles.secondaryBtn}>
                      💾 Download as .txt
                    </button>
                  </div>

                  {/* New Summary Button */}
                  <button
                    onClick={() => {
                      setContent('');
                      setSummary('');
                      setError('');
                      setStats(null);
                    }}
                    className={styles.tertiaryBtn}
                  >
                    ↻ New Summary
                  </button>
                </>
              ) : (
                <div className={styles.placeholderBox}>
                  <p>👈 Paste content or upload a file to generate a summary</p>
                  <p style={{ fontSize: '12px', marginTop: '10px', color: '#888' }}>
                    Summaries will be structured in bullet points with 200-300+ lines of content
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Features Section */}
          <section className={styles.features}>
            <h2>✨ Features</h2>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <h3>📄 Multi-Format Support</h3>
                <p>Articles, research papers, code, transcripts, PDFs, and more</p>
              </div>
              <div className={styles.featureCard}>
                <h3>🎯 Structured Output</h3>
                <p>Organized bullet points with sub-sections and key insights</p>
              </div>
              <div className={styles.featureCard}>
                <h3>🏷️ Entity Extraction</h3>
                <p>Automatic keyword and entity recognition (people, companies, tech)</p>
              </div>
              <div className={styles.featureCard}>
                <h3>⚡ Optimized Length</h3>
                <p>Minimum 200-300 lines per summary, scaled to input size</p>
              </div>
              <div className={styles.featureCard}>
                <h3>💾 Download & Share</h3>
                <p>Export summaries as .txt files or copy to clipboard</p>
              </div>
              <div className={styles.featureCard}>
                <h3>🔓 Completely Free</h3>
                <p>No signup required, no hidden costs, fully open source</p>
              </div>
            </div>
          </section>

          {/* Tips Section */}
          <section className={styles.tips}>
            <h2>💡 Tips for Best Results</h2>
            <ul>
              <li>Select the correct content type for more accurate summarization</li>
              <li>Longer content (500+ words) generates more detailed summaries</li>
              <li>Summaries preserve original intent and include specific data/metrics</li>
              <li>Keywords and entities are automatically extracted and listed</li>
              <li>Perfect for research, articles, documentation, and transcripts</li>
            </ul>
          </section>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>Made with ❤️ by Bhargav sai p</p>
          <p><a href="https://github.com/Bhargav214">View on GitHub</a></p>
        </footer>
      </div>
    </>
  );
}