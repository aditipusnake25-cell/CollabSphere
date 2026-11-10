import React from "react";
import { useEffect, useState } from "react";
import "../css/Files.css";

export default function Files({ projects, files, onLoadFiles, onUploadFile, onDeleteFile }) {
    const [projectId, setProjectId] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => { if (projects.length && !projectId) setProjectId(projects[0]._id); }, [projects, projectId]);
    useEffect(() => { if (projectId) onLoadFiles(projectId); }, [projectId]);

    const submit = async e => {
        e.preventDefault(); setMessage("");
        if (!selectedFile) return setMessage("Please choose a file.");
        try { await onUploadFile(projectId, selectedFile); setSelectedFile(null); e.target.reset(); setMessage("File uploaded successfully.");
    } catch (err) { setMessage(err.message); }
    };

    return <section>
        <div className="page-heading"><div><p className="eyebrow">PROJECT RESOURCES</p><h1>Files</h1><p className="muted">Upload and manage project files.</p></div></div>
        {!projects.length ? <div className="empty-state">Create a project before uploading files.</div> : <>
            <label className="select-label">Choose project<select value={projectId} onChange={e => setProjectId(e.target.value)}>{projects.map(p => <option value={p._id} key={p._id}>{p.name}</option>)}</select></label>
            <form className="form-panel upload-form" onSubmit={submit}><h2>Upload a file</h2><input type="file" required onChange={e => setSelectedFile(e.target.files[0])} /><p className="muted">Maximum file size: 5 MB. Supported: images, PDF and text/code files.</p>{message && <p className="muted">{message}</p>}<button className="button button-primary">Upload file</button></form>
            <div className="file-list">{files.map(file => <div className="file-row" key={file._id}><span className="file-icon">▧</span><span className="file-info"><strong>{file.originalName}</strong><small>{(file.size / 1024).toFixed(1)} KB</small></span><a href={`http://localhost:5000${file.fileUrl}`} target="_blank" rel="noreferrer">Open</a><button className="text-button danger-text" onClick={() => onDeleteFile(projectId, file._id)}>Delete</button></div>)}</div>
        </>}
    </section>;
}
