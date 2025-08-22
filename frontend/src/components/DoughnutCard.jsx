import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function DoughnutCard({ title, dataMap }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(dataMap),
        datasets: [{ data: Object.values(dataMap) }],
      },
      options: { plugins: { legend: { position: "bottom" } } },
    });
    return () => chart.destroy();
  }, [dataMap]);
  return (
    <div className="card">
      <div className="card__title">{title}</div>
      <canvas ref={ref} height="160" />
    </div>
  );
}
