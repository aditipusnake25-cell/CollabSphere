import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "../css/Projects.css";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyProjectId, setBusyProjectId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchProjectData() {
    return Promise.all([
      apiRequest("/projects"),
      apiRequest("/auth/profile"),
    ]);
  }

  function applyProjectData(projectData, profileData) {
    setProjects(Array.isArray(projectData.projects) ? projectData.projects : []);
    setCurrentUserId(String(profileData.user?._id || profileData.user?.id || ""));
  }

  async function loadProjects() {
    setLoading(true);
    setError("");

    try {
      const [projectData, profileData] = await fetchProjectData();
      applyProjectData(projectData, profileData);
    } catch (requestError) {
      setError(requestError.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    fetchProjectData()
      .then(([projectData, profileData]) => {
        if (active) applyProjectData(projectData, profileData);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load projects.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function addProject(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!projectName.trim() || !description.trim()) {
      setError("Enter a project name and description.");
      return;
    }

    setSaving(true);
    try {
      const result = await apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: projectName.trim(),
          description: description.trim(),
        }),
      });
      setProjectName("");
      setDescription("");
      setMessage(result.message || "Project created successfully.");
      await loadProjects();
    } catch (requestError) {
      setError(requestError.message || "Unable to create the project.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublic(project) {
    const id = String(project._id);
    setBusyProjectId(id);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isPublic: !project.isPublic }),
      });
      setProjects((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, isPublic: result.project?.isPublic ?? !project.isPublic }
            : item
        )
      );
      setMessage(project.isPublic ? "Project is now private." : "Project is now public.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update project visibility.");
    } finally {
      setBusyProjectId("");
    }
  }

  async function shareProject(project) {
    const url = `${window.location.origin}/public/projects/${project._id}`;
    setError("");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setMessage("Public project URL copied to clipboard.");
      } else {
        window.prompt("Copy this public project URL:", url);
        setMessage("Copy the public project URL from the dialog.");
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to copy the public project URL.");
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete "${project.name}" and its project record?`)) return;

    const id = String(project._id);
    setBusyProjectId(id);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest(`/projects/${id}`, { method: "DELETE" });
      setProjects((current) => current.filter((item) => item._id !== id));
      setMessage(result.message || "Project deleted successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete the project.");
    } finally {
      setBusyProjectId("");
    }
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>My Projects</h1>
          <p>Organize your ideas and build something amazing.</p>
        </div>
        <span className="project-count">{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
      </header>

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {message && <p className="notice notice-success" role="status">{message}</p>}

      <section className="project-form-card">
        <h2><span className="form-heading-icon">＋</span> Create a new project</h2>
        <form onSubmit={addProject}>
          <label htmlFor="project-name">Project Name</label>
          <input
            id="project-name"
            type="text"
            placeholder="e.g. CollabSphere"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            maxLength={120}
            required
            disabled={saving}
          />

          <label htmlFor="project-description">Project Description</label>
          <textarea
            id="project-description"
            placeholder="What are you building?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            required
            disabled={saving}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Creating..." : "+ Create Project"}
          </button>
        </form>
      </section>

      <section className="projects-list">
        <h2>Your Projects</h2>
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="empty-projects">
            <h3>No projects yet</h3>
            <p>Create a project using the form above, or ask a project owner to add you.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => {
              const id = String(project._id);
              const ownerId = String(project.createdBy?._id || project.createdBy || "");
              const isOwner = ownerId === currentUserId;
              const publicUrl = `${window.location.origin}/public/projects/${id}`;

              return (
                <article className="project-card" key={id}>
                  <div className="project-icon">{"</>"}</div>
                  <h3>{project.name}</h3>
                  <p>{project.description || "No description added."}</p>
                  <div className="project-card-footer">
                    <span>
                      {project.status || "Planning"} · {project.members?.length || 0} members
                    </span>
                    <span>{isOwner ? "Owner" : "Joined"}</span>
                  </div>
                  <div className="project-actions">
                    <button
                      type="button"
                      className="project-details-button"
                      onClick={() => navigate(`/projects/${id}`)}
                    >
                      View project
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        className="project-visibility-button"
                        onClick={() => togglePublic(project)}
                        disabled={busyProjectId === id}
                      >
                        {busyProjectId === id
                          ? "Updating..."
                          : project.isPublic
                          ? "Make Private"
                          : "Make Public"}
                      </button>
                    )}
                    {project.isPublic && (
                      <>
                        <a href={publicUrl}>Open public page</a>
                        <button
                          type="button"
                          className="project-share-button"
                          onClick={() => shareProject(project)}
                        >
                          Copy Share URL
                        </button>
                      </>
                    )}
                    {isOwner && (
                      <button
                        type="button"
                        className="delete-project"
                        onClick={() => deleteProject(project)}
                        disabled={busyProjectId === id}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Projects;
