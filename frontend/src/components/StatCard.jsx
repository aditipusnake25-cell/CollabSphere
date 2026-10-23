import "../css/StatCard.css";

function StatCard({ title, value = 0, icon = "◈", description = "" }) {
  return (
    <article className="stat-card">
      <div className="stat-card-heading">
        <span>{title}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>

      <h2>{value}</h2>

      {description && <p>{description}</p>}
    </article>
  );
}

export default StatCard;