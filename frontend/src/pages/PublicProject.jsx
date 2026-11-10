import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import "../css/Projects.css";

function PublicProject() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProject() {
      setLoading(true);
      setError("");
      try {
        const response = await apiRequest(`/projects/public/${id}`);
        if (active) setProject(response.project || null);
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load this public project.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProject();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <main className="projects-page public-project-page">
      <div className="public-project-content">
        <header className="public-project-header">
          <a href="/" className="public-project-brand"><span className="public-brand-mark">C</span>CollabSphere</a>
          <span>Public project</span>
        </header>

      {loading ? (
        <p>Loading project...</p>
      ) : error ? (
        <section className="empty-projects" role="alert">
          <h1>Project unavailable</h1>
          <p>{error}</p>
        </section>
      ) : project ? (
        <article className="project-card">
          <span className="eyebrow">PROJECT SHOWCASE · {project.status || "ACTIVE"}</span>
          <h1>{project.name}</h1>
          <p className="project-description">
            {project.description || "No description provided."}
          </p>
          {project.technology?.length > 0 && (
            <section>
              <h2>Technologies</h2>
              <ul>
                {project.technology.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </section>
          )}
          {project.createdAt && (
            <p>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          )}
          {project.readme && (
            <section>
              <h2>README</h2>
              <pre>{project.readme}</pre>
            </section>
          )}
          {project.notes?.length > 0 && (
            <section>
              <h2>Public Notes</h2>
              {project.notes.map((note) => (
                <article className="public-project-note" key={note._id}>
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                </article>
              ))}
            </section>
          )}
          <p>This page is read-only.</p>
        </article>
      ) : null}
      </div>
    </main>
  );
}

export default PublicProject;