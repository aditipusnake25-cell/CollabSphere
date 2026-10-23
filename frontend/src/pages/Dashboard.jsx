import { useState } from "react";

import Projects from "./Projects";
import Notes from "./Notes";
import Files from "./Files";
import Team from "./Team";
import AIAssistant from "./AIAssistant";
import Profile from "./Profile";

import "../css/Dashboard.css";

const menuItems = [
  { name: "Dashboard", icon: "🏠" },
  { name: "Projects", icon: "📁" },
  { name: "Notes", icon: "📝" },
  { name: "Files", icon: "📎" },
  { name: "Team", icon: "👥" },
  { name: "AI Assistant", icon: "🤖" },
  { name: "Profile", icon: "👤" },
];

function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Projects":
        return <Projects />;
      case "Notes":
        return <Notes />;
      case "Files":
        return <Files />;
      case "Team":
        return <Team />;
      case "AI Assistant":
        return <AIAssistant />;
      case "Profile":
        return <Profile />;
      default:
        return (
          <div className="dashboard-welcome">
            <h2>Welcome to CollabSphere 👋</h2>
            <p>Your developer collaboration workspace.</p>

            <div className="dashboard-cards">
              <button onClick={() => setActivePage("Projects")}>
                <span>📁</span>
                <strong>Projects</strong>
                <p>Manage your projects</p>
              </button>

              <button onClick={() => setActivePage("Notes")}>
                <span>📝</span>
                <strong>Notes</strong>
                <p>Organize your documentation</p>
              </button>

              <button onClick={() => setActivePage("Files")}>
                <span>📎</span>
                <strong>Files</strong>
                <p>Access shared files</p>
              </button>

              <button onClick={() => setActivePage("AI Assistant")}>
                <span>🤖</span>
                <strong>AI Assistant</strong>
                <p>Generate and explain code</p>
              </button>
            </div>
          </div>
        );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2>CollabSphere</h2>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                activePage === item.name ? "active" : ""
              }
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h3>{activePage}</h3>
            <p>Developer Collaboration Workspace</p>
          </div>
        </header>

        <section className="dashboard-content">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;