import React, { useState } from 'react';
import ResumeUpload from './ResumeUpload';

export default function AppContent() {
  const [parsedData, setParsedData] = useState(null);

  return (
    <div>
      <h1>Welcome to Your App</h1>

      <ResumeUpload onParse={(data) => setParsedData(data.data)} />

      {parsedData && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Parsed Resume Data</h3>
          <p><strong>Name:</strong> {parsedData.name}</p>
          <p><strong>Email:</strong> {parsedData.email}</p>
          <p><strong>Phone:</strong> {parsedData.phone}</p>
          <p><strong>Designation:</strong> {parsedData.designation}</p>
          <p><strong>Skills:</strong> {parsedData.skills?.join(', ')}</p>
          <p><strong>Degrees:</strong> {parsedData.degree?.join(', ')}</p>
          <div>
            <strong>Experience:</strong>
            <ul>
              {parsedData.experience?.map((exp, i) => (
                <li key={i}>{exp}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}