import { useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWebsites } from '../context/WebsiteContext';
import PreviewSection from '../components/PreviewSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faPalette,
  faHandPointer,
  faBolt,
  faUniversalAccess,
  faFileLines,
  faMagnifyingGlass,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    icon: <FontAwesomeIcon icon={faCircle} style={{ color: '#ef4444' }} />,
    color: '#ef4444',
  },
  warning: {
    label: 'Warning',
    icon: <FontAwesomeIcon icon={faCircle} style={{ color: '#eab308' }} />,
    color: '#eab308',
  },
  info: {
    label: 'Info',
    icon: <FontAwesomeIcon icon={faCircle} style={{ color: '#3b82f6' }} />,
    color: '#3b82f6',
  },
};

const CATEGORY_ICONS = {
  design: <FontAwesomeIcon icon={faPalette} />,
  usability: <FontAwesomeIcon icon={faHandPointer} />,
  performance: <FontAwesomeIcon icon={faBolt} />,
  accessibility: <FontAwesomeIcon icon={faUniversalAccess} />,
  content: <FontAwesomeIcon icon={faFileLines} />,
  seo: <FontAwesomeIcon icon={faMagnifyingGlass} />,
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
  const { websites, analyzeWebsite, getWebsiteById } = useWebsites();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState({});
  const [error, setError] = useState(null);
  const [activeError, setActiveError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const iframeRef = useRef(null);

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

  // Detail view for a specific website
  if (selectedWebsite) {
    const analysis = selectedWebsite.analysis || analysisData;
    const hasAnalysis = analysis && analysis.overallScore;
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
        <PreviewSection
          ref={iframeRef}
          name={selectedWebsite.name}
          siteId={selectedWebsite.id}
        />

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
              <div className="prompt-icon"></div>
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
                  <FontAwesomeIcon
                    icon={faCircle}
                    style={{ color: '#ef4444' }}
                  />{' '}
                  {errorCounts.critical}
                </button>
                <button
                  className={`filter-btn filter-warning ${severityFilter === 'warning' ? 'active' : ''}`}
                  onClick={() => setSeverityFilter('warning')}
                >
                  <FontAwesomeIcon
                    icon={faCircle}
                    style={{ color: '#eab308' }}
                  />{' '}
                  {errorCounts.warning}
                </button>
                <button
                  className={`filter-btn filter-info ${severityFilter === 'info' ? 'active' : ''}`}
                  onClick={() => setSeverityFilter('info')}
                >
                  <FontAwesomeIcon
                    icon={faCircle}
                    style={{ color: '#3b82f6' }}
                  />{' '}
                  {errorCounts.info}
                </button>
              </div>

              {/* Error List */}
              <div className="error-list">
                {filteredErrors.length === 0 ? (
                  <div className="no-errors">
                    <span></span>
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
                      </div>
                      <div className="error-element">{err.element}</div>
                      <div className="error-message">{err.message}</div>
                      <div className="error-suggestion">
                        <span className="suggestion-icon">
                          <FontAwesomeIcon icon={faLightbulb} />
                        </span>
                        {err.suggestion}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
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
