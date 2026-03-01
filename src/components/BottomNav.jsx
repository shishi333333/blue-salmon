import { Link, useLocation } from 'react-router-dom';

function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Home</span>
      </Link>
      <Link
        to="/history"
        className={`nav-item ${isActive('/history') ? 'active' : ''}`}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">History</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
