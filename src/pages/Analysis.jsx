import { useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWebsites } from '../context/WebsiteContext';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', icon: '🔴', color: '#ef4444' },
  warning: { label: 'Warning', icon: '🟡', color: '#eab308' },
  info: { label: 'Info', icon: '🔵', color: '#3b82f6' },
};

const CATEGORY_ICONS = {
  design: '🎨',
  usability: '👆',
  performance: '⚡',
  accessibility: '♿',
  content: '📝',
  seo: '🔍',
};

function getGrade(score) {
  if (score >= 90) return { grade: 'A', color: '#22c55e' };
  if (score >= 80) return { grade: 'B', color: '#84cc16' };
  if (score >= 70) return { grade: 'C', color: '#eab308' };
  if (score >= 60) return { grade: 'D', color: '#f97316' };
  return { grade: 'F', color: '#ef4444' };
}

function Analysis() {
  const { id } = useParams();
  const { websites, analyzeWebsite, getWebsiteById, refreshHistory } =
    useWebsites();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState({});
  const [error, setError] = useState(null);
  const [activeError, setActiveError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const iframeRef = useRef(null);

  // Fix suggestion state
  const [fixSuggestion, setFixSuggestion] = useState(null);
  const [loadingFix, setLoadingFix] = useState(false);
  const [applyingFix, setApplyingFix] = useState(false);
  const [selectedError, setSelectedError] = useState(null);

  const selectedWebsite = id
    ? getWebsiteById(id) || websites.find((w) => w.id === id)
    : null;

  const handleAnalyze = async (website) => {
    setAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeWebsite(website.id);
      setAnalysisData(analysis);
    } catch (err) {
      setError('Failed to analyze website. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Highlight element in iframe
  const highlightElement = useCallback((selector, errorId) => {
    setActiveError(errorId);

    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) return;

      const doc = iframe.contentDocument;

      // Remove previous highlights
      const prevHighlights = doc.querySelectorAll('.analysis-highlight');
      prevHighlights.forEach((el) => {
        el.classList.remove('analysis-highlight');
        el.style.outline = '';
        el.style.outlineOffset = '';
      });

      // Find and highlight the element
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        const el = elements[0];
        el.classList.add('analysis-highlight');
        el.style.outline = '3px solid #ef4444';
        el.style.outlineOffset = '2px';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      // Cross-origin or other iframe access error
      console.log('Cannot access iframe content:', e.message);
    }
  }, []);

  // Request AI fix suggestion
  const requestFix = async (err) => {
    setSelectedError(err);
    setLoadingFix(true);
    setFixSuggestion(null);

    try {
      const res = await fetch(`http://localhost:3001/api/fix/suggest/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: err, page: 'home' }),
      });

      if (!res.ok) throw new Error('Failed to get fix suggestion');

      const data = await res.json();
      setFixSuggestion(data);
    } catch (e) {
      console.error('Fix suggestion error:', e);
      setFixSuggestion({ canFix: false, explanation: e.message });
    } finally {
      setLoadingFix(false);
    }
  };

  // Apply the suggested fix
  const applyFix = async () => {
    if (!fixSuggestion || !fixSuggestion.canFix) return;

    setApplyingFix(true);

    try {
      const res = await fetch(`http://localhost:3001/api/fix/apply/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 'home',
          originalCode: fixSuggestion.originalCode,
          fixedCode: fixSuggestion.fixedCode,
          errorId: selectedError?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to apply fix');
      }

      // Refresh iframe
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }

      // Refresh analysis data from server
      await refreshHistory();
      const updated = getWebsiteById(id);
      if (updated?.analysis) {
        setAnalysisData(updated.analysis);
      }

      // Close fix panel
      setFixSuggestion(null);
      setSelectedError(null);
    } catch (e) {
      console.error('Apply fix error:', e);
      alert('Failed to apply fix: ' + e.message);
    } finally {
      setApplyingFix(false);
    }
  };

  // Close fix panel
  const closeFix = () => {
    setFixSuggestion(null);
    setSelectedError(null);
  };

  // Detail view for a specific website
  if (selectedWebsite) {
    const analysis = selectedWebsite.analysis || analysisData;
    const hasAnalysis = analysis && analysis.overallScore;
    // Use localhost for iframe preview to avoid ngrok interstitial
    const previewUrl = `http://localhost:3001/site/${selectedWebsite.id}`;
    const externalUrl = selectedWebsite.url || selectedWebsite.generatedUrl;
    const errors = analysis?.errors || [];

    // Filter errors by severity
    const filteredErrors =
      severityFilter === 'all'
        ? errors
        : errors.filter((e) => e.severity === severityFilter);

    // Count errors by severity
    const errorCounts = {
      critical: errors.filter((e) => e.severity === 'critical').length,
      warning: errors.filter((e) => e.severity === 'warning').length,
      info: errors.filter((e) => e.severity === 'info').length,
    };

    return (
      <div className="analysis-page">
        {/* Left: Website Preview */}
        <div className="website-preview">
          <div className="preview-header">
            <h2>Website Preview</h2>
            <span className="website-name">{selectedWebsite.name}</span>
          </div>
          <div className="preview-frame">
            {previewUrl ? (
              <iframe
                ref={iframeRef}
                src={previewUrl}
                title={selectedWebsite.name}
                className="website-iframe"
              />
            ) : (
              <div className="no-preview">
                <span>No preview available</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Errors Panel */}
        <div className="errors-panel">
          <div className="panel-header">
            <h2>Issues Found</h2>
            {hasAnalysis && (
              <div
                className="score-badge"
                style={{
                  backgroundColor: getGrade(analysis.overallScore).color,
                }}
              >
                {analysis.overallScore}
              </div>
            )}
          </div>

          {!hasAnalysis ? (
            <div className="analyze-prompt">
              <div className="prompt-icon">🔍</div>
              <p>Scan this website for issues</p>
              {error && <p className="error-text">{error}</p>}
              <button
                type="button"
                onClick={() => handleAnalyze(selectedWebsite)}
                disabled={analyzing}
                className="analyze-btn"
              >
                {analyzing ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Scanning...</span>
                  </>
                ) : (
                  'Run Analysis'
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Summary */}
              {analysis.summary && (
                <div className="analysis-summary">
                  <p>{analysis.summary}</p>
                </div>
              )}

              {/* Severity Filter */}
              <div className="severity-filters">
                <button
                  className={`filter-btn ${severityFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSeverityFilter('all')}
                >
                  All ({errors.length})
                </button>
                <button
                  className={`filter-btn filter-critical ${severityFilter === 'critical' ? 'active' : ''}`}
                  onClick={() => setSeverityFilter('critical')}
                >
                  🔴 {errorCounts.critical}
                </button>
                <button
                  className={`filter-btn filter-warning ${severityFilter === 'warning' ? 'active' : ''}`}
                  onClick={() => setSeverityFilter('warning')}
                >
                  🟡 {errorCounts.warning}
                </button>
                <button
                  className={`filter-btn filter-info ${severityFilter === 'info' ? 'active' : ''}`}
                  onClick={() => setSeverityFilter('info')}
                >
                  🔵 {errorCounts.info}
                </button>
              </div>

              {/* Error List */}
              <div className="error-list">
                {filteredErrors.length === 0 ? (
                  <div className="no-errors">
                    <span>✅</span>
                    <p>No {severityFilter} issues found</p>
                  </div>
                ) : (
                  filteredErrors.map((err) => (
                    <div
                      key={err.id}
                      className={`error-item ${activeError === err.id ? 'active' : ''} severity-${err.severity}`}
                      onClick={() => highlightElement(err.selector, err.id)}
                    >
                      <div className="error-header">
                        <span className="error-severity">
                          {SEVERITY_CONFIG[err.severity]?.icon}
                        </span>
                        <span className="error-category">
                          {CATEGORY_ICONS[err.category]} {err.category}
                        </span>
                        <button
                          type="button"
                          className="fix-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            requestFix(err);
                          }}
                          disabled={loadingFix}
                        >
                          🔧 Fix
                        </button>
                      </div>
                      <div className="error-element">{err.element}</div>
                      <div className="error-message">{err.message}</div>
                      <div className="error-suggestion">
                        <span className="suggestion-icon">💡</span>
                        {err.suggestion}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Re-analyze Button */}
              <button
                type="button"
                onClick={() => handleAnalyze(selectedWebsite)}
                disabled={analyzing}
                className="reanalyze-btn"
              >
                {analyzing ? 'Scanning...' : 'Re-scan'}
              </button>
            </>
          )}
        </div>

        {/* Fix Suggestion Panel */}
        {(loadingFix || fixSuggestion) && (
          <div className="fix-panel">
            <div className="fix-panel-header">
              <h3>🔧 Fix Suggestion</h3>
              <button type="button" className="close-btn" onClick={closeFix}>
                ✕
              </button>
            </div>

            {loadingFix ? (
              <div className="fix-loading">
                <div className="spinner-small"></div>
                <p>Generating fix suggestion...</p>
              </div>
            ) : fixSuggestion && !fixSuggestion.canFix ? (
              <div className="fix-unavailable">
                <p>⚠️ Cannot auto-fix this issue</p>
                <p className="fix-explanation">{fixSuggestion.explanation}</p>
              </div>
            ) : (
              fixSuggestion && (
                <>
                  <div className="fix-explanation">
                    <p>{fixSuggestion.explanation}</p>
                  </div>

                  <div className="code-comparison">
                    <div className="code-block original">
                      <h4>Before</h4>
                      <pre>{fixSuggestion.originalCode}</pre>
                    </div>
                    <div className="code-arrow">→</div>
                    <div className="code-block fixed">
                      <h4>After</h4>
                      <pre>{fixSuggestion.fixedCode}</pre>
                    </div>
                  </div>

                  <div className="fix-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeFix}
                      disabled={applyingFix}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="apply-btn"
                      onClick={applyFix}
                      disabled={applyingFix}
                    >
                      {applyingFix ? 'Applying...' : 'Apply Fix'}
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // Website not found
  return (
    <div className="page-container">
      <main className="card">
        <div className="empty-state">
          <p>Website not found.</p>
          <Link to="/history">
            <button type="button">
              <span className="btn-text">Go to History</span>
              <span className="btn-icon">→</span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Analysis;
