
const API_URL = (
  import.meta.env.VITE_API_URL || window.location.origin
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "") + "/api";

export async function apiFetch(endpoint, options = {}) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");
  
  const isFormData = options.body instanceof FormData;

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(
    `${API_URL}${cleanEndpoint}`,
    {
      ...options,
      headers: {
        ...(isFormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    const error = new Error(
      data.message ||
        data.error ||
        `Request failed: ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return response;
}

export async function apiRequest(endpoint, options = {}) {
  const response = await apiFetch(endpoint, options);

  if (response.status === 204) {
    return {};
  }

  try {
    return await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }
}

export async function getProjectContributions(projectId) {
  const [noteData, fileData] = await Promise.all([
    apiRequest(`/notes/projects/${projectId}/notes`),
    apiRequest(`/files/project/${projectId}`),
  ]);

  const contributions = {};

  for (const note of noteData.notes || []) {
    const memberId = String(
      note.createdBy?._id || note.createdBy || ""
    );

    if (memberId) {
      contributions[memberId] ??= {
        notes: 0,
        files: 0,
      };

      contributions[memberId].notes += 1;
    }
  }

  for (const file of fileData.files || []) {
    const memberId = String(
      file.uploadedBy?._id || file.uploadedBy || ""
    );

    if (memberId) {
      contributions[memberId] ??= {
        notes: 0,
        files: 0,
      };

      contributions[memberId].files += 1;
    }
  }

  return contributions;
}
