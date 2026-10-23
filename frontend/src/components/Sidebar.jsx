import "../css/Sidebar.css";

const menuItems = [
  { label: "Dashboard", icon: "⌂" },
  { label: "Projects", icon: "▣" },
  { label: "Notes", icon: "▤" },
  { label: "Files", icon: "▧" },
  { label: "Team", icon: "♧" },
  { label: "AI Assistant", icon: "✦" },
  { label: "Profile", icon: "◉" },
];

function Sidebar({ activePage, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">C</span>
        <span>CollabSphere</span>
      </div>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-navigation">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`sidebar-link ${
              activePage === item.label ? "active" : ""
            }`}
            onClick={() => onNavigate(item.label)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={onLogout}>
        ↪ <span>Log out</span>
      </button>
    </aside>
  );
}

export default Sidebar;