import React from "react";
export default function NoteCard({ note, onEdit, onDelete }) {
    return (
        <article className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="inline-actions">
                <button className="text-button" onClick={() => onEdit(note)}>Edit</button>
                <button className="text-button danger-text" onClick={() => onDelete(note._id)}>Delete</button>
            </div>
        </article>
    );
}
