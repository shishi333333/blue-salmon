import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

const WebsiteContext = createContext();

const API_BASE = 'http://localhost:3001/api';

export function WebsiteProvider({ children }) {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch history from backend on mount
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setWebsites(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Refresh history (useful after generating a new website)
  const refreshHistory = useCallback(async () => {
    await fetchHistory();
  }, [fetchHistory]);

  // Analyze a website using the backend LLM
  const analyzeWebsite = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE}/analyze/${id}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to analyze website');
      }
      const data = await response.json();
      // Update local state with the analysis
      setWebsites((prev) =>
        prev.map((site) =>
          site.id === id ? { ...site, analysis: data.analysis } : site,
        ),
      );
      return data.analysis;
    } catch (err) {
      console.error('Error analyzing website:', err);
      throw err;
    }
  }, []);

  // Delete a website from history
  const deleteWebsite = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete website');
      }
      // Remove from local state
      setWebsites((prev) => prev.filter((site) => site.id !== id));
    } catch (err) {
      console.error('Error deleting website:', err);
      throw err;
    }
  }, []);

  // Get a single website by ID
  const getWebsiteById = useCallback(
    (id) => {
      return websites.find((site) => site.id === id);
    },
    [websites],
  );

  return (
    <WebsiteContext.Provider
      value={{
        websites,
        loading,
        error,
        refreshHistory,
        analyzeWebsite,
        deleteWebsite,
        getWebsiteById,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsites() {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsites must be used within a WebsiteProvider');
  }
  return context;
}
