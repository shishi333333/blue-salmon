import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case '/history':
        return 'History';
      case '/analysis':
        return 'Analysis';
      default:
        if (location.pathname.startsWith('/analysis/')) {
          return 'Analysis';
        }
        return 'Blue Salmon';
    }
  };

  const showBackButton = location.pathname !== '/';

  return (
    <header className="app-header">
      <div className="header-content">
        {showBackButton ? (
          <Link to="/" className="header-back">
            ←
          </Link>
        ) : (
          <div className="header-spacer"></div>
        )}
        <h1 className="header-title">{getTitle()}</h1>
        <div className="header-spacer"></div>
      </div>
    </header>
  );
}

export default Header;
