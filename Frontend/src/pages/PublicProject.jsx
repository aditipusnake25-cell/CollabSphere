import React from "react";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function PublicProject({ projectId }) {
    const [project, setProject] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => {
        apiRequest(`/projects/public/${projectId}`)
            .then(data => setProject(data.project))
            .catch(err => setError(err.message));
    }, [projectId]);

    if (error) return <main className="public-page"><div className="empty-state">{error}</div></main>;
    if (!project) return <main className="public-page">Loading project...</main>;
    return <main className="public-page"><div className="public-content"><div className="brand"><span className="brand-mark">C</span> CollabSphere</div><p className="eyebrow">PUBLIC PROJECT</p><h1>{project.name}</h1><p>{project.description}</p><h2>Technologies</h2><div className="tag-list">{project.technology.map(t => <span className="tag" key={t}>{t}</span>)}</div><h2>Project notes</h2>{project.notes.map(note => <article className="note-card" key={note._id}><h3>{note.title}</h3><p>{note.content}</p></article>)}</div></main>;
}
