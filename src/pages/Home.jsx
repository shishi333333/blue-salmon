import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsites } from '../context/WebsiteContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWandMagicSparkles,
  faDice,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

function Home() {
  const navigate = useNavigate();
  const { refreshHistory } = useWebsites();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    webTemplate: '',
    webName: '',
    topic: '',
    colorScheme: '',
    prompt: '',
  });

  const randomIdeas = [
    {
      webName: 'Brew & Beans',
      topic: 'Artisan coffee shop',
      colorScheme: '#4a2c2a',
      prompt: 'Cozy warm aesthetic with menu and locations',
    },
    {
      webName: 'PawPals',
      topic: 'Pet adoption center',
      colorScheme: '#f59e0b',
      prompt: 'Friendly playful design with adoption listings',
    },
    {
      webName: 'ZenFlow',
      topic: 'Yoga and meditation studio',
      colorScheme: '#7c3aed',
      prompt: 'Calm minimalist design with class schedules',
    },
    {
      webName: 'ByteForge',
      topic: 'Software development agency',
      colorScheme: '#06b6d4',
      prompt: 'Modern tech-forward portfolio with case studies',
    },
    {
      webName: 'GreenLeaf',
      topic: 'Organic grocery delivery',
      colorScheme: '#16a34a',
      prompt: 'Fresh natural feel with product categories',
    },
    {
      webName: 'SoundWave',
      topic: 'Music production studio',
      colorScheme: '#e11d48',
      prompt: 'Bold creative design with portfolio and booking',
    },
    {
      webName: 'TravelNest',
      topic: 'Boutique travel agency',
      colorScheme: '#0ea5e9',
      prompt: 'Inspiring wanderlust theme with destination cards',
    },
    {
      webName: 'FitPulse',
      topic: 'Personal fitness trainer',
      colorScheme: '#f97316',
      prompt: 'Energetic sporty look with programs and testimonials',
    },
    {
      webName: 'PixelCraft',
      topic: 'Graphic design freelancer portfolio',
      colorScheme: '#a855f7',
      prompt: 'Creative portfolio with project gallery',
    },
    {
      webName: 'FreshBite',
      topic: 'Healthy meal prep service',
      colorScheme: '#22c55e',
      prompt: 'Clean appetizing design with weekly menu plans',
    },
    {
      webName: 'CozyStay',
      topic: 'Airbnb-style vacation rentals',
      colorScheme: '#ec4899',
      prompt: 'Warm inviting design with property listings and reviews',
    },
    {
      webName: 'CodeAcademy',
      topic: 'Online coding bootcamp',
      colorScheme: '#3b82f6',
      prompt: 'Sleek educational platform with course catalog',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRandomGenerate = async () => {
    const idea = randomIdeas[Math.floor(Math.random() * randomIdeas.length)];
    setFormData({
      webTemplate: '',
      webName: idea.webName,
      topic: idea.topic,
      colorScheme: idea.colorScheme,
      prompt: idea.prompt,
    });
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: idea.webName,
          topic: idea.topic,
          colour: idea.colorScheme,
          prompt: idea.prompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      await refreshHistory();
      navigate(`/builder/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial website generation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateUrl: formData.webTemplate,
          name: formData.webName,
          topic: formData.topic,
          colour: formData.colorScheme,
          prompt: formData.prompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      await refreshHistory();
      navigate(`/builder/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-hero">
        <p className="subtitle">
          Pick a vibe and let our builder create a professional website just for
          you!
        </p>
      </div>

      <main className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="webTemplate">Website Template</label>
            <input
              type="text"
              id="webTemplate"
              name="webTemplate"
              placeholder="Enter Template URL"
              value={formData.webTemplate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="webName">Website Name</label>
            <input
              type="text"
              id="webName"
              name="webName"
              placeholder="Your Website Name"
              value={formData.webName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input
              type="text"
              id="topic"
              name="topic"
              placeholder="Your Website Topic"
              value={formData.topic}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="colorScheme">Color Scheme</label>
            <input
              type="text"
              id="colorScheme"
              name="colorScheme"
              placeholder="Your Website Colour Scheme"
              value={formData.colorScheme}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prompt">Prompt (Optional)</label>
            <input
              type="text"
              id="prompt"
              name="prompt"
              placeholder="Your personal prompt"
              value={formData.prompt}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginBottom: '12px' }}
          >
            <span className="btn-text">
              <FontAwesomeIcon icon={faWandMagicSparkles} /> Generate Website
            </span>
            {/* <span className="btn-icon">
              <FontAwesomeIcon icon={faArrowRight} />
            </span> */}
          </button>

          <button
            type="button"
            className="btn-random"
            disabled={loading}
            onClick={handleRandomGenerate}
          >
            <span className="btn-text">
              <FontAwesomeIcon icon={faDice} /> Random Generate
            </span>
          </button>

          {error && (
            <div
              className="error-message"
              style={{ color: '#ef4444', marginTop: 12, textAlign: 'center' }}
            >
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-section" style={{ display: 'block' }}>
              <div className="spinner"></div>
              <p>Generating your website...</p>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

export default Home;
