import { useEffect, useState } from "react";
import { apiRequest, getProjectContributions } from "../services/api";
import "../css/Team.css";

function Team() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [email, setEmail] = useState("");
  const [contributions, setContributions] = useState({});
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const [projectData, profileData] = await Promise.all([
          apiRequest("/projects"),
          apiRequest("/auth/profile"),
        ]);
        if (!active) return;
        const projectList = Array.isArray(projectData.projects)
          ? projectData.projects
          : [];
        setProjects(projectList);
        setCurrentUserId(String(profileData.user?._id || profileData.user?.id || ""));
        setProjectId((current) =>
          projectList.some((project) => String(project._id) === current)
            ? current
            : String(projectList[0]?._id || "")
        );
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load project team information.");
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
      return;
    }
    let active = true;

    async function loadContributions() {
      setLoadingContributions(true);
      setError("");
      try {
        const next = await getProjectContributions(projectId);
        if (active) setContributions(next);
      } catch (requestError) {
        if (active) {
          setContributions({});
          setError(requestError.message || "Unable to load contribution analytics.");
        }
      } finally {
        if (active) setLoadingContributions(false);
      }
    }

    loadContributions();
    return () => {
      active = false;
    };
  }, [projectId]);

  const project = projects.find((item) => String(item._id) === projectId);
  const projectOwnerId = String(project?.createdBy?._id || project?.createdBy || "");
  const isOwner = projectOwnerId === currentUserId;
  const members = Array.isArray(project?.members) ? project.members : [];

  async function addMember(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!projectId || !email.trim()) {
      setError("Select a project and enter the member's email address.");
      return;
    }

    setAddingMember(true);
    try {
      const response = await apiRequest(`/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setEmail("");
      setMessage(response.message || "Team member added successfully.");
      setProjects((current) =>
        current.map((item) =>
          String(item._id) === projectId
            ? { ...item, members: response.members || item.members }
            : item
        )
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to add this team member.");
    } finally {
      setAddingMember(false);
    }
  }

  async function removeMember(member) {
    if (!window.confirm(`Remove ${member.name || "this member"} from ${project.name}?`)) return;
    const memberId = String(member._id || member.id);
    setError("");
    setMessage("");
    setRemovingMemberId(memberId);
    try {
      const response = await apiRequest(`/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      });
      setProjects((current) =>
        current.map((item) =>
          String(item._id) === projectId
            ? { ...item, members: item.members.filter((entry) => String(entry._id || entry.id) !== memberId) }
            : item
        )
      );
      setMessage(response.message || "Team member removed.");
    } catch (requestError) {
      setError(requestError.message || "Unable to remove this team member.");
    } finally {
      setRemovingMemberId("");
    }
  }

  return (
    <div className="team-page">
      <header className="team-header">
        <div>
          <span className="eyebrow">PEOPLE & CONTRIBUTIONS</span>
          <h1>Team Workspace</h1>
          <p>Invite project members and review their contributions.</p>
        </div>
      </header>

      {error && <p className="team-error" role="alert">{error}</p>}
      {message && <p className="team-success" role="status">{message}</p>}

      <section className="team-project-select">
        <label htmlFor="team-project">Select Project</label>
        <select
          id="team-project"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            setContributions({});
            setMessage("");
            setError("");
          }}
          disabled={loadingProjects || projects.length === 0}
        >
          <option value="">
            {loadingProjects ? "Loading projects..." : "Choose a project"}
          </option>
          {projects.map((item) => (
            <option key={item._id} value={item._id}>{item.name}</option>
          ))}
        </select>
      </section>

      {!loadingProjects && !project ? (
        <div className="team-empty">
          <h3>No project selected</h3>
          <p>Create or join a project to view its members.</p>
        </div>
      ) : (
        <>
          {isOwner && (
            <section className="team-invite-card">
              <h2><span className="form-heading-icon">＋</span> Invite a member</h2>
              <form onSubmit={addMember}>
                <label htmlFor="member-email">Member email address</label>
                <div>
                  <input
                    id="member-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={addingMember}
                    placeholder="name@example.com"
                  />
                  <button type="submit" disabled={addingMember}>
                    {addingMember ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="team-members-section">
            <h2>{project?.name || "Project"} Members</h2>
            {members.length === 0 ? (
              <div className="team-empty"><p>No members have been added.</p></div>
            ) : (
              <div className="team-grid">
                {members.map((member) => {
                  const id = String(member._id || member.id || member);
                  const stats = contributions[id] || { notes: 0, files: 0 };
                  const isProjectOwner = id === projectOwnerId;

                  return (
                    <article className="team-card" key={id}>
                      <div className="team-avatar">
                        {(member.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <h3>{member.name || "Project member"}</h3>
                      {member.email && <p>{member.email}</p>}
                      <span className="team-role">
                        {isProjectOwner ? "Owner" : "Member"}
                      </span>
                      <div className="team-contributions">
                        <span><strong>{loadingContributions ? "—" : stats.notes}</strong> notes</span>
                        <span><strong>{loadingContributions ? "—" : stats.files}</strong> files</span>
                      </div>
                      {isOwner && !isProjectOwner && (
                        <button
                          type="button"
                          className="team-remove-button"
                          onClick={() => removeMember(member)}
                          disabled={removingMemberId === id}
                        >
                          {removingMemberId === id ? "Removing..." : "Remove member"}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Team;
