import React from "react";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import Notes from "./pages/Notes.jsx";
import Files from "./pages/Files.jsx";
import Team from "./pages/Team.jsx";
import AIAssistant from "./pages/AIAssistant.jsx";
import PublicProject from "./pages/PublicProject.jsx";
import { apiRequest, clearSession, getSavedUser, saveSession } from "./services/api.js";
import "./css/App.css";

export default function App() {
    const [user, setUser] = useState(getSavedUser);
    const [authPage, setAuthPage] = useState("login");
    const [activePage, setActivePage] = useState("Dashboard");
    const [projects, setProjects] = useState([]);
    const [notes, setNotes] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [globalError, setGlobalError] = useState("");
    const publicId = window.location.pathname.match(/^\/public\/([^/]+)/)?.[1];

    const loadProjects = async () => {
        const data = await apiRequest("/projects");
        setProjects(data.projects);
    };

    useEffect(() => {
        if (publicId || !user) return;
        loadProjects().catch(err => setGlobalError(err.message));
    }, [user, publicId]);

    const login = async form => {
        const data = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(form) });
        saveSession(data); setUser(data.user); setActivePage("Dashboard");
    };
    const register = async form => {
        const data = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(form) });
        saveSession(data); setUser(data.user); setActivePage("Dashboard");
    };
    const logout = () => { clearSession(); setUser(null); setProjects([]); setActivePage("Dashboard"); };

    const createProject = async form => { await apiRequest("/projects", { method: "POST", body: JSON.stringify(form) }); await loadProjects(); };
    const updateProject = async (id, form) => { await apiRequest(`/projects/${id}`, { method: "PUT", body: JSON.stringify(form) }); await loadProjects(); };
    const deleteProject = async id => { if (!window.confirm("Delete this project?")) return; await apiRequest(`/projects/${id}`, { method: "DELETE" }); await loadProjects(); setSelectedProject(null); setActivePage("Projects"); };
    const openProject = project => { setSelectedProject(project); setActivePage("ProjectDetails"); loadProjects().then(() => setSelectedProject(project)); };
    const addMember = async (id, email) => { await apiRequest(`/projects/${id}/members`, { method: "POST", body: JSON.stringify({ email }) }); await loadProjects(); const data = await apiRequest(`/projects/${id}`); setSelectedProject(data.project); };
    const removeMember = async (id, memberId) => { await apiRequest(`/projects/${id}/members/${memberId}`, { method: "DELETE" }); await loadProjects(); const data = await apiRequest(`/projects/${id}`); setSelectedProject(data.project); };

    const loadNotes = async projectId => { const data = await apiRequest(`/notes/project/${projectId}`); setNotes(data.notes); };
    const saveNote = async (projectId, form, editingId) => {
        const path = editingId ? `/notes/${editingId}` : "/notes";
        await apiRequest(path, { method: editingId ? "PUT" : "POST", body: JSON.stringify({ ...form, project: projectId }) });
        await loadNotes(projectId);
    };
    const deleteNote = async id => { if (!window.confirm("Delete this note?")) return; await apiRequest(`/notes/${id}`, { method: "DELETE" }); const current = projects[0]?._id; if (current) await loadNotes(current); };

    const loadFiles = async projectId => { const data = await apiRequest(`/files/project/${projectId}`); setFiles(data.files); };
    const uploadFile = async (projectId, file) => { const body = new FormData(); body.append("file", file); await apiRequest(`/files/${projectId}`, { method: "POST", body }); await loadFiles(projectId); };
    const deleteFile = async (projectId, fileId) => { await apiRequest(`/files/${projectId}/${fileId}`, { method: "DELETE" }); await loadFiles(projectId); };
    const askAI = async ({ task, content, projectId }) => apiRequest(`/gemini/${task}`, { method: "POST", body: JSON.stringify({ content, projectId }) });

    if (publicId) return <PublicProject projectId={publicId} />;
    if (!user) return authPage === "login"
        ? <Login onLogin={login} onShowRegister={() => setAuthPage("register")} />
        : <Register onRegister={register} onShowLogin={() => setAuthPage("login")} />;

    let page;
    if (activePage === "Dashboard") page = <Dashboard projects={projects} onNavigate={setActivePage} onOpenProject={openProject} />;
    else if (activePage === "Projects") page = <Projects projects={projects} onCreate={createProject} onUpdate={updateProject} onDelete={deleteProject} onOpenProject={openProject} />;
    else if (activePage === "ProjectDetails") page = <ProjectDetails project={selectedProject} onBack={() => setActivePage("Projects")} onAddMember={addMember} onRemoveMember={removeMember} />;
    else if (activePage === "Notes") page = <Notes projects={projects} notes={notes} onLoadNotes={loadNotes} onSaveNote={saveNote} onDeleteNote={deleteNote} />;
    else if (activePage === "Files") page = <Files projects={projects} files={files} onLoadFiles={loadFiles} onUploadFile={uploadFile} onDeleteFile={deleteFile} />;
    else if (activePage === "Team") page = <Team projects={projects} onOpenProject={openProject} />;
    else page = <AIAssistant projects={projects} onAskAI={askAI} />;

    return <div className="app-shell">
        <Navbar user={user} onLogout={logout} />
        <div className="app-body"><Sidebar activePage={activePage} onNavigate={setActivePage} />
            <main className="main-content">
                {globalError && <div className="error-message">{globalError}<button className="text-button" onClick={() => setGlobalError("")}>Dismiss</button></div>}
                <ProtectedRoute user={user} onLoginRequired={logout}>{page}</ProtectedRoute>
            </main>
        </div>
    </div>;
}
