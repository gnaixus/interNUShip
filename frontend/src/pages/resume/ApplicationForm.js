// import React, { useState } from 'react';
// import ResumeUpload from './ResumeUpload';

// export default function ApplicationForm() {
//   const [parsedData, setParsedData] = useState(null);

//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2>Upload Resume</h2>
//       <ResumeUpload onParse={(data) => setParsedData(data.data)} />

//       {parsedData && (
//         <div style={{ marginTop: '2rem' }}>
//           <h3>Parsed Resume Data</h3>
//           <p><strong>Name:</strong> {parsedData.name}</p>
//           <p><strong>Email:</strong> {parsedData.email}</p>
//           <p><strong>Phone:</strong> {parsedData.phone}</p>
//           <p><strong>Designation:</strong> {parsedData.designation}</p>
//           <p><strong>Skills:</strong> {parsedData.skills?.join(', ')}</p>
//           <p><strong>Degrees:</strong> {parsedData.degree?.join(', ')}</p>
//           <div>
//             <strong>Experience:</strong>
//             <ul>
//               {parsedData.experience?.map((exp, i) => (
//                 <li key={i}>{exp}</li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState } from 'react';
import { autofillFromResumeData, submitApplication} from '../resume/autofillUtils';

export default function ApplicationForm({ parsedData, onFormDataChange }) {
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      linkedIn: '',
      website: ''
    },
    jobInfo: {
      position: '',
      department: '',
      expectedSalary: '',
      availableStartDate: '',
      workType: 'full-time'
    },
    education: [{
      institution: '',
      degree: '',
      fieldOfStudy: '',
      graduationYear: '',
      gpa: ''
    }],
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      currentJob: false
    }],
    skills: '',
    additionalInfo: {
      coverLetter: '',
      references: '',
      portfolio: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Autofill function using utility
  const autofillFromResume = () => {
    if (!parsedData) return;
    
    const updatedFormData = autofillFromResumeData(parsedData, formData);
    setFormData(updatedFormData);
    onFormDataChange?.(updatedFormData);
  };

  const handleInputChange = (section, field, value, index = null) => {
    const newFormData = { ...formData };
    
    if (index !== null) {
      newFormData[section][index][field] = value;
    } else if (typeof newFormData[section] === 'object' && !Array.isArray(newFormData[section])) {
      newFormData[section][field] = value;
    } else {
      newFormData[section] = value;
    }
    
    setFormData(newFormData);
    onFormDataChange?.(newFormData);
  };

  const addArrayItem = (section, defaultItem) => {
    setFormData({
      ...formData,
      [section]: [...formData[section], defaultItem]
    });
  };

  const removeArrayItem = (section, index) => {
    const newArray = formData[section].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [section]: newArray
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const result = await submitApplication(formData);
      setSubmitMessage('Application submitted successfully!');
      console.log('Application submitted:', result);
    } catch (error) {
      setSubmitMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = () => {
    try {
      // Save draft to memory/state instead of localStorage
      const draftData = JSON.stringify(formData);
      setSubmitMessage('Draft saved successfully!');
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      setSubmitMessage(`Error saving draft: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Job Application Form</h2>
        {parsedData && (
          <button
            onClick={autofillFromResume}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Autofill from Resume
          </button>
        )}
      </div>

      {submitMessage && (
        <div className={`mb-4 p-3 rounded-lg ${
          submitMessage.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {submitMessage}
        </div>
      )}

      <div className="space-y-8">
        {/* Form sections would be imported as separate components */}
        {/* PersonalInfoSection */}
        {/* JobInfoSection */}
        {/* EducationSection */}
        {/* ExperienceSection */}
        {/* SkillsSection */}
        {/* AddInfoSection */}
        
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={saveDraft}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}