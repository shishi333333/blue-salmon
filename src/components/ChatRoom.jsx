import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

/**
 * ChatRoom — reusable chat component that talks to /api/improve/:id
 *
 * Props:
 *   siteId        – website id (required)
 *   siteName      – display name for welcome message
 *   onUpdated     – callback after a successful improvement (e.g. refresh iframe)
 *   className     – optional extra class on the root element
 *   welcomeMessage – override the default welcome text
 */
function ChatRoom({
  siteId,
  siteName,
  onUpdated,
  className = '',
  welcomeMessage,
}) {
  const defaultWelcome = `"${siteName || 'Website'}" builder ready! Try:\n• "Make the header darker"\n• "Change button color to red"\n• "Add more spacing"`;

  const [messages, setMessages] = useState([
    { role: 'assistant', content: welcomeMessage || defaultWelcome },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`/api/improve/${siteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, page: 'home' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || 'Done! Updated your website.',
        },
      ]);

      // Notify parent so it can refresh the preview
      onUpdated?.();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: error.message },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`builder-chat-section ${className}`}>
      <div className="panel-header">
        <h2>Chat</h2>
      </div>

      <div className="builder-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`b-msg b-msg--${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="b-msg-avatar">
                <FontAwesomeIcon icon={faRobot} />
              </div>
            )}
            <div className="b-msg-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="b-msg b-msg--assistant">
            <div className="b-msg-avatar">
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div className="b-msg-bubble b-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="builder-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Describe changes..."
          disabled={loading}
          autoComplete="off"
        />
        <button type="submit" disabled={loading || !chatInput.trim()}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
