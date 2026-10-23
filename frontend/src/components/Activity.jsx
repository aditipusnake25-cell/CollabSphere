import { useState } from "react";
import "../css/Activity.css";

function Activity() {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "Project",
      title: "Welcome to CollabSphere",
      description: "Your collaboration workspace is ready.",
      time: "Just now",
    },
    {
      id: 2,
      type: "AI Assistant",
      title: "AI tools available",
      description: "Explain code and generate project documentation.",
      time: "Today",
    },
  ]);

  const [filter, setFilter] = useState("All");

  function addActivity(type, title, description) {
    const newActivity = {
      id: Date.now(),
      type,
      title,
      description,
      time: new Date().toLocaleString(),
    };

    setActivities((previous) => [newActivity, ...previous]);
  }

  function clearActivities() {
    setActivities([]);
  }

  const filteredActivities =
    filter === "All"
      ? activities
      : activities.filter((activity) => activity.type === filter);

  return (
    <div className="activity-page">
      <header className="activity-header">
        <div>
          <h1>Recent Activity</h1>
          <p>Keep track of updates in your workspace.</p>
        </div>

        <button
          className="clear-activity-button"
          onClick={clearActivities}
          disabled={activities.length === 0}
        >
          Clear Activity
        </button>
      </header>

      <section className="activity-filters">
        {["All", "Project", "Note", "File", "AI Assistant"].map((item) => (
          <button
            key={item}
            className={filter === item ? "filter-button active" : "filter-button"}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </section>

      <section className="activity-list">
        {filteredActivities.length === 0 ? (
          <div className="activity-empty">
            <h3>No activities found</h3>
            <p>New updates will appear here.</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <article className="activity-item" key={activity.id}>
              <div className="activity-dot" />

              <div className="activity-details">
                <span className="activity-type">{activity.type}</span>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
                <small>{activity.time}</small>
              </div>
            </article>
          ))
        )}
      </section>

      <button
        className="demo-activity-button"
        onClick={() =>
          addActivity(
            "Project",
            "Test activity created",
            "This is a sample update to test the activity feed."
          )
        }
      >
        + Add Test Activity
      </button>
    </div>
  );
}

export default Activity;