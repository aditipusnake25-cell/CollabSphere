import { useState } from "react";
import { apiRequest } from "../services/api";
import "../css/AIAssistant.css";

const aiActions = [
  {
    id: "explain-code",
    title: "Explain Code",
    description: "Understand complex code step by step.",
    placeholder: "Paste the code you want explained...",
    button: "Explain Code",
    field: "code",
  },
  {
    id: "generate-readme",
    title: "Generate README",
    description: "Create a README for your project.",
    placeholder: "Describe your project, its features and tech stack...",
    button: "Generate README",
    field: "projectDescription",
  },
  {
    id: "generate-documentation",
    title: "Generate Documentation",
    description: "Generate technical documentation.",
    placeholder: "Paste your code or describe the feature to document...",
    button: "Generate Documentation",
    field: "code",
  },
];

function AIAssistant() {
  const [activeAction, setActiveAction] = useState(aiActions[0]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!input.trim()) {
      setError("Please enter some code or project details.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const data = await apiRequest(`/ai/${activeAction.id}`, {
        method: "POST",
        body: JSON.stringify({
          [activeAction.field]: input.trim(),
        }),
      });

      const output =
        data.result ||
        data.explanation ||
        data.documentation ||
        data.readme ||
        data.response ||
        data.text;

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
          <label htmlFor="ai-input">
            Code or project details
          </label>

          <textarea
            id="ai-input"
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeAction.placeholder}
          />

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