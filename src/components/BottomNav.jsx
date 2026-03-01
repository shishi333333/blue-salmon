import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav mt-10">
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <span className="nav-icon">
          <FontAwesomeIcon icon={faHouse} />
        </span>
        <span className="nav-label">Home</span>
      </Link>
      <Link
        to="/history"
        className={`nav-item ${isActive('/history') ? 'active' : ''}`}
      >
        <span className="nav-icon">
          <FontAwesomeIcon icon={faClockRotateLeft} />
        </span>
        <span className="nav-label">History</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
