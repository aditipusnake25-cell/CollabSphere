import React from "react";
import { useState } from "react";
import "../css/ProjectDetails.css";

export default function ProjectDetails({ project, onBack, onAddMember, onRemoveMember }) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    if (!project) return <div className="empty-state">Select a project first.</div>;

    const addMember = async (e) => {
        e.preventDefault(); setMessage("");
        try { await onAddMember(project._id, email); setEmail(""); setMessage("Member added successfully.");
    } catch (err) { setMessage(err.message); }
    };

    return (
        <section>
            <button className="text-button back-button" onClick={onBack}>← Back to projects</button>
            <div className="page-heading"><div><p className="eyebrow">PROJECT DETAILS</p><h1>{project.name}</h1><p className="muted">{project.description}</p></div><span className="status">{project.status}</span></div>
            <div className="detail-panel"><h2>Technologies</h2><div className="tag-list">{(project.technology || []).map(t => <span className="tag" key={t}>{t}</span>)}</div></div>
            <div className="detail-panel"><h2>Team members</h2>
                {message && <p className="muted">{message}</p>}
                <form className="member-form" onSubmit={addMember}><input type="email" required placeholder="Registered member email" value={email} onChange={e => setEmail(e.target.value)} /><button className="button button-primary">Add member</button></form>
                <div className="member-list">{(project.members || []).map(member => <div className="member-row" key={member._id}><span className="avatar">{member.name?.[0]?.toUpperCase()}</span><span>{member.name}<small>{member.email}</small></span><button className="text-button danger-text" onClick={() => onRemoveMember(project._id, member._id)}>Remove</button></div>)}</div>
            </div>
        </section>
    );
}
