import React, { useState } from "react";
import { apiSemanticSearch } from "../services/api";

export default function Search() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const doSearch = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const { results } = await apiSemanticSearch(q.trim(), 30);
      setRows(results);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 className="h2">Semantic Search</h2>
      <form className="row mt-2" onSubmit={doSearch}>
        <input
          className="input"
          placeholder="e.g., Senior React engineer with GraphQL and AWS"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn" disabled={busy} type="submit">{busy ? "Searching…" : "Search"}</button>
      </form>
      {err && <div className="alert mt-2">{err}</div>}
      <div className="grid mt-3">
        {rows.map(r => (
          <div className="card" key={r.id}>
            <div className="row between">
              <div className="card__title">{r.fileName || r.id}</div>
              <div className="badge">Similarity {(r.sim * 100).toFixed(1)}%</div>
            </div>
            <div className="muted mt-1">Skills: {r.skills?.slice(0, 12).join(", ") || "—"}</div>
            {r.matchScore != null && <div className="badge mt-2">JD Match: {r.matchScore}%</div>}
            {r.url && (
              <a className="btn btn--ghost mt-2" href={r.url} target="_blank" rel="noreferrer">
                Open file
              </a>
            )}
          </div>
        ))}
      </div>
      {rows.length === 0 && <div className="muted mt-3">Try a query like: “Python data engineer ETL Airflow GCP”.</div>}
    </div>
  );
}
