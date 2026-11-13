
import { useEffect, useState } from "react";
import { apiFetch, apiRequest } from "../services/api";
import "../css/Files.css";

const ALLOWED_EXTENSIONS =
  /\.(js|jsx|py|html|css|json|md|txt|pdf|png|jpe?g|gif)$/i;

const TEXT_EXTENSIONS =
  /\.(js|jsx|py|java|html|css|json|md|txt)$/i;

const CODE_EXTENSIONS =
  /\.(js|jsx|py|html|css|json)$/i;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getFileKind(file) {
  const name = file.originalName || file.name || "";

  if (/\.(png|jpe?g|gif|webp)$/i.test(name)) {
    return "image";
  }

  if (/\.pdf$/i.test(name)) return "pdf";

  if (TEXT_EXTENSIONS.test(name)) return "text";

  return "download";
}

function Files() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyFileId, setBusyFileId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedProject = projects.find(
    (project) => String(project._id) === projectId
  );

  const projectOwnerId = String(
    selectedProject?.createdBy?._id ||
      selectedProject?.createdBy ||
      ""
  );

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const [response, profileData] = await Promise.all([
          apiRequest("/projects"),
          apiRequest("/auth/profile"),
        ]);

        if (!active) return;

        const projectList = Array.isArray(response.projects)
          ? response.projects
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
      setFiles([]);
      setLoading(false);
      return;
    }

    let active = true;

    async function loadFiles() {
      setLoading(true);
      setError("");

      try {
        const response = await apiRequest(
          `/files/project/${projectId}`
        );

        if (active) {
          setFiles(
            Array.isArray(response.files)
              ? response.files
              : []
          );
        }
      } catch (requestError) {
        if (active) {
          setFiles([]);
          setError(
            requestError.message ||
              "Unable to load project files."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFiles();

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    const previewUrl = preview?.url;

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [preview?.url]);

  function contentEndpoint(file) {
    return `/files/project/${projectId}/${file._id}/content`;
  }

  async function handleUpload(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!projectId || !selectedFile) {
      setError("Select a project and a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);

    try {
      const response = await apiRequest(
        `/files/${projectId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      setMessage(
        response.message || "File uploaded successfully."
      );

      setSelectedFile(null);
      event.target.reset();

      const fileData = await apiRequest(
        `/files/project/${projectId}`
      );

      setFiles(
        Array.isArray(fileData.files)
          ? fileData.files
          : []
      );
    } catch (requestError) {
      setError(
        requestError.message || "File upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(null);
    setError("");
    setMessage("");

    if (!file) return;

    if (!ALLOWED_EXTENSIONS.test(file.name)) {
      setError("This file type is not supported.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function openPreview(file) {
    setError("");
    setPreview(null);
    setBusyFileId(file._id);

    try {
      const response = await apiFetch(contentEndpoint(file));
      const kind = getFileKind(file);

      if (kind === "text") {
        setPreview({
          file,
          kind,
          text: await response.text(),
        });
      } else {
        setPreview({
          file,
          kind,
          url: URL.createObjectURL(
            await response.blob()
          ),
        });
      }
    } catch (requestError) {
      setError(
        requestError.message || "Unable to preview this file."
      );
    } finally {
      setBusyFileId("");
    }
  }

  async function downloadFile(file) {
    setError("");
    setBusyFileId(file._id);

    try {
      const response = await apiFetch(contentEndpoint(file));

      const url = URL.createObjectURL(
        await response.blob()
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to download this file."
      );
    } finally {
      setBusyFileId("");
    }
  }

  async function explainCode(file) {
    setError("");
    setBusyFileId(file._id);

    try {
      const fileResponse = await apiFetch(
        contentEndpoint(file)
      );

      const code = await fileResponse.text();

      const data = await apiRequest("/gemini/explain", {
        method: "POST",
        body: JSON.stringify({
          content: code,
        }),
      });

      setExplanations((current) => ({
        ...current,
        [file._id]: data.result,
      }));
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to explain this code file."
      );
    } finally {
      setBusyFileId("");
    }
  }

  async function deleteFile(file) {
    if (
      !window.confirm(
        `Delete "${file.originalName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");
    setBusyFileId(file._id);

    try {
      const response = await apiRequest(
        `/files/${projectId}/${file._id}`,
        { method: "DELETE" }
      );

      setMessage(
        response.message || "File deleted successfully."
      );

      setFiles((current) =>
        current.filter((item) => item._id !== file._id)
      );

      setExplanations((current) => {
        const next = { ...current };
        delete next[file._id];
        return next;
      });

      if (preview?.file._id === file._id) {
        setPreview(null);
      }
    } catch (requestError) {
      setError(
        requestError.message || "Unable to delete this file."
      );
    } finally {
      setBusyFileId("");
    }
  }

  function formatFileSize(bytes = 0) {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="files-page">
      <header className="files-header">
        <div>
          <span className="eyebrow">PROJECT ASSETS</span>
          <h1>Project Files</h1>
          <p>
            Upload, preview, and manage shared project files.
          </p>
        </div>

        <span className="files-count">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </header>

      {error && (
        <p className="files-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="files-success" role="status">
          {message}
        </p>
      )}

      <section className="file-upload-card">
        <h2>
          <span className="form-heading-icon">↥</span>
          Upload a file
        </h2>

        <p>
          Code, text, images, or PDF files · Maximum 5 MB
        </p>

        <div className="files-project-select">
          <label htmlFor="files-project">
            Select Project
          </label>

          <select
            id="files-project"
            value={projectId}
            onChange={(event) => {
              setProjectId(event.target.value);
              setFiles([]);
              setPreview(null);
              setSelectedFile(null);
              setError("");
              setMessage("");
            }}
            disabled={loadingProjects || uploading}
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

        <form onSubmit={handleUpload}>
          <input
            id="project-file-input"
            type="file"
            accept=".js,.jsx,.py,.html,.css,.json,.md,.txt,.pdf,.png,.jpg,.jpeg,.gif"
            onChange={handleFileChange}
            disabled={uploading || !projectId}
          />

          {selectedFile && (
            <p>
              {selectedFile.name} ·{" "}
              {formatFileSize(selectedFile.size)}
            </p>
          )}

          <button
            type="submit"
            disabled={
              uploading || !projectId || !selectedFile
            }
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </section>

      <section className="files-list-section">
        <h2>Uploaded Files</h2>

        {!projectId ? (
          <div className="empty-files">
            <h3>
              {loadingProjects
                ? "Loading projects..."
                : "Select a project"}
            </h3>

            <p>
              {projects.length
                ? "Choose a project to view its files."
                : "Create or join a project before uploading files."}
            </p>
          </div>
        ) : loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <div className="empty-files">
            <h3>No files uploaded yet</h3>
            <p>Upload a file to see it listed here.</p>
          </div>
        ) : (
          <div className="files-grid">
            {files.map((file) => {
              const kind = getFileKind(file);
              const isBusy = busyFileId === file._id;

              const uploaderId = String(
                file.uploadedBy?._id ||
                  file.uploadedBy ||
                  ""
              );

              const canDelete =
                currentUserId === projectOwnerId ||
                currentUserId === uploaderId;

              return (
                <article
                  className="file-card"
                  key={file._id}
                >
                  <div className="file-icon">
                    {file.originalName
                      .split(".")
                      .pop()
                      ?.toUpperCase() || "FILE"}
                  </div>

                  <div className="file-details">
                    <h3>{file.originalName}</h3>

                    <p>
                      {formatFileSize(file.size)}
                      {file.uploadedBy?.name &&
                        ` · Uploaded by ${file.uploadedBy.name}`}
                    </p>
                  </div>

                  {kind !== "download" && (
                    <button
                      type="button"
                      onClick={() => openPreview(file)}
                      disabled={isBusy}
                    >
                      {isBusy ? "Loading..." : "Preview"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => downloadFile(file)}
                    disabled={isBusy}
                  >
                    {isBusy ? "Loading..." : "Download"}
                  </button>

                  {CODE_EXTENSIONS.test(file.originalName) && (
                    <button
                      type="button"
                      onClick={() => explainCode(file)}
                      disabled={isBusy}
                    >
                      {isBusy
                        ? "Working..."
                        : "Explain this code"}
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      className="remove-file-button"
                      onClick={() => deleteFile(file)}
                      disabled={isBusy}
                    >
                      Delete
                    </button>
                  )}

                  {preview?.file._id === file._id && (
                    <div className="file-preview">
                      <div className="file-preview-heading">
                        <strong>
                          Preview: {file.originalName}
                        </strong>

                        <button
                          type="button"
                          onClick={() => setPreview(null)}
                        >
                          Close
                        </button>
                      </div>

                      {preview.kind === "text" && (
                        <pre className="file-text-preview">
                          {preview.text}
                        </pre>
                      )}

                      {preview.kind === "image" && (
                        <img
                          src={preview.url}
                          alt={file.originalName}
                        />
                      )}

                      {preview.kind === "pdf" && (
                        <iframe
                          title={`Preview of ${file.originalName}`}
                          src={preview.url}
                        />
                      )}
                    </div>
                  )}

                  {explanations[file._id] && (
                    <section className="file-explanation">
                      <h4>Code explanation</h4>
                      <pre>{explanations[file._id]}</pre>
                    </section>
                  )}
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
