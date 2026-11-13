import "../css/Navbar.css";

function Navbar({ title = "CollabSphere", subtitle = "Your collaboration workspace", userName, menuOpen = false, onMenuClick }) {
  const displayName = userName || localStorage.getItem("userName") || "Developer";

  return (
    <header className="top-navbar">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="navbar-title">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="navbar-right">
        <span className="navbar-greeting">Workspace member</span>
        <div className="navbar-user">
          <div className="navbar-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <span>{displayName}</span>
          <span className="navbar-chevron" aria-hidden="true">⌄</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
