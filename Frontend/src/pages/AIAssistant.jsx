import React from "react";
import { useState } from "react";
import "../css/AIAssistant.css";

export default function AIAssistant({ projects, onAskAI }) {
    const [projectId, setProjectId] = useState("");
    const [task, setTask] = useState("explain");
    const [content, setContent] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async e => {
        e.preventDefault(); setLoading(true); setError(""); setResult("");
        try { const data = await onAskAI({ task, content, projectId }); setResult(data.result);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    return <section>
        <div className="page-heading"><div><p className="eyebrow">GEMINI POWERED</p><h1>AI Assistant</h1><p className="muted">Get help understanding code and creating project documentation.</p></div></div>
        <form className="form-panel" onSubmit={submit}>
            <label>Choose AI task<select value={task} onChange={e => setTask(e.target.value)}><option value="explain">Explain code or notes</option><option value="docs">Generate documentation</option><option value="readme">Generate README</option></select></label>
            <label>Project (optional)<select value={projectId} onChange={e => setProjectId(e.target.value)}><option value="">No project selected</option>{projects.map(p => <option value={p._id} key={p._id}>{p.name}</option>)}</select></label>
            <label>Paste code or project details<textarea rows="9" required value={content} onChange={e => setContent(e.target.value)} placeholder="Paste your code, notes or project overview here..." /></label>
            {error && <div className="error-message">{error}</div>}
            <button className="button button-primary" disabled={loading}>{loading ? "Generating..." : "Generate with AI"}</button>
        </form>
        {result && <div className="detail-panel ai-result"><h2>AI response</h2><pre>{result}</pre><button className="button button-light" onClick={() => navigator.clipboard.writeText(result)}>Copy response</button></div>}
    </section>;
}
