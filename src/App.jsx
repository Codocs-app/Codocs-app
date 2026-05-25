import React, { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import './App.css';

const client = new Anthropic();

export default function App() {
  const [code, setCode] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateDocumentation = async () => {
    if (!code.trim()) {
      setError('Please enter some code to document.');
      return;
    }

    setLoading(true);
    setError('');
    setDocumentation('');

    try {
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Generate comprehensive documentation for the following code. Include:
- A brief description of what the code does
- Function/method signatures and parameters
- Return values and types
- Usage examples
- Any important notes or caveats

\`\`\`
${code}
\`\`\`

Please format the documentation in Markdown.`,
          },
        ],
      });

      const docText = message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n');

      setDocumentation(docText);
    } catch (err) {
      setError(
        `Error generating documentation: ${err.message || 'Unknown error occurred'}`,
      );
      console.error('Claude API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(documentation);
    alert('Documentation copied to clipboard!');
  };

  const handleClearAll = () => {
    setCode('');
    setDocumentation('');
    setError('');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 Codocs - AI Code Documentation Generator</h1>
        <p>Generate comprehensive documentation for your code using Claude AI</p>
      </header>

      <main className="app-main">
        <div className="input-section">
          <div className="form-group">
            <label htmlFor="code-input">Paste Your Code Here:</label>
            <textarea
              id="code-input"
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here... (JavaScript, Python, Java, etc.)"
              rows="15"
            />
          </div>

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={generateDocumentation}
              disabled={loading}
            >
              {loading ? 'Generating Documentation...' : 'Generate Documentation'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleClearAll}
              disabled={loading}
            >
              Clear All
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {documentation && (
          <div className="output-section">
            <div className="output-header">
              <h2>Generated Documentation</h2>
              <button
                className="btn btn-small"
                onClick={handleCopyToClipboard}
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="documentation-output">
              <div className="markdown-content">
                {documentation.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index}>{line.substring(2)}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={index}>{line.substring(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={index}>{line.substring(4)}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={index}>{line.substring(2)}</li>;
                  }
                  if (line.startsWith('```')) {
                    return null;
                  }
                  if (line.trim()) {
                    return <p key={index}>{line}</p>;
                  }
                  return <br key={index} />;
                })}
              </div>
            </div>
          </div>
        )}

        {!documentation && !loading && (
          <div className="empty-state">
            <p>📝 Enter your code and click "Generate Documentation" to get started!</p>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Claude is analyzing your code...</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by{' '}
          <a href="https://www.anthropic.com/" target="_blank" rel="noopener noreferrer">
            Claude AI
          </a>
        </p>
      </footer>
    </div>
  );
}
