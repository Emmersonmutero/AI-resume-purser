import React, { useState } from "react";
import { uploadAndProcessResume, listenAllResumes } from "../services/resumeService";
import { useOutletContext } from "react-router-dom";

import Dropzone from "../components/ui/Dropzone";

export default function UploadResumes() {
  const [file, setFile] = useState(null);
  const { resumes, handleResumeClick, jd } = useOutletContext();

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");
    if (!jd.trim()) return alert("Please provide a job description first");
    try {
      await uploadAndProcessResume(file, jd);
      alert("Resume uploaded and processed successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload and processing failed");
    }
  };

  return (
    <div className="upload-tab">
      <Dropzone onFileDrop={setFile} />
      {file && (
        <div className="file-preview">
          <p>Selected file: {file.name}</p>
          <button onClick={() => setFile(null)}>Clear</button>
        </div>
      )}
      <button onClick={handleUpload} disabled={!file || !jd.trim()}>
        Upload and Process Resume
      </button>

      <div className="resume-list">
        {resumes.length === 0 && <p>No resumes uploaded yet.</p>}
        {resumes.map(r => (
          <div key={r.id} className="resume-card" onClick={() => handleResumeClick(r)}>
            <h4>
              {r.parsedResume?.contact?.fullName || r.fileName || "No Name"}{" "}
              {r.isNew && <span className="resume-new-badge">New</span>}
            </h4>
            <p>Skills: {r.parsedResume?.skills?.join(", ") || "—"}</p>
            <p>Match Score: {r.matchScore != null ? r.matchScore + "%" : "N/A"}</p>
            {r.status && <p>Status: {r.status}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
