const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("collabsphere_token");

    const headers = { ...(options.headers || {}) };

    if (!(options.body instanceof FormData) && options.body) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Normalize API path to avoid double slashes
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    const response = await fetch(`${API_URL}/api${cleanPath}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
}

export function saveSession(data) {
    localStorage.setItem("collabsphere_token", data.token);
    localStorage.setItem("collabsphere_user", JSON.stringify(data.user));
}

export function getSavedUser() {
    try {
        return JSON.parse(
            localStorage.getItem("collabsphere_user") || "null"
        );
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem("collabsphere_token");
    localStorage.removeItem("collabsphere_user");
}