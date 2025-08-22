import React, { useState, useEffect, useMemo } from "react";
import { listenAllResumes } from "../services/firestore";
import LineCard from "../components/LineCard";
import DoughnutCard from "../components/DoughnutCard";

export default function Analytics() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    return listenAllResumes(setRows); // Realtime updates
  }, []);

  const trend = useMemo(() => {
    const byDay = {};
    rows.forEach(r => {
      const ts = r.createdAt?.toDate?.() || new Date();
      const k = ts.toISOString().slice(0,10);
      byDay[k] = (byDay[k] || 0) + 1;
    });
    return Object.entries(byDay)
      .sort()
      .map(([date, count]) => ({ label: date.slice(5), value: count }));
  }, [rows]);

  const skillFreq = useMemo(() => {
    const freq = {};
    rows.forEach(r => (r.parsed?.skills || []).forEach(s => {
      freq[s] = (freq[s] || 0) + 1;
    }));
    // top 8 skills
    return Object.fromEntries(Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0,8));
  }, [rows]);

  const bands = useMemo(() => {
    const distribution = { "80–100":0, "60–79":0, "40–59":0, "0–39":0 };
    rows.forEach(r => {
      const s = r.matchScore ?? -1;
      if (s >= 80) distribution["80–100"]++;
      else if (s >= 60) distribution["60–79"]++;
      else if (s >= 40) distribution["40–59"]++;
      else if (s >= 0) distribution["0–39"]++;
    });
    return distribution;
  }, [rows]);

  return (
    <div className="grid">
      <LineCard title="Uploads per day" points={trend} />
      <DoughnutCard title="Top skills" dataMap={skillFreq} />
      <DoughnutCard title="Match score distribution" dataMap={bands} />
    </div>
  );
}
