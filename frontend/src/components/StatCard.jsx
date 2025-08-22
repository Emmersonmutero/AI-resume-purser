import React from "react";

export default function StatCard({ title, value, hint }) {
  return (
    <div className="stat-card">
      <h4 className="stat-card__title">{title}</h4>
      <p className="stat-card__value">{value}</p>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </div>
  );
}
