import React from "react";
import "../css/App.css";

export default function ProjectCard({ project, onOpen }) {
    return (
        <article className="project-card">
            <div className="project-card-top">
                <span className="project-symbol">⌘</span>
                <span className={`status status-${(project.status || "Planning").toLowerCase().replace(" ", "-")}`}>
                    {project.status}
                </span>
            </div>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="tag-list">
                {(project.technology || []).slice(0, 3).map((tech) => <span className="tag" key={tech}>{tech}</span>)}
            </div>
            <div className="project-card-bottom">
                <span>{project.members?.length || 1} member(s)</span>
                <button className="text-button" onClick={() => onOpen(project)}>Open project →</button>
            </div>
        </article>
    );
}
