import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PreviewSection from '../components/PreviewSection';
import ChatRoom from '../components/ChatRoom';

function Builder() {
  const { id } = useParams();
  const [website, setWebsite] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const loadWebsite = async () => {
      try {
        const res = await fetch('/api/history');
        const sites = await res.json();
        const site = sites.find((s) => s.id === id);
        if (site) setWebsite(site);
      } catch (e) {
        console.error('Failed to load website:', e);
      }
    };
    loadWebsite();
  }, [id]);

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = `/api/site/${id}?t=${Date.now()}`;
    }
  };

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
