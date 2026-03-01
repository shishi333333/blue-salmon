import { useState, useRef, useEffect } from 'react';
import { useWebsites } from '../context/WebsiteContext';

function Home() {
  const { refreshHistory } = useWebsites();
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState(null); // Generated website
  const [messages, setMessages] = useState([]); // Chat history
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);

  // Initial form state
  const [formData, setFormData] = useState({
    webTemplate: '',
    webName: '',
    topic: '',
    colorScheme: '',
    prompt: '',
  });

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Initial website generation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const websiteData = {
      templateUrl: formData.webTemplate,
      name: formData.webName,
      topic: formData.topic,
      colour: formData.colorScheme,
      prompt: formData.prompt,
    };

    // Add initial request to chat
    setMessages([
      {
        role: 'user',
        content: `Create a website called "${formData.webName}" about ${formData.topic}${formData.prompt ? `. ${formData.prompt}` : ''}`,
      },
    ]);

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      await refreshHistory();

      // Set the generated website
      setWebsite({
        id: data.id,
        name: formData.webName,
        url: `http://localhost:3001/site/${data.id}`,
        pages: data.pages,
      });

      // Add success message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I've created your website "${formData.webName}"! You can see the preview below. Feel free to ask me to make changes - for example:\n\n• "Make the header darker"\n• "Add more content to the about section"\n• "Change the button text to 'Get Started'"`,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle chat message for improvements
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/api/improve/${website.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            page: 'home',
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve website');
      }

      // Refresh iframe
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || "Done! I've updated your website.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Reset to create new website
  const handleReset = () => {
    setWebsite(null);
    setMessages([]);
    setFormData({
      webTemplate: '',
      webName: '',
      topic: '',
      colorScheme: '',
      prompt: '',
    });
  };

  // Initial form view
  if (!website) {
    return (
      <div className="page-container">
        <div className="page-hero">
          <p className="subtitle">
            Pick a vibe and let our builder create a professional website just
            for you!
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
                required
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

            <button type="submit" disabled={loading}>
              <span className="btn-text">Generate Website</span>
              <span className="btn-icon">→</span>
            </button>

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

  // Chat view after website is generated
  return (
    <div className="chat-builder">
      {/* Chat Section - Top */}
      <div className="chat-section">
        <div className="chat-header">
          <h3>{website.name}</h3>
          <button className="btn-secondary" onClick={handleReset}>
            New Website
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-content typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleChatSubmit}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask me to improve your website..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !chatInput.trim()}>
            Send
          </button>
        </form>
      </div>

      {/* Preview Section - Bottom */}
      <div className="preview-section">
        <div className="preview-header">
          <span>Live Preview</span>
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="preview-link"
          >
            Open in new tab ↗
          </a>
        </div>
        <iframe
          ref={iframeRef}
          src={website.url}
          title="Website Preview"
          className="preview-iframe"
        />
      </div>
    </div>
  );
}

export default Home;
