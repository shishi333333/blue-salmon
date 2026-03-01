import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faArrowUpRightFromSquare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

const API_BASE = '';

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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SiteCard({ site, onDelete, deleting, className = '' }) {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(e, site.id);
  };

  return (
    <li
      className={`website-card ${className}`}
      onClick={() => navigate(`/analysis/${site.id}`)}
    >
      {site.thumbnail ? (
        <img
          src={`${API_BASE}${site.thumbnail}`}
          alt={site.name}
          className="website-thumbnail-img"
          onError={(e) => {
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
        <span className="thumbnail-icon">
          <FontAwesomeIcon icon={faGlobe} />
        </span>
      </div>
      <div className="website-content">
        <div className="website-info">
          <h3 className="website-name">{site.name}</h3>
          <p className="website-topic">{site.topic}</p>
          <p className="website-date">{formatDate(site.createdAt)}</p>
        </div>
        {site.analysis && (
          <div className="website-badge">
            <span className="badge-score">{site.analysis.overallScore}</span>
          </div>
        )}
      </div>
      <div className="website-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="action-btn view-btn"
          onClick={() => window.open(`/api/site/${site.id}`, '_blank')}
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" /> View
        </button>
        <button
          type="button"
          className="action-btn delete-btn"
          onClick={handleDelete}
          disabled={deleting === site.id}
        >
          {deleting === site.id ? (
            '...'
          ) : (
            <>
              <FontAwesomeIcon icon={faTrash} size="sm" /> Delete
            </>
          )}
        </button>
      </div>
    </li>
  );
}

export default SiteCard;
