import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import "../css/AIAssistant.css";

const aiActions = [
  {
    id: "explain",
    title: "Explain Code",
    description: "Understand complex code step by step.",
    placeholder: "Paste the code you want explained...",
    button: "Explain Code",
  },
  {
    id: "readme",
    title: "Generate README",
    description: "Create a README for your project.",
    placeholder: "Describe the project, its features and tech stack...",
    button: "Generate README",
  },
  {
    id: "docs",
    title: "Generate Documentation",
    description: "Generate technical documentation.",
    placeholder: "Paste your code or describe the feature to document...",
    button: "Generate Documentation",
  },
];

function AIAssistant() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [activeAction, setActiveAction] = useState(aiActions[0]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/projects")
      .then((data) => {
        if (active) {
          setProjects(Array.isArray(data.projects) ? data.projects : []);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load projects.");
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (activeAction.id === "explain" && !input.trim()) {
      setError("Please enter some code or project details.");
      return;
    }

    if (activeAction.id !== "explain" && !projectId) {
      setError("Select a project to generate its documentation.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const selectedProject = projects.find(
        (project) => String(project._id) === projectId
      );
      const requestBody = activeAction.id === "explain"
        ? { content: input.trim() }
        : {
            content: [
              `Project: ${selectedProject?.name || ""}`,
              `Description: ${selectedProject?.description || ""}`,
              `Status: ${selectedProject?.status || "Planning"}`,
              `Technologies: ${(selectedProject?.technology || []).join(", ") || "Not specified"}`,
            ].join("\n"),
          };
      const data = await apiRequest(`/gemini/${activeAction.id}`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const output =
        data.result;

      if (typeof output !== "string") {
        throw new Error(
          "AI response format does not match the expected fields."
        );
      }

      setResult(output);
    } catch (err) {
      setError(err.message || "AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  function selectAction(action) {
    setActiveAction(action);
    setInput("");
    setResult("");
    setError("");
  }

  return (
    <div className="ai-page">
      <header className="ai-header">
        <span className="eyebrow">YOUR CREATIVE COPILOT</span>
        <h1>AI Assistant</h1>
        <p>
          Use Gemini AI to explain code and generate project documentation.
        </p>
      </header>

      <div className="ai-action-grid">
        {aiActions.map((action) => (
          <button
            type="button"
            key={action.id}
            className={`ai-action-card ${
              activeAction.id === action.id ? "selected" : ""
            }`}
            onClick={() => selectAction(action)}
          >
            <h3>{action.title}</h3>
            <p>{action.description}</p>
          </button>
        ))}
      </div>

      <section className="ai-workspace">
        <h2>{activeAction.title}</h2>

        <form onSubmit={handleSubmit}>
          {activeAction.id === "explain" ? (
            <>
              <label htmlFor="ai-input">Code to explain</label>
              <textarea
                id="ai-input"
                rows={10}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeAction.placeholder}
              />
            </>
          ) : (
            <>
              <label htmlFor="ai-project">Select project</label>
              <select
                id="ai-project"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                disabled={loading || projects.length === 0}
              >
                <option value="">
                  {projects.length ? "Choose a project" : "No projects available"}
                </option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
              {activeAction.id === "readme" && (
                <p>The README draft is based on the selected project details.</p>
              )}
            </>
          )}

          {error && <p className="ai-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : activeAction.button}
          </button>
        </form>

        {result && (
          <section className="ai-result">
            <div className="ai-result-heading">
              <h3>Generated Result</h3>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                Copy Result
              </button>
            </div>

            <pre>{result}</pre>
          </section>
        )}
      </section>
    </div>
  );
}

export default AIAssistant;