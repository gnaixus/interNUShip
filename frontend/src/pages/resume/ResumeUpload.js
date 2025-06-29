import { useState } from 'react';

export default function ResumeUpload({ onParse = () => {} }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      onParse(data);

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".pdf,.docx"
        onChange={handleUpload}
        disabled={isLoading}
      />
      {isLoading && <p>Processing resume...</p>}
    </div>
  );
}

//ms2 final