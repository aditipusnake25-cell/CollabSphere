
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProjectCard from "../components/ProjectCard";
import Projects from "./Projects";
import Notes from "./Notes";
import Files from "./Files";
import Team from "./Team";
import AIAssistant from "./AIAssistant";
import "../css/Dashboard.css";
import "../css/Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiRequest("/auth/profile")
      .then(({ user: profile }) => {
        if (active) {
          setUser(profile);
          localStorage.setItem("userName", profile.name || "Developer");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message || "Unable to load your profile."
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="profile-page page-enter">
      <header className="profile-heading">
        <div>
          <span className="eyebrow">YOUR ACCOUNT</span>
          <h1>Profile</h1>
          <p>Your personal details and workspace identity.</p>
        </div>
      </header>

      {error ? (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      ) : user ? (
        <article className="profile-card">
          <div className="profile-avatar">
            {(user.name || "D").charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="eyebrow">WORKSPACE MEMBER</span>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>

          <span className="profile-status">
            <span /> Active account
          </span>
        </article>
      ) : (
        <div className="loading-card">
          <span className="spinner" /> Loading profile...
        </div>
      )}
    </section>
  );
}

function DashboardHome({
  onNavigate,
  onProjectOpen,
  user,
  data,
  loading,
  error,
}) {
  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div className="home-page page-enter">
      <section className="welcome-panel">
        <div>
          <span className="eyebrow welcome-eyebrow">
            YOUR COLLABORATION SPACE
          </span>

          <h1>
            Good to see you, {firstName}
            <span className="welcome-period">.</span>
          </h1>

          <p>
            Bring your team, projects, and ideas together in one place.
          </p>

          <button
            type="button"
            className="button button-light"
            onClick={() => onNavigate("Projects")}
          >
            Explore projects <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-orbit orbit-one" />
          <div className="welcome-orbit orbit-two" />
          <div className="welcome-orbit orbit-three" />

          <span className="welcome-spark spark-one">✦</span>
          <span className="welcome-spark spark-two">✧</span>

          <div className="welcome-glass-card">
            <span className="glass-dot" />
            <span className="glass-line glass-line-wide" />
            <span className="glass-line" />
            <span className="glass-line glass-line-short" />
          </div>
        </div>
      </section>

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      <section
        className="stats-grid"
        aria-label="Workspace statistics"
      >
        <article className="stat-card">
          <span
            className="stat-icon stat-icon-blue"
            aria-hidden="true"
          >
            ▦
          </span>

          <div>
            <p>Projects</p>
            <strong>
              {loading ? "—" : data.projects.length}
            </strong>
          </div>

          <span className="stat-caption">
            in your workspace
          </span>
        </article>

        <article className="stat-card">
          <span
            className="stat-icon stat-icon-green"
            aria-hidden="true"
          >
            ▤
          </span>

          <div>
            <p>Notes</p>
            <strong>
              {loading ? "—" : data.noteCount}
            </strong>
          </div>

          <span className="stat-caption">
            across your projects
          </span>
        </article>

        <article className="stat-card">
          <span
            className="stat-icon stat-icon-blue"
            aria-hidden="true"
          >
            ⌁
          </span>

          <div>
            <p>Shared files</p>
            <strong>
              {loading ? "—" : data.fileCount}
            </strong>
          </div>

          <span className="stat-caption">
            ready for your team
          </span>
        </article>

        <article className="stat-card">
          <span
            className="stat-icon stat-icon-green"
            aria-hidden="true"
          >
            ♧
          </span>

          <div>
            <p>Collaborators</p>
            <strong>
              {loading ? "—" : data.memberCount}
            </strong>
          </div>

          <span className="stat-caption">
            working together
          </span>
        </article>
      </section>

      <section className="home-content-grid">
        <div className="home-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KEEP BUILDING</span>
              <h2>Recent projects</h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate("Projects")}
            >
              View all <span aria-hidden="true">→</span>
            </button>
          </div>

          {loading ? (
            <div className="loading-card">
              <span className="spinner" /> Loading projects...
            </div>
          ) : data.projects.length ? (
            <div className="recent-project-grid">
              {data.projects.slice(0, 4).map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onClick={() => onProjectOpen(project)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <span className="empty-icon">▦</span>

              <h3>Your next big idea starts here</h3>

              <p>
                Create a project and invite your team to start
                collaborating.
              </p>

              <button
                type="button"
                className="button button-primary"
                onClick={() => onNavigate("Projects")}
              >
                Create a project
              </button>
            </div>
          )}
        </div>

        <aside className="home-section recent-notes-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TEAM KNOWLEDGE</span>
              <h2>Recent notes</h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate("Notes")}
            >
              View all <span aria-hidden="true">→</span>
            </button>
          </div>

          {loading ? (
            <div className="loading-card">
              <span className="spinner" /> Loading notes...
            </div>
          ) : data.notes.length ? (
            <div className="recent-notes-list">
              {data.notes.slice(0, 5).map(({ note, projectName }) => (
                <button
                  type="button"
                  className="recent-note"
                  key={note._id}
                  onClick={() => onNavigate("Notes")}
                >
                  <span className="recent-note-icon">▤</span>

                  <span className="recent-note-copy">
                    <strong>{note.title}</strong>

                    <small>
                      {projectName} ·{" "}
                      {note.createdAt
                        ? new Date(
                            note.createdAt
                          ).toLocaleDateString()
                        : "Recently updated"}
                    </small>
                  </span>

                  <span
                    className="recent-note-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-panel empty-panel-compact">
              <span className="empty-icon">▤</span>

              <h3>No notes yet</h3>

              <p>
                Save useful ideas and updates for your projects.
              </p>

              <button
                type="button"
                className="text-button"
                onClick={() => onNavigate("Notes")}
              >
                Write a note →
              </button>
            </div>
          )}
        </aside>
      </section>

      <section className="quick-actions">
        <div>
          <span className="eyebrow">
            MAKE SOMETHING TOGETHER
          </span>

          <h2>Jump back into your workflow</h2>
        </div>

        <div className="quick-action-buttons">
          <button
            type="button"
            onClick={() => onNavigate("Notes")}
          >
            <span>＋</span> New note
          </button>

          <button
            type="button"
            onClick={() => onNavigate("Files")}
          >
            <span>↥</span> Upload a file
          </button>

          <button
            type="button"
            onClick={() => onNavigate("AI Assistant")}
          >
            <span>✦</span> Ask Gemini
          </button>
        </div>
      </section>
    </div>
  );
}

const pageDescriptions = {
  Dashboard: "Your developer collaboration workspace",
  Projects: "Create, organize, and share your team’s work",
  Notes: "Capture ideas and keep project knowledge close",
  Files: "Shared files, right where your team needs them",
  Team: "The people building great things together",
  "AI Assistant": "A little help for your next big idea",
  Profile: "Your personal workspace settings",
};

function Dashboard() {
  const routeNavigate = useNavigate();

  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [data, setData] = useState({
    projects: [],
    notes: [],
    noteCount: 0,
    fileCount: 0,
    memberCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [projectResponse, profileResponse] =
          await Promise.all([
            apiRequest("/projects"),
            apiRequest("/auth/profile"),
          ]);

        const projects = Array.isArray(projectResponse.projects)
          ? projectResponse.projects
          : [];

        const summaries = await Promise.all(
          projects.map(async (project) => {
            const [notesResponse, filesResponse] =
              await Promise.all([
                apiRequest(
                  `/notes/projects/${project._id}/notes`
                ),
                apiRequest(
                  `/files/project/${project._id}`
                ),
              ]);

            return {
              notes: Array.isArray(notesResponse.notes)
                ? notesResponse.notes
                : [],

              files: Array.isArray(filesResponse.files)
                ? filesResponse.files
                : [],
            };
          })
        );

        if (!active) return;

        const allNotes = summaries.flatMap(
          (summary, index) =>
            summary.notes.map((note) => ({
              note,
              projectName: projects[index].name,
            }))
        );

        const memberIds = new Set(
          projects.flatMap((project) =>
            (project.members || []).map((member) =>
              String(member?._id || member)
            )
          )
        );

        const profile = profileResponse.user || null;

        setUser(profile);

        if (profile?.name) {
          localStorage.setItem("userName", profile.name);
        }

        setData({
          projects,

          notes: allNotes.sort(
            (left, right) =>
              new Date(right.note.createdAt || 0) -
              new Date(left.note.createdAt || 0)
          ),

          noteCount: allNotes.length,

          fileCount: summaries.reduce(
            (total, summary) =>
              total + summary.files.length,
            0
          ),

          memberCount: memberIds.size,
        });
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              "Unable to load your workspace."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");

    window.location.href = "/login";
  };

  const navigate = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  function renderPage() {
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
          <DashboardHome
            onNavigate={navigate}
            onProjectOpen={(project) =>
              routeNavigate(`/projects/${project._id}`)
            }
            user={user}
            data={data}
            loading={loading}
            error={error}
          />
        );
    }
  }

  return (
    <div className="dashboard-layout">
      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
      />

      <main className="dashboard-main">
        <Navbar
          title={activePage}
          subtitle={pageDescriptions[activePage]}
          userName={user?.name}
          menuOpen={mobileMenuOpen}
          onMenuClick={() =>
            setMobileMenuOpen((open) => !open)
          }
        />

        <section className="dashboard-content">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
