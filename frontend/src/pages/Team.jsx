import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import "../css/Team.css";

function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMembers() {
      try {
        setError("");

        // Team members are loaded from the authenticated user's profile.
        const data = await apiRequest("/auth/me");

        const user = data.user || data;

        setMembers(
          user
            ? [
                {
                  id: user._id || user.id,
                  name: user.name || "Current User",
                  email: user.email || "",
                  role: user.role || "Member",
                },
              ]
            : []
        );
      } catch (err) {
        setError(err.message || "Unable to load team information.");
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  return (
    <div className="team-page">
      <header className="team-header">
        <div>
          <h1>Team Workspace</h1>
          <p>View your account information and collaboration access.</p>
        </div>
      </header>

      {error && <p className="team-error">{error}</p>}

      {loading ? (
        <p>Loading team information...</p>
      ) : members.length === 0 ? (
        <div className="team-empty">
          <h3>No member information available</h3>
        </div>
      ) : (
        <div className="team-grid">
          {members.map((member) => (
            <article className="team-card" key={member.id}>
              <div className="team-avatar">
                {(member.name || "U").charAt(0).toUpperCase()}
              </div>

              <h3>{member.name}</h3>
              <p>{member.email}</p>
              <span className="team-role">{member.role}</span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Team;