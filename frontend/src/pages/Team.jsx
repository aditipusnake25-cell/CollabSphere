import React from "react";
import { useState } from "react";
import "../css/Team.css";

export default function Team({ projects, onOpenProject }) {
    const [selected, setSelected] = useState("");
    const project = projects.find(p => p._id === selected) || projects[0];
    return <section>
        <div className="page-heading"><div><p className="eyebrow">COLLABORATION</p><h1>Team</h1><p className="muted">See the people collaborating on each project.</p></div></div>
        {!projects.length ? <div className="empty-state">Create a project to manage a team.</div> : <>
            <label className="select-label">Choose project<select value={project?._id || ""} onChange={e => setSelected(e.target.value)}>{projects.map(p => <option value={p._id} key={p._id}>{p.name}</option>)}</select></label>
            <div className="detail-panel"><div className="section-heading"><h2>{project?.name} team</h2><button className="text-button" onClick={() => onOpenProject(project)}>Manage members →</button></div>
                {(project?.members || []).map(member => <div className="member-row" key={member._id}><span className="avatar">{member.name?.[0]?.toUpperCase()}</span><span>{member.name}<small>{member.email}</small></span></div>)}
            </div>
        </>}
    </section>;
}
