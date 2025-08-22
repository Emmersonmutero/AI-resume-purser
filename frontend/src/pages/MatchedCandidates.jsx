import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

export default function MatchedCandidates() {
  const { resumes, handleResumeClick } = useOutletContext();
  
  const sorted = useMemo(
    () => [...resumes].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)),
    [resumes]
  );

  return (
    <div className="matches-tab">
      {sorted.length === 0 && <p className="muted">No resumes uploaded yet.</p>}
      {sorted.map(r => (
        <div
          key={r.id}
          className={`resume-card ${r.matchScore > 50 ? "high-match" : ""}`}
          onClick={() => handleResumeClick(r)}
        >
          <h4>
            {r.parsedResume?.contact?.fullName || r.fileName || "No Name"}{" "}
            {r.isNew && <span className="resume-new-badge">New</span>}
          </h4>
          <p>Skills: {r.parsedResume?.skills?.join(", ") || "—"}</p>
          <p>Match Score: {r.matchScore != null ? r.matchScore + "%" : "N/A"}</p>
        </div>
      ))}
    </div>
  );
}
