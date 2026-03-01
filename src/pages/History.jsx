import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebsites } from '../context/WebsiteContext';
import SiteCard from '../components/SiteCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

function History() {
  const { websites, deleteWebsite, loading, error } = useWebsites();
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
                <span className="btn-icon">
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </button>
            </Link>
          </div>
        ) : (
          <ul className="website-list">
            {websites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onDelete={handleDelete}
                deleting={deleting}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default History;
