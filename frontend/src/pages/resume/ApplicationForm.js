
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../../styles/Home.module.css';
import DataService from '../../services/dataService';

const ApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    firstName: '', // Extracted from profile.name 
    lastName: '', // Extracted from profile.name
    email: '', // Direct mapping from profile.email
    phone: '', // Direct mapping from profile.phone
    university: '', // From profile.university or education[0].institution
    major: '', // Direct mapping from profile.major
    graduationDate: '', // Extracted from education[0].period
    gpa: '', // Extracted from education[0].gpa
    skills: [], // Direct mapping from profile.skills
    linkedinUrl: '', // Not in profile (manual entry)
    githubUrl: '', // Not in profile (manual entry)
    portfolioUrl: '', // Not in profile (manual entry)
    resumeFile: null, // File upload (separate from profile)
    coverLetter: '', // Application-specific content
    availability: '', // Application-specific content
    relevantExperience: '' // Generated from profile.experience array
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isProfileSynced, setIsProfileSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const skillOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'Java',
    'C++', 'SQL', 'Git', 'AWS', 'Docker', 'MongoDB', 'Express',
    'TypeScript', 'Vue.js', 'Angular', 'PHP', 'Ruby', 'Go', 'Rust',
    'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Project Management',
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork'
  ];

  // Auto-sync profile data on component mount and when user changes
  useEffect(() => {
    if (user && user.email) {
      // Set basic user info from auth context
      setFormData(prev => ({
        ...prev,
        email: user.email,
        firstName: user.full_name?.split(' ')[0] || '',
        lastName: user.full_name?.split(' ').slice(1).join(' ') || ''
      }));
      
      // Automatically sync profile data when component loads
      syncFromProfile();
    }
  }, [user]);

  // Enhanced sync function that handles the Profile component's data structure
  const syncFromProfile = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      const response = await getUserProfileData();
      
      if (response.success) {
        const profile = response.data;
        setProfileData(profile);
        
        // Enhanced profile sync that maps Profile component structure to ApplicationForm structure
        const nameParts = profile.name ? profile.name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Extract GPA from education array if available
        const primaryEducation = profile.education && profile.education.length > 0 ? profile.education[0] : null;
        const gpaValue = primaryEducation?.gpa ? primaryEducation.gpa.replace(/[^0-9.]/g, '') : '';
        
        // Extract graduation date from education period if available
        let graduationDate = '';
        if (primaryEducation?.period) {
          const periodMatch = primaryEducation.period.match(/(\d{4})/g);
          if (periodMatch && periodMatch.length > 1) {
            graduationDate = `${periodMatch[1]}-06-01`; // Assume June graduation
          }
        }
        
        // Convert experience array to relevant experience text
        const relevantExperienceText = profile.experience && profile.experience.length > 0
          ? profile.experience.map(exp => 
              `${exp.title} at ${exp.company} (${exp.duration}): ${exp.description}`
            ).join('\n\n')
          : '';

        setFormData(prev => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
          university: profile.university || (primaryEducation?.institution) || prev.university,
          major: profile.major || prev.major,
          graduationDate: graduationDate || prev.graduationDate,
          gpa: gpaValue || prev.gpa,
          skills: profile.skills && profile.skills.length > 0 ? profile.skills : prev.skills,
          // Keep existing values for fields not in Profile component
          linkedinUrl: prev.linkedinUrl,
          githubUrl: prev.githubUrl,
          portfolioUrl: prev.portfolioUrl,
          availability: prev.availability,
          relevantExperience: relevantExperienceText || prev.relevantExperience
        }));
        
        setIsProfileSynced(true);
        console.log('Profile synced successfully:', profile);
      } else {
        throw new Error(response.error || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error syncing profile:', error);
      setErrors(prev => ({ 
        ...prev, 
        sync: 'Failed to sync profile data. Please try again.' 
      }));
    } finally {
      setIsSyncing(false);
    }
  };

  // Function to get actual profile data from your existing Profile component structure
  const getUserProfileData = async () => {
    try {
      console.log('Attempting to get profile data...');
      
      // Option 1: Get data from localStorage if Profile component saves there
      const savedProfileData = localStorage.getItem('userProfileData');
      console.log('Raw localStorage data:', savedProfileData);
      
      if (savedProfileData) {
        try {
          const profileData = JSON.parse(savedProfileData);
          console.log('Parsed profile data from localStorage:', profileData);
          return { success: true, data: profileData };
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
        }
      }

      // Option 2: Use the existing DataService but expect Profile component structure
      console.log('Trying DataService...');
      try {
        const response = await DataService.getUserProfile(user.id);
        console.log('DataService response:', response);
        if (response.success) {
          return response;
        }
      } catch (serviceError) {
        console.error('DataService error:', serviceError);
      }

      // Option 3: Fallback to basic user data from auth context
      console.log('Using fallback basic profile data');
      const basicProfileData = {
        name: user?.full_name || '',
        email: user?.email || '',
        phone: '',
        university: '',
        major: '',
        year: '',
        location: '',
        bio: '',
        skills: [],
        experience: [],
        education: [],
        resumeUploaded: false,
        lastUpdated: new Date().toLocaleDateString()
      };
      
      return { success: true, data: basicProfileData };
    } catch (error) {
      console.error('Error fetching profile data:', error);
      return { success: false, error: error.message };
    }
  };

  // Manual sync function for user-triggered sync
  const handleManualSync = async () => {
    await syncFromProfile();
  };

  // Reset to profile data with enhanced mapping
  const resetToProfile = () => {
    if (profileData) {
      const nameParts = profileData.name ? profileData.name.split(' ') : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const primaryEducation = profileData.education && profileData.education.length > 0 ? profileData.education[0] : null;
      const gpaValue = primaryEducation?.gpa ? primaryEducation.gpa.replace(/[^0-9.]/g, '') : '';
      
      let graduationDate = '';
      if (primaryEducation?.period) {
        const periodMatch = primaryEducation.period.match(/(\d{4})/g);
        if (periodMatch && periodMatch.length > 1) {
          graduationDate = `${periodMatch[1]}-06-01`;
        }
      }
      
      const relevantExperienceText = profileData.experience && profileData.experience.length > 0
        ? profileData.experience.map(exp => 
            `${exp.title} at ${exp.company} (${exp.duration}): ${exp.description}`
          ).join('\n\n')
        : '';

      setFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        email: profileData.email || user?.email || '',
        phone: profileData.phone || '',
        university: profileData.university || (primaryEducation?.institution) || '',
        major: profileData.major || '',
        graduationDate: graduationDate,
        gpa: gpaValue,
        skills: profileData.skills || [],
        linkedinUrl: '', // Not available in Profile component
        githubUrl: '', // Not available in Profile component
        portfolioUrl: '', // Not available in Profile component
        availability: '',
        relevantExperience: relevantExperienceText
      }));
      setErrors({}); // Clear any validation errors
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resumeFile: 'File size must be less than 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, resumeFile: file }));
      setErrors(prev => ({ ...prev, resumeFile: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.university.trim()) newErrors.university = 'University is required';
    if (!formData.major.trim()) newErrors.major = 'Major is required';
    if (!formData.graduationDate) newErrors.graduationDate = 'Graduation date is required';
    if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill';
    if (!formData.resumeFile) newErrors.resumeFile = 'Resume is required';
    if (!formData.coverLetter.trim()) newErrors.coverLetter = 'Cover letter is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'skills') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'resumeFile' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Add job application ID if available
      if (id) {
        submitData.append('jobId', id);
      }

      const response = await DataService.submitApplication(submitData);
      
      if (response.success) {
        setSubmitted(true);
        // Optionally navigate to success page
        // navigate('/applications/success');
      } else {
        setErrors({ submit: response.message || 'Failed to submit application' });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'An error occurred while submitting your application' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <h2>Application Submitted Successfully!</h2>
          <p>Thank you for your application. We'll review it and get back to you soon.</p>
          <button 
            onClick={() => navigate('/applications')}
            className={styles.ctaPrimary}
          >
            View My Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.userHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.userInfo}>
            <span>📝 Application Form</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.profileBtn} onClick={() => navigate('/profile')}>Profile</button>
          <button className={styles.logoutBtn} onClick={() => navigate('/internships')}>Back to Browse</button>
        </div>
      </div>

      {/* Application Header */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Internship Application</h1>
        <p className={styles.heroSubtitle}>
          Application ID: {id}
        </p>
        
        {/* Enhanced Profile Sync Controls */}
        <div style={{ 
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {isProfileSynced && (
            <span className={styles.badge} style={{ backgroundColor: 'var(--success-color)' }}>
              ✅ Profile synced
            </span>
          )}
          
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className={styles.ctaSecondary}
          >
            {isSyncing ? 'Syncing...' : (isProfileSynced ? 'Re-sync Profile' : 'Sync from Profile')}
          </button>
          
          {profileData && isProfileSynced && (
            <button
              type="button"
              onClick={resetToProfile}
              className={styles.ctaSecondary}
              style={{ backgroundColor: 'var(--warning-color)' }}
            >
              Reset to Profile
            </button>
          )}
        </div>
        
        {errors.sync && (
          <div style={{ 
            marginTop: '1rem', 
            color: 'var(--error-color)', 
            textAlign: 'center',
            fontWeight: '500'
          }}>
            ⚠️ {errors.sync}
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className={styles.applicationForm}>
        {/* Personal Information */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>👤 Personal Information</h2>
            <p>Tell us about yourself</p>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.firstName ? styles.inputError : ''} ${
                  isProfileSynced && profileData?.name ? styles.inputSynced : ''
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className={styles.errorText}>⚠️ {errors.firstName}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.lastName ? styles.inputError : ''} ${
                  isProfileSynced && profileData?.name ? styles.inputSynced : ''
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className={styles.errorText}>⚠️ {errors.lastName}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.email ? styles.inputError : ''} ${
                  isProfileSynced && profileData?.email ? styles.inputSynced : ''
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className={styles.errorText}>⚠️ {errors.email}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.phone ? styles.inputError : ''} ${
                  isProfileSynced && profileData?.phone ? styles.inputSynced : ''
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className={styles.errorText}>⚠️ {errors.phone}</p>
              )}
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>🎓 Academic Information</h2>
            <p>Your educational background</p>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>University *</label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.university ? styles.inputError : ''} ${
                  isProfileSynced && (profileData?.university || profileData?.education?.[0]?.institution) ? styles.inputSynced : ''
                }`}
                placeholder="Enter your university"
              />
              {errors.university && (
                <p className={styles.errorText}>⚠️ {errors.university}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Major *</label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.major ? styles.inputError : ''} ${
                  isProfileSynced && profileData?.major ? styles.inputSynced : ''
                }`}
                placeholder="Enter your major"
              />
              {errors.major && (
                <p className={styles.errorText}>⚠️ {errors.major}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Expected Graduation Date *</label>
              <input
                type="date"
                name="graduationDate"
                value={formData.graduationDate}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.graduationDate ? styles.inputError : ''} ${
                  isProfileSynced && profileData?.education?.[0]?.period ? styles.inputSynced : ''
                }`}
              />
              {errors.graduationDate && (
                <p className={styles.errorText}>⚠️ {errors.graduationDate}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>GPA (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                name="gpa"
                value={formData.gpa}
                onChange={handleInputChange}
                className={`${styles.formInput} ${
                  isProfileSynced && profileData?.education?.[0]?.gpa ? styles.inputSynced : ''
                }`}
                placeholder="e.g. 3.75"
              />
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>💻 Skills *</h2>
            <p>Select your technical and soft skills</p>
          </div>
          
          <div className={styles.skillsGrid}>
            {skillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`${styles.skillTag} ${
                  formData.skills.includes(skill) ? styles.skillTagActive : ''
                } ${
                  isProfileSynced && profileData?.skills?.includes(skill) ? styles.skillSynced : ''
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {errors.skills && (
            <p className={styles.errorText}>⚠️ {errors.skills}</p>
          )}
        </section>

        {/* Professional Links */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>🔗 Professional Links</h2>
            <p>Share your online presence (optional)</p>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>LinkedIn URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="https://github.com/..."
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Portfolio URL</label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </section>

        {/* Resume Upload */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>📄 Resume Upload *</h2>
            <p>Upload your latest resume</p>
          </div>
          
          <div className={styles.fileUploadArea}>
            {formData.resumeFile ? (
              <div className={styles.uploadedFile}>
                <div className={styles.fileInfo}>
                  <div className={styles.fileIcon}>📄</div>
                  <div>
                    <p className={styles.fileName}>{formData.resumeFile.name}</p>
                    <p className={styles.fileSize}>
                      {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, resumeFile: null }))}
                  className={styles.removeFileBtn}
                >
                  ❌
                </button>
              </div>
            ) : (
              <div className={styles.uploadPrompt}>
                <div className={styles.uploadIcon}>📤</div>
                <label className={styles.uploadLabel}>
                  <span className={styles.uploadText}>Click to upload</span>
                  <span className={styles.uploadSubtext}> or drag and drop</span>
                  <input
                    type="file"
                    className={styles.hiddenInput}
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className={styles.uploadHint}>PDF, DOC, or DOCX up to 5MB</p>
              </div>
            )}
          </div>
          {errors.resumeFile && (
            <p className={styles.errorText}>⚠️ {errors.resumeFile}</p>
          )}
        </section>

        {/* Cover Letter */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>✍️ Cover Letter *</h2>
            <p>Tell us why you're the perfect fit</p>
          </div>
          
          <div className={styles.inputGroup}>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              rows={6}
              className={`${styles.formTextarea} ${errors.coverLetter ? styles.inputError : ''}`}
              placeholder="Tell us why you're interested in this internship and what makes you a great fit..."
              maxLength={1000}
            />
            {errors.coverLetter && (
              <p className={styles.errorText}>⚠️ {errors.coverLetter}</p>
            )}
            <div className={styles.characterCount}>
              <span>{formData.coverLetter.length}/1000 characters</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Keep it engaging!</span>
            </div>
          </div>
        </section>

        {/* Additional Questions */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2>⏰ Additional Information</h2>
            <p>Help us understand your availability and experience</p>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Availability</label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className={styles.formSelect}
              >
                <option value="">Select your availability</option>
                <option value="full-time">Full-time (40+ hours/week)</option>
                <option value="part-time">Part-time (20-30 hours/week)</option>
                <option value="flexible">Flexible schedule</option>
              </select>
            </div>

            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.inputLabel}>Relevant Experience (Optional)</label>
              <textarea
                name="relevantExperience"
                value={formData.relevantExperience}
                onChange={handleInputChange}
                rows={4}
                className={`${styles.formTextarea} ${
                  isProfileSynced && profileData?.experience?.length > 0 ? styles.inputSynced : ''
                }`}
                placeholder="Describe any relevant work experience, projects, or achievements..."
              />
            </div>
          </div>
        </section>

        {/* Submit Section */}
        <div className={styles.submitSection}>
          <div className={styles.submitInfo}>
            <div className={styles.requiredNote}>
              ⚠️ All fields marked with * are required
            </div>
            
            <div className={styles.submitActions}>
              <button
                type="button"
                onClick={() => window.history.back()}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${styles.ctaPrimary} ${isSubmitting ? styles.submitting : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner}></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    ✨ Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Submit errors */}
        {errors.submit && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            backgroundColor: 'var(--error-background)',
            color: 'var(--error-color)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            ⚠️ {errors.submit}
          </div>
        )}
      </form>
    </div>
  );
};

export default ApplicationForm;