import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function LineCard({ title, points }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, {
      type: "line",
      data: {
        labels: points.map(p => p.label),
        datasets: [{ data: points.map(p => p.value), fill: false, tension: 0.35 }]
      },
      options: { plugins: { legend: { display: false } } },
    });
    return () => chart.destroy();
  }, [points]);
  return (
    <div className="card">
      <div className="card__title">{title}</div>
      <canvas ref={ref} height="160" />
    </div>
  );
}
