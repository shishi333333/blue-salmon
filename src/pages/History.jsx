import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWebsites } from '../context/WebsiteContext';

const API_BASE = 'http://localhost:3001';

// Generate a color-based thumbnail placeholder (fallback)
function getThumbnailStyle(colorScheme) {
  const colors = {
    'Brown & Cream': ['#8B4513', '#FFFDD0'],
    'Blue & White': ['#3B82F6', '#FFFFFF'],
    'Black & Gold': ['#1F2937', '#F59E0B'],
  };
  const [primary, secondary] = colors[colorScheme] || ['#a165bd', '#f56ea9'];
  return {
    background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
  };
}

function History() {
  const { websites, deleteWebsite, loading, error } = useWebsites();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (deleting) return;

    setDeleting(id);
    try {
      await deleteWebsite(id);
    } catch {
      alert('Failed to delete website');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-hero">
          <p className="subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-hero">
          <p className="subtitle">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-hero">
        <p className="subtitle">All the websites you've created so far</p>
      </div>

      <main className="card history-card">
        {websites.length === 0 ? (
          <div className="empty-state">
            <p>No websites generated yet.</p>
            <Link to="/">
              <button type="button">
                <span className="btn-text">Create Your First Website</span>
                <span className="btn-icon">→</span>
              </button>
            </Link>
          </div>
        ) : (
          <ul className="website-list">
            {websites.map((site) => (
              <li
                key={site.id}
                className="website-card"
                onClick={() => navigate(`/analysis/${site.id}`)}
              >
                {site.thumbnail ? (
                  <img
                    src={`${API_BASE}${site.thumbnail}`}
                    alt={site.name}
                    className="website-thumbnail-img"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="website-thumbnail"
                  style={{
                    ...getThumbnailStyle(site.colour || site.colorScheme),
                    display: site.thumbnail ? 'none' : 'flex',
                  }}
                >
                  <span className="thumbnail-icon">🌐</span>
                </div>
                <div className="website-content">
                  <div className="website-info">
                    <h3 className="website-name">{site.name}</h3>
                    <p className="website-topic">{site.topic}</p>
                    <p className="website-date">{formatDate(site.createdAt)}</p>
                  </div>
                  {site.analysis && (
                    <div className="website-badge">
                      <span className="badge-score">
                        {site.analysis.overallScore}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="website-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={site.url || site.generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn view-btn"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={(e) => handleDelete(e, site.id)}
                    disabled={deleting === site.id}
                  >
                    {deleting === site.id ? '...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default History;
