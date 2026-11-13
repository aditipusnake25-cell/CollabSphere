import "../css/Sidebar.css";

const menuItems = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Projects", icon: "projects" },
  { label: "Notes", icon: "notes" },
  { label: "Files", icon: "files" },
  { label: "Team", icon: "team" },
  { label: "AI Assistant", icon: "ai" },
  { label: "Profile", icon: "profile" },
];

const iconPaths = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  projects: <><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" /><path d="M3 10h18" /></>,
  notes: <><path d="M7 3.5h8l4 4v13H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" /><path d="M15 3.5v5h5M9 13h6M9 17h6" /></>,
  files: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" /><path d="M13 3v7h7M8 14h8M8 17h8" /></>,
  team: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  ai: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
};

function Sidebar({ activePage, onNavigate, onLogout, isOpen }) {
  return (
    <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`}>
      <a className="sidebar-brand" href="/" onClick={(event) => {
        event.preventDefault();
        onNavigate("Dashboard");
      }}>
        <span className="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M6 17 12 5l6 12M8.2 13h7.6" /></svg>
        </span>
        <span>Collab<span>Sphere</span></span>
      </a>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-navigation" aria-label="Workspace navigation">
        {menuItems.map((item) => (
          <button
            type="button"
            key={item.label}
            className={`sidebar-link${activePage === item.label ? " active" : ""}`}
            onClick={() => onNavigate(item.label)}
            aria-current={activePage === item.label ? "page" : undefined}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">
              {iconPaths[item.icon]}
            </svg>
            <span>{item.label}</span>
            {activePage === item.label && <span className="sidebar-active-mark" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <span className="tip-spark">✦</span>
          <strong>Build better, together.</strong>
          <p>Great ideas grow when they’re shared.</p>
        </div>
        <button type="button" className="sidebar-logout" onClick={onLogout}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
