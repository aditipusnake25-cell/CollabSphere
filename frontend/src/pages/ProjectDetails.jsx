import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest, getProjectContributions } from "../services/api";
import "../css/Projects.css";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    technology: "",
    status: "Planning",
  });
  const [currentUserId, setCurrentUserId] = useState("");
  const [contributions, setContributions] = useState({});
  const [documentation, setDocumentation] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProject() {
      try {
        const [response, profile, stats] = await Promise.all([
          apiRequest(`/projects/${id}`),
          apiRequest("/auth/profile"),
          getProjectContributions(id),
        ]);
        if (active) {
          setProject(response.project || null);
          setEditForm({
            name: response.project?.name || "",
            description: response.project?.description || "",
            technology: (response.project?.technology || []).join(", "),
            status: response.project?.status || "Planning",
          });
          setCurrentUserId(String(profile.user?._id || profile.user?.id || ""));
          setContributions(stats);
        }
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load this project.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [id]);

  async function generateContent(action) {
    setError("");
    setMessage("");
    setGenerating(action);
    try {
      const response = await apiRequest(`/gemini/${action}`, {
        method: "POST",
        body: JSON.stringify({
          content: [
            `Project: ${project.name}`,
            `Description: ${project.description}`,
            `Status: ${project.status || "Planning"}`,
            `Technologies: ${(project.technology || []).join(", ") || "Not specified"}`,
          ].join("\n"),
        }),
      });

      if (action === "readme") {
        const saved = await apiRequest(`/projects/${id}`, {
          method: "PUT",
          body: JSON.stringify({ readme: response.result }),
        });
        setProject(saved.project);
        setMessage("README generated and saved to this project.");
      } else {
        setDocumentation(response.result || "");
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to generate project content.");
    } finally {
      setGenerating("");
    }
  }

  async function saveProject(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await apiRequest(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          technology: editForm.technology.split(",").map((item) => item.trim()).filter(Boolean),
          status: editForm.status,
        }),
      });
      setProject(response.project);
      setMessage(response.message || "Project details updated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update project details.");
    }
  }

  async function toggleReadmeVisibility() {
    setError("");
    setMessage("");
    try {
      const response = await apiRequest(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify({ readmeIsPublic: !project.readmeIsPublic }),
      });
      setProject(response.project);
      setMessage(response.message || "README visibility updated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update README visibility.");
    }
  }

  async function sharePublicPage() {
    const url = `${window.location.origin}/public/projects/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Public project URL copied to clipboard.");
    } catch {
      window.prompt("Copy this public project URL:", url);
    }
  }

  const projectOwnerId = String(project?.createdBy?._id || project?.createdBy || "");
  const isOwner = currentUserId === projectOwnerId;

  return (
    <main className="projects-page project-details-page">
      <div className="project-details-toolbar">
        <button type="button" onClick={() => navigate("/")}>← Back to workspace</button>
        {project?.isPublic && <span className="project-count">Public project</span>}
      </div>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {message && <p className="notice notice-success" role="status">{message}</p>}
      {loading ? (
        <div className="loading-card"><span className="spinner" /> Loading project...</div>
      ) : error ? null : project ? (
        <article className="project-card project-details-main">
          <div className="project-details-title-row">
            <div>
              <span className="eyebrow">PROJECT OVERVIEW</span>
              <h1>{project.name}</h1>
            </div>
            <p>{project.status || "Planning"}</p>
          </div>
          <p className="project-description">{project.description}</p>
          {project.isPublic && (
            <a className="button button-primary" href={`/public/projects/${project._id}`}>Open public page <span aria-hidden="true">→</span></a>
          )}
          {project.technology?.length > 0 && (
            <section className="project-details-section">
              <h2>Technologies</h2>
              <ul className="project-tech-list">
                {project.technology.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </section>
          )}
          <section className="project-details-section">
            <h2>Collaborators</h2>
            <ul className="project-member-list">
              {(project.members || []).map((member) => (
                <li key={member._id}>
                  <strong>{member.name}</strong>
                  {member.email && <span>{member.email}</span>}
                  <span>{contributions[String(member._id)]?.notes || 0} notes · {contributions[String(member._id)]?.files || 0} files</span>
                </li>
              ))}
            </ul>
          </section>
          {isOwner && (
            <section className="project-details-section">
              <h2>Edit project information</h2>
              <form className="project-edit-form" onSubmit={saveProject}>
                <label htmlFor="detail-project-name">Project name</label>
                <input
                  id="detail-project-name"
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                  maxLength={120}
                  required
                />
                <label htmlFor="detail-project-description">Description</label>
                <textarea
                  id="detail-project-description"
                  value={editForm.description}
                  onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                  required
                />
                <label htmlFor="detail-project-technology">Technologies (comma separated)</label>
                <input
                  id="detail-project-technology"
                  value={editForm.technology}
                  onChange={(event) => setEditForm({ ...editForm, technology: event.target.value })}
                  placeholder="React, Node.js, MongoDB"
                />
                <label htmlFor="detail-project-status">Status</label>
                <select
                  id="detail-project-status"
                  value={editForm.status}
                  onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}
                >
                  <option>Planning</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <button className="button button-primary" type="submit">Save project</button>
              </form>
            </section>
          )}
          <section className="project-details-section">
            <h2>Project README</h2>
            {isOwner && (
              <button
                className="button button-primary"
                type="button"
                onClick={() => generateContent("readme")}
                disabled={Boolean(generating)}
              >
                {generating === "readme" ? "Generating..." : "Generate README from project"}
              </button>
            )}
            {isOwner && (
              <label className="visibility-control">
                <input
                  type="checkbox"
                  checked={Boolean(project.readmeIsPublic)}
                  onChange={toggleReadmeVisibility}
                />
                Share README on public project page
              </label>
            )}
            {project.isPublic && <button className="button button-light" type="button" onClick={sharePublicPage}>Copy public URL</button>}
            {project.readme ? <pre>{project.readme}</pre> : <p>No README saved for this project.</p>}
          </section>
          <section className="project-details-section">
            <h2>Project documentation</h2>
            <button
              className="button button-primary"
              type="button"
              onClick={() => generateContent("docs")}
              disabled={Boolean(generating)}
            >
              {generating === "docs" ? "Generating..." : "Generate project documentation"}
            </button>
            {documentation && <pre>{documentation}</pre>}
          </section>
        </article>
      ) : null}
    </main>
  );
}

export default ProjectDetails;