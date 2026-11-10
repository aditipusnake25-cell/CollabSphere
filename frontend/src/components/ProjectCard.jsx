import "../css/ProjectCard.css";

function ProjectCard({ project, onClick }) {
  const name = project.name || project.title || "Untitled Project";
  const description = project.description || "No description provided.";

  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className="project-card-icon">{"</>"}</span>
        <span className="project-card-status">
          {project.status || "Active"}
        </span>
      </div>

      <h3>{name}</h3>
      <p>{description}</p>

      <div className="project-card-footer">
        <span>
          {project.members?.length || 0} collaborators
        </span>

        {onClick && (
          <button type="button" onClick={() => onClick(project)}>
            View project <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;