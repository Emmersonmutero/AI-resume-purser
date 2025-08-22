import React, { useState, useEffect } from 'react';
import '../styles/ParsingResults.css';

const ParsingResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    const mockResults = [
      { id: 1, fileName: 'resume1.pdf', accuracy: 95, parsedFields: 50, totalFields: 53 },
      { id: 2, fileName: 'resume2.docx', accuracy: 88, parsedFields: 45, totalFields: 51 },
      { id: 3, fileName: 'resume3.txt', accuracy: 99, parsedFields: 52, totalFields: 53 },
    ];
    setResults(mockResults);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="parsing-results-page">
      <h1>AI Parsing Results</h1>
      <div className="results-list">
        {results.map((result) => (
          <div key={result.id} className="result-card">
            <div className="result-info">
              <h3 className="file-name">{result.fileName}</h3>
              <p className="accuracy">Accuracy: {result.accuracy}%</p>
              <p className="fields">Parsed Fields: {result.parsedFields} / {result.totalFields}</p>
            </div>
            <div className="result-actions">
              <button className="btn btn-secondary">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParsingResults;
