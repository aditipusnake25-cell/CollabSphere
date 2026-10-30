import React from "react";
import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import "../css/Projects.css";

const emptyForm = { name: "", description: "", technology: "", status: "Planning" };

export default function Projects({ projects, onCreate, onUpdate, onDelete, onOpenProject }) {
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!showForm) { setForm(emptyForm); setEditingId(null); }
    }, [showForm]);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        const data = { ...form, technology: form.technology.split(",").map(x => x.trim()).filter(Boolean) };
        try {
            if (editingId) await onUpdate(editingId, data);
            else await onCreate(data);
            setShowForm(false);
    } catch (err) { setError(err.message); }
    };

    const edit = (project) => {
        setEditingId(project._id);
        setForm({ name: project.name, description: project.description, technology: (project.technology || []).join(", "), status: project.status });
        setShowForm(true);
    };

    return (
        <section>
            <div className="page-heading"><div><p className="eyebrow">WORKSPACE</p><h1>Projects</h1><p className="muted">Create and manage your development projects.</p></div><button className="button button-primary" onClick={() => setShowForm(!showForm)}>+ Create project</button></div>
            {showForm && <form className="form-panel" onSubmit={submit}>
                <h2>{editingId ? "Update project" : "Create a project"}</h2>
                {error && <div className="error-message">{error}</div>}
                <label>Project name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
                <label>Description<textarea required rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
                <label>Technologies <span className="muted">(comma separated)</span><input value={form.technology} onChange={e => setForm({ ...form, technology: e.target.value })} placeholder="React, Node.js, MongoDB" /></label>
                <label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>Planning</option><option>In Progress</option><option>Completed</option></select></label>
                <div className="inline-actions"><button className="button button-primary">{editingId ? "Save changes" : "Create project"}</button><button type="button" className="button button-light" onClick={() => setShowForm(false)}>Cancel</button></div>
            </form>}
            {projects.length ? <div className="project-grid">{projects.map(p => <div key={p._id}><ProjectCard project={p} onOpen={onOpenProject} /><div className="card-actions"><button className="text-button" onClick={() => edit(p)}>Edit</button><button className="text-button danger-text" onClick={() => onDelete(p._id)}>Delete</button></div></div>)}</div> : <div className="empty-state"><h3>Your projects will appear here</h3><p>Create a project to start collaborating.</p></div>}
        </section>
    );
}
