import ReactMarkdown from "react-markdown";

function NoteCard({
  note,
  canManage,
  busy,
  aiResult,
  onEdit,
  onDelete,
  onExplain,
}) {
  return (
    <article className="note-card">
      <h3>{note.title}</h3>
      <p className="note-meta">
        {note.createdBy?.name || "Project member"}
        {note.createdAt && ` · ${new Date(note.createdAt).toLocaleDateString()}`}
      </p>
      <div className="note-content markdown-rendered"><ReactMarkdown>{note.content || ""}</ReactMarkdown></div>
      <div className="note-card-actions">
        {canManage && (
          <>
            <button type="button" onClick={() => onEdit(note)}>Edit</button>
            <button
              type="button"
              className="delete-note"
              onClick={() => onDelete(note._id)}
              disabled={busy}
            >
              Delete
            </button>
          </>
        )}
        <button
          type="button"
          className="secondary-button"
          onClick={() => onExplain(note, "explain")}
          disabled={busy}
        >
          Explain this note
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onExplain(note, "improve")}
          disabled={busy}
        >
          Suggest improvements
        </button>
      </div>
      {aiResult && (
        <section className="note-ai-result" aria-live="polite">
          <h4>{aiResult.title}</h4>
          <pre>{aiResult.text}</pre>
        </section>
      )}
    </article>
  );
}

export default NoteCard;