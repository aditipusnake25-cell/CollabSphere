import { useState } from "react";
import "../css/Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  function addProject(e) {
    e.preventDefault();

    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    const newProject = {
      id: Date.now(),
      name: projectName,
      description: description,
    };

    setProjects([...projects, newProject]);
    setProjectName("");
    setDescription("");
  }

  function deleteProject(id) {
    setProjects(projects.filter((project) => project.id !== id));
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div>
          <h1>My Projects</h1>
          <p>Organize your ideas and build something amazing.</p>
        </div>

        <span className="project-count">
          {projects.length} Projects
        </span>
      </header>

      <section className="project-form-card">
        <h2>Create a New Project</h2>

        <form onSubmit={addProject}>
          <label>Project Name</label>
          <input
            type="text"
            placeholder="e.g. CollabSphere"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />

          <label>Project Description</label>
          <textarea
            placeholder="What are you building?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />

          <button type="submit">+ Create Project</button>
        </form>
      </section>

      <section className="projects-list">
        <h2>Your Projects</h2>

        {projects.length === 0 ? (
          <div className="empty-projects">
            <h3>No projects yet</h3>
            <p>Create your first project using the form above.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-icon">{"</>"}</div>

                <h3>{project.name}</h3>
                <p>
                  {project.description || "No description added."}
                </p>

                <div className="project-card-footer">
                  <span>Personal Project</span>

                  <button
                    type="button"
                    className="delete-project"
                    onClick={() => deleteProject(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Projects;
