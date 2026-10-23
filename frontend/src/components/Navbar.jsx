import "../css/Navbar.css";

function Navbar({ title = "CollabSphere", onMenuClick }) {
  const userName = localStorage.getItem("userName") || "Developer";

  return (
    <header className="top-navbar">
      <button
        className="mobile-menu-button"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        ☰
      </button>

      <div className="navbar-title">
        <h2>{title}</h2>
        <p>Developer Collaboration Workspace</p>
      </div>

      <div className="navbar-user">
        <div className="navbar-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span>{userName}</span>
      </div>
    </header>
  );
}

export default Navbar;