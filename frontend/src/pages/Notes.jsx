import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import "../css/Files.css";

function Files() {
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadFiles(projectId);
    } else {
      setFiles([]);
    }
  }, [projectId]);

  async function loadProjects() {
    try {
      const data = await apiRequest("/projects");
      const list = Array.isArray(data) ? data : data.projects || [];

      setProjects(list);

      if (list.length > 0) {
        setProjectId(list[0]._id || list[0].id);
      }
    } catch (err) {
      setError(err.message || "Unable to load projects.");
    }
  }

  async function loadFiles(id) {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/files/project/${id}`);
      setFiles(Array.isArray(data) ? data : data.files || []);
    } catch (err) {
      setError(err.message || "Unable to load files.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();

    if (!projectId || !selectedFile) {
      setError("Select a project and a file first.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG, PDF, and TXT files are allowed.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be 5 MB or less.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setError("");
    setMessage("");

    try {
      // Verify the upload route and field name against fileRoutes.js.
      await apiRequest(`/files/${projectId}`, {
        method: "POST",
        body: formData,
      });

      setSelectedFile(null);
      e.target.reset();
      setMessage("File uploaded successfully.");
      await loadFiles(projectId);
    } catch (err) {
      setError(err.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fileId) {
    if (!window.confirm("Delete this file?")) return;

    try {
      await apiRequest(`/files/${fileId}`, {
        method: "DELETE",
      });

      setMessage("File deleted.");
      await loadFiles(projectId);
    } catch (err) {
      setError(err.message || "Unable to delete file.");
    }
  }

  return (
    <div className="files-page">
      <header className="files-header">
        <div>
          <h1>Project Files</h1>
          <p>Upload and manage your project resources.</p>
        </div>
      </header>

      {error && <p className="files-error">{error}</p>}
      {message && <p className="files-success">{message}</p>}

      {projects.length > 0 && (
        <div className="files-project-select">
          <label htmlFor="files-project">Select Project</label>
          <select
            id="files-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((project) => (
              <option
                key={project._id || project.id}
                value={project._id || project.id}
              >
                {project.name || project.title || "Untitled Project"}
              </option>
            ))}
          </select>
        </div>
      )}

      <section className="file-upload-card">
        <h2>Upload a File</h2>
        <p>JPG, PNG, PDF, or TXT · Maximum 5 MB</p>

        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.txt"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />

          {selectedFile && (
            <p>
              {selectedFile.name} ·{" "}
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          )}

          <button
            type="submit"
            disabled={uploading || !projectId || !selectedFile}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </section>

      <section className="files-list-section">
        <h2>Uploaded Files</h2>

        {projects.length === 0 ? (
          <p>Create a project before uploading files.</p>
        ) : loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No files uploaded for this project yet.</p>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <article
                className="file-card"
                key={file._id || file.id}
              >
                <div className="file-icon">📄</div>
                <h3>{file.originalName || file.filename || "File"}</h3>
                <p>
                  {file.size
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : "Size unavailable"}
                </p>

                {file.fileUrl && (
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View File
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(file._id || file.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Files;