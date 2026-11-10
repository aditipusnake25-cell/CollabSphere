import React from "react";
import "../css/Dashboard.css";
import ProjectCard from "../components/ProjectCard.jsx";

export default function Dashboard({ projects, onNavigate, onOpenProject }) {
    const active = projects.filter(p => p.status === "In Progress").length;
    const completed = projects.filter(p => p.status === "Completed").length;
    return (
        <section>
            <div className="page-heading">
                <div><p className="eyebrow">OVERVIEW</p><h1>Your workspace</h1><p className="muted">A quick look at your team's development work.</p></div>
                <button className="button button-primary" onClick={() => onNavigate("Projects")}>+ New project</button>
            </div>
            <div className="stats-grid">
                <div className="stat-card"><span>Total projects</span><strong>{projects.length}</strong></div>
                <div className="stat-card"><span>In progress</span><strong>{active}</strong></div>
                <div className="stat-card"><span>Completed</span><strong>{completed}</strong></div>
            </div>
            <div className="section-heading"><h2>Recent projects</h2><button className="text-button" onClick={() => onNavigate("Projects")}>View all →</button></div>
            {projects.length ? <div className="project-grid">{projects.slice(0, 3).map(p => <ProjectCard key={p._id} project={p} onOpen={onOpenProject} />)}</div> :
                <div className="empty-state"><h3>No projects yet</h3><p>Create your first project to get started.</p><button className="button button-primary" onClick={() => onNavigate("Projects")}>Create project</button></div>}
        </section>
    );
}
