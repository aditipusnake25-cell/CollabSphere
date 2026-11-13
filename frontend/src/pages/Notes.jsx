
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import NoteCard from "../components/NoteCard";
import "../css/Notes.css";

function Notes() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyNoteId, setBusyNoteId] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const [projectData, profileData] = await Promise.all([
          apiRequest("/projects"),
          apiRequest("/auth/profile"),
        ]);

        if (!active) return;

        const projectList = Array.isArray(projectData.projects)
          ? projectData.projects
          : [];

        setProjects(projectList);

        setCurrentUserId(
          String(
            profileData.user?._id ||
              profileData.user?.id ||
              ""
          )
        );

        setProjectId((current) =>
          projectList.some(
            (project) => String(project._id) === current
          )
            ? current
            : String(projectList[0]?._id || "")
        );
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message || "Unable to load projects."
          );
        }
      } finally {
        if (active) setLoadingProjects(false);
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!projectId) {
      setNotes([]);
      setLoadingNotes(false);
      return;
    }

    let active = true;

    async function loadNotes() {
      setLoadingNotes(true);
      setError("");

      try {
        const data = await apiRequest(
          `/notes/projects/${projectId}/notes`
        );

        if (active) {
          setNotes(
            Array.isArray(data.notes) ? data.notes : []
          );
        }
      } catch (requestError) {
        if (active) {
          setNotes([]);
          setError(
            requestError.message || "Unable to load notes."
          );
        }
      } finally {
        if (active) setLoadingNotes(false);
      }
    }

    loadNotes();

    return () => {
      active = false;
    };
  }, [projectId]);

  function resetEditor() {
    setTitle("");
    setContent("");
    setEditingId("");
    setAiResult(null);
  }

  function editNote(note) {
    setTitle(note.title || "");
    setContent(note.content || "");
    setEditingId(note._id);
    setAiResult(null);
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveNote(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!projectId) {
      setError(
        "Create or select a project before saving a note."
      );
      return;
    }

    if (!title.trim()) {
      setError("Enter a title for this note.");
      return;
    }

    setSaving(true);

    try {
      const request = editingId
        ? apiRequest(`/notes/notes/${editingId}`, {
            method: "PUT",
            body: JSON.stringify({
              title: title.trim(),
              content,
            }),
          })
        : apiRequest(`/notes/projects/${projectId}/notes`, {
            method: "POST",
            body: JSON.stringify({
              title: title.trim(),
              content,
            }),
          });

      const result = await request;

      setMessage(
        result.message || "Note saved successfully."
      );

      resetEditor();

      const data = await apiRequest(
        `/notes/projects/${projectId}/notes`
      );

      setNotes(
        Array.isArray(data.notes) ? data.notes : []
      );
    } catch (requestError) {
      setError(
        requestError.message || "Unable to save this note."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId) {
    if (
      !window.confirm(
        "Delete this note? This cannot be undone."
      )
    ) {
      return;
    }

    setError("");
    setMessage("");
    setBusyNoteId(noteId);

    try {
      const result = await apiRequest(
        `/notes/notes/${noteId}`,
        { method: "DELETE" }
      );

      setMessage(
        result.message || "Note deleted successfully."
      );

      setNotes((current) =>
        current.filter((note) => note._id !== noteId)
      );

      if (editingId === noteId) {
        resetEditor();
      }
    } catch (requestError) {
      setError(
        requestError.message || "Unable to delete this note."
      );
    } finally {
      setBusyNoteId("");
    }
  }

  async function requestNoteHelp(note, task) {
    setError("");
    setAiResult(null);
    setBusyNoteId(note._id);

    try {
      const data = await apiRequest("/gemini/explain", {
        method: "POST",
        body: JSON.stringify({
          content: note.content,
          action: task,
        }),
      });

      setAiResult({
        noteId: note._id,
        title:
          task === "improve"
            ? "Suggested improvements"
            : "Note explanation",
        text: data.result,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "Gemini could not process this note."
      );
    } finally {
      setBusyNoteId("");
    }
  }

  const selectedProject = projects.find(
    (project) => String(project._id) === projectId
  );

  const selectedProjectOwnerId = String(
    selectedProject?.createdBy?._id ||
      selectedProject?.createdBy ||
      ""
  );

  return (
    <div className="notes-page">
      <header className="notes-header">
        <div>
          <span className="eyebrow">SHARED KNOWLEDGE</span>
          <h1>Project Notes</h1>
          <p>
            Write and manage Markdown notes for your projects.
          </p>
        </div>

        <span className="notes-count">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </header>

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="notice notice-success" role="status">
          {message}
        </p>
      )}

      <div className="note-form-card">
        <label htmlFor="notes-project">
          Select Project
        </label>

        <select
          id="notes-project"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            setNotes([]);
            resetEditor();
            setError("");
            setMessage("");
          }}
          disabled={loadingProjects || projects.length === 0}
        >
          <option value="">
            {loadingProjects
              ? "Loading projects..."
              : "Choose a project"}
          </option>

          {projects.map((project) => (
            <option
              key={project._id}
              value={project._id}
            >
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <section className="note-form-card">
        <h2>
          <span className="form-heading-icon">▤</span>
          {editingId ? "Edit note" : "Create a note"}
        </h2>

        <form onSubmit={saveNote}>
          <label htmlFor="note-title">Title</label>

          <input
            id="note-title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            maxLength={160}
            required
            disabled={!projectId || saving}
            placeholder="Note title"
          />

          <label htmlFor="note-content">
            Markdown
          </label>

          <textarea
            id="note-content"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            rows={12}
            required
            disabled={!projectId || saving}
            placeholder={
              "Write your note using Markdown syntax...\n\n## Heading\n- List item"
            }
          />

          <button
            type="submit"
            disabled={!projectId || saving}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Save Changes"
                : "Save Note"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetEditor}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <section className="notes-list-section">
        <h2>Saved Notes</h2>

        {!projectId ? (
          <p>
            {loadingProjects
              ? "Loading projects..."
              : "Create a project to start adding notes."}
          </p>
        ) : loadingNotes ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="empty-notes">
            <h3>No notes yet</h3>
            <p>
              Save your first project note using the editor above.
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => {
              const authorId = String(
                note.createdBy?._id ||
                  note.createdBy ||
                  ""
              );

              const canManage =
                authorId === currentUserId ||
                selectedProjectOwnerId === currentUserId;

              return (
                <NoteCard
                  key={note._id}
                  note={note}
                  canManage={canManage}
                  busy={busyNoteId === note._id}
                  aiResult={
                    aiResult?.noteId === note._id
                      ? aiResult
                      : null
                  }
                  onEdit={editNote}
                  onDelete={deleteNote}
                  onExplain={requestNoteHelp}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Notes;
