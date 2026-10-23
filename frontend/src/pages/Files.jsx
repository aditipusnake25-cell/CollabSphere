import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import "../css/Files.css";

function Files() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await apiRequest("/projects");
        const projectList = Array.isArray(data)
          ? data
          : data.projects || [];

        setProjects(projectList);

        if (projectList.length > 0) {
          setProjectId(projectList[0]._id || projectList[0].id);
        }
      } catch (err) {
        setError(err.message || "Unable to load projects.");
      }
    }

    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadFiles(projectId);
    } else {
      setFiles([]);
    }
  }, [projectId]);

  async function loadFiles(id) {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        `/files/project/${encodeURIComponent(id)}`
      );

      setFiles(
        Array.isArray(data) ? data : data.files || []
      );
    } catch (err) {
      setFiles([]);
      setError(err.message || "Unable to load files.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setSelectedFile(null);
    setMessage("");
    setError("");

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, PDF, and TXT files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!projectId) {
      setError("Please create or select a project first.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // This assumes the backend accepts the project ID in the URL.
      const data = await apiRequest(
        `/files/${encodeURIComponent(projectId)}`,
        {
          method: "POST",
          body: formData,
        }
      );

      setMessage(data.message || "File uploaded successfully.");
      setSelectedFile(null);

      const input = document.getElementById("project-file-input");
      if (input) input.value = "";

      await loadFiles(projectId);
    } catch (err) {
      setError(err.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fileId) {
    if (!fileId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const data = await apiRequest(
        `/files/${encodeURIComponent(fileId)}`,
        { method: "DELETE" }
      );

      setMessage(data.message || "File deleted successfully.");
      await loadFiles(projectId);
    } catch (err) {
      setError(err.message || "Unable to delete file.");
    }
  }

  function formatFileSize(bytes = 0) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function getFileType(file) {
    const type = file.mimeType || file.type || "";
    const name = file.originalName || file.name || "";

    if (type === "application/pdf" || name.endsWith(".pdf")) {
      return "PDF";
    }
    if (type === "text/plain" || name.endsWith(".txt")) {
      return "TXT";
    }
    if (type === "image/png" || name.endsWith(".png")) {
      return "PNG";
    }
    if (
      type === "image/jpeg" ||
      /\.(jpg|jpeg)$/i.test(name)
    ) {
      return "JPEG";
    }

    return "FILE";
  }

  return (
    <div className="files-page">
      <header className="files-header">
        <div>
          <h1>Project Files</h1>
          <p>Upload and manage your project resources.</p>
        </div>

        <span className="files-count">{files.length} Files</span>
      </header>

      {error && (
        <p className="files-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="files-message" role="status">
          {message}
        </p>
      )}

      <section className="upload-card">
        <h2>Upload a File</h2>
        <p>JPG, PNG, PDF, or TXT · Maximum 5 MB</p>

        <label htmlFor="project-select">Select Project</label>

        <select
          id="project-select"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          disabled={projects.length === 0}
        >
          <option value="">Choose a project</option>

          {projects.map((project) => (
            <option
              key={project._id || project.id}
              value={project._id || project.id}
            >
              {project.name || project.title || "Untitled Project"}
            </option>
          ))}
        </select>

        {projects.length === 0 && (
          <p>Create a project before uploading files.</p>
        )}

        <form onSubmit={handleUpload}>
          <input
            id="project-file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.txt"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <p>
              {selectedFile.name} · {formatFileSize(selectedFile.size)}
            </p>
          )}

          <button
            type="submit"
            disabled={!projectId || !selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </section>

      <section className="file-list-section">
        <h2>Uploaded Files</h2>

        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <div className="empty-files">
            <h3>No files uploaded yet</h3>
            <p>Upload a file to see it listed here.</p>
          </div>
        ) : (
          <div className="file-list">
            {files.map((file) => {
              const id = file._id || file.id;
              const name =
                file.originalName || file.name || "Untitled file";

              return (
                <article className="file-item" key={id}>
                  <div className="file-type-icon">
                    {getFileType(file)}
                  </div>

                  <div className="file-details">
                    <h3>{name}</h3>
                    <p>{formatFileSize(file.size || 0)}</p>
                  </div>

                  {file.fileUrl && (
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  )}

                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => handleDelete(id)}
                  >
                    Delete
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Files;