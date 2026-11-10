import React from "react";
import { useEffect, useState } from "react";
import NoteCard from "../components/NoteCard.jsx";
import "../css/Notes.css";

export default function Notes({ projects, notes, onLoadNotes, onSaveNote, onDeleteNote }) {
    const [projectId, setProjectId] = useState("");
    const [form, setForm] = useState({ title: "", content: "" });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { if (projects.length && !projectId) setProjectId(projects[0]._id); }, [projects, projectId]);
    useEffect(() => { if (projectId) onLoadNotes(projectId); }, [projectId]);

    const edit = note => { setEditingId(note._id); setForm({ title: note.title, content: note.content }); };
    const submit = async e => {
        e.preventDefault(); setError("");
        try {
            await onSaveNote(projectId, form, editingId);
            setForm({ title: "", content: "" }); setEditingId(null);
    } catch (err) { setError(err.message); }
    };

    return <section>
        <div className="page-heading"><div><p className="eyebrow">DOCUMENTATION</p><h1>Project notes</h1><p className="muted">Write down ideas, decisions and useful information.</p></div></div>
        {!projects.length ? <div className="empty-state">Create a project before adding notes.</div> : <>
            <label className="select-label">Choose project<select value={projectId} onChange={e => setProjectId(e.target.value)}>{projects.map(p => <option value={p._id} key={p._id}>{p.name}</option>)}</select></label>
            <form className="form-panel" onSubmit={submit}><h2>{editingId ? "Edit note" : "Create note"}</h2>{error && <div className="error-message">{error}</div>}
                <label>Title<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
                <label>Content<textarea required rows="5" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your project notes..." /></label>
                <div className="inline-actions"><button className="button button-primary">{editingId ? "Update note" : "Save note"}</button>{editingId && <button type="button" className="button button-light" onClick={() => { setEditingId(null); setForm({ title: "", content: "" }); }}>Cancel</button>}</div>
            </form>
            <div className="note-grid">{notes.map(note => <NoteCard key={note._id} note={note} onEdit={edit} onDelete={onDeleteNote} />)}</div>
        </>}
    </section>;
}
