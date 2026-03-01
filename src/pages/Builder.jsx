import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebsites } from '../context/WebsiteContext';
import PreviewSection from '../components/PreviewSection';
import ChatRoom from '../components/ChatRoom';

function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { websites, loading: ctxLoading, refreshHistory } = useWebsites();
  const [website, setWebsite] = useState(null);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    // First try to find in context
    const found = websites.find((s) => s.id === id);
    if (found) {
      setWebsite(found);
      return;
    }

    // If context is still loading, wait
    if (ctxLoading) return;

    // Context loaded but site not found — try a direct fetch as fallback
    const fetchDirect = async () => {
      try {
        const res = await fetch(`/api/history`);
        if (!res.ok) throw new Error('Failed to load');
        const sites = await res.json();
        const site = sites.find((s) => s.id === id);
        if (site) {
          setWebsite(site);
        } else {
          setError('Website not found');
        }
      } catch (e) {
        console.error('Failed to load website:', e);
        setError('Could not load website. Please try again.');
      }
    };
    fetchDirect();
  }, [id, websites, ctxLoading]);

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = `/api/site/${id}?t=${Date.now()}`;
    }
  };

  if (error) {
    return (
      <div className="b-loading">
        <p>{error}</p>
        <button
          onClick={() => navigate('/history')}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#6366f1',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Go to History
        </button>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="b-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="builder-page">
      <PreviewSection ref={iframeRef} name={website.name} siteId={id} />
      <ChatRoom
        siteId={id}
        siteName={website.name}
        onUpdated={refreshPreview}
      />
    </div>
  );
}

export default Builder;
