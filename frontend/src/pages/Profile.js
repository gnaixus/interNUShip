import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Profile.module.css';
import { Upload, Edit3, Save, X, Plus, Trash2, FileText, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award } from 'lucide-react';
import { processPDFResume } from './resume/pdf.js'

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [parsing, setParsing] = useState(false);
  const [newSkill, setNewSkill] = useState('')
  const fileInputRef = useRef(null);

  // Profile state
  const [draftSaved, setDraftSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Function to get initial profile data (checks localStorage first)
  const getInitialProfileData = () => {
    try {
      const savedProfile = localStorage.getItem('userProfileData');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('🔄 Loading saved profile on init:', parsedProfile);
        return {
          ...parsedProfile,
          // Ensure user data from auth context is preserved
          name: parsedProfile.name || user?.full_name || '',
          email: parsedProfile.email || user?.email || ''
        };
      }
    } catch (error) {
      console.error('❌ Error loading saved profile on init:', error);
    }
    
    return {
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
    };
  };

  
  // Use lazy state initialization to load saved data immediately
  const [profileData, setProfileData] = useState(getInitialProfileData);
  // Add a separate state to store the original data for canceling edits
  const [originalData, setOriginalData] = useState(null);

  // Local state for inputs to prevent re-rendering issues
  const [localInputs, setLocalInputs] = useState({
    email: '',
    phone: '',
    name: '',
    major: '',
    university: '',
    location: '',
    bio: ''
  });

  // Sync local inputs with profile data when editing starts/stops
  useEffect(() => {
    if (isEditing) {
      setLocalInputs({
        email: profileData.email || '',
        phone: profileData.phone || '',
        name: profileData.name || '',
        major: profileData.major || '',
        university: profileData.university || '',
        location: profileData.location || '',
        bio: profileData.bio || ''
      });
    }
  }, [isEditing, profileData.email, profileData.phone, profileData.name, profileData.major, profileData.university, profileData.location, profileData.bio]);

  // Handle local input changes
  const handleLocalInputChange = useCallback((field, value) => {
    setLocalInputs(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Apply local changes to profile data
  const applyLocalChanges = useCallback(() => {
    setProfileData(prev => ({
      ...prev,
      ...localInputs
    }));
  }, [localInputs]);

  // Fixed updateField function to prevent re-rendering issues
  const updateField = useCallback((field, value) => {
    setProfileData(prev => {
      if (prev[field] === value) {
        return prev; // Prevent unnecessary re-renders
      }
      return {
        ...prev,
        [field]: value
      };
    });
  }, []);

  // useEffect to sync with user changes and load saved data
  useEffect(() => {
    console.log('🔄 Profile component mounted, checking for saved data...');
    
    const savedProfile = localStorage.getItem('userProfileData');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('📁 Found saved profile:', parsedProfile);
        const updatedProfile = {
          ...parsedProfile,
          // Update with latest user info from auth context if available
          name: parsedProfile.name || user?.full_name || '',
          email: parsedProfile.email || user?.email || ''
        };
        setProfileData(updatedProfile);
        setOriginalData(updatedProfile); // Store original data for cancel functionality
      } catch (error) {
        console.error('❌ Error loading saved profile:', error);
      }
    } else {
      // If no saved data, store current state as original
      setOriginalData(profileData);
    }
  }, [user?.id]);

  const navigationItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/about', label: 'About', icon: '🏢' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Start editing - store current data as original
  const handleStartEditing = () => {
    setOriginalData({ ...profileData }); // Deep copy current data
    setIsEditing(true);
  };

  // Cancel editing - restore original data
  const handleCancelEditing = () => {
    if (originalData) {
      setProfileData({ ...originalData }); // Restore original data
    }
    setIsEditing(false);
    setNewSkill(''); // Reset new skill input
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setUploading(true);
    setParsing(true);

    try {
      console.log('Processing PDF resume...');
      const result = await processPDFResume(file);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const parsedData = result.data;
      console.log('Parsed data:', parsedData);
      
      const updatedProfile = {
        ...profileData,
        name: parsedData.name && parsedData.name.trim() ? parsedData.name : profileData.name,
        email: parsedData.email && parsedData.email.trim() ? parsedData.email : profileData.email,
        phone: parsedData.phone && parsedData.phone.trim() ? parsedData.phone : profileData.phone,
        location: parsedData.location && parsedData.location.trim() ? parsedData.location : profileData.location,
        skills: parsedData.skills && parsedData.skills.length > 0 ? parsedData.skills : profileData.skills,
        experience: parsedData.experience && parsedData.experience.length > 0 ? parsedData.experience : profileData.experience,
        education: parsedData.education && parsedData.education.length > 0 ? parsedData.education : profileData.education,
        resumeUploaded: true,
        lastUpdated: new Date().toLocaleDateString()
      };

      setProfileData(updatedProfile);
      setOriginalData(updatedProfile); // Update original data too
      localStorage.setItem('userProfileData', JSON.stringify(updatedProfile));
      console.log('✅ Auto-saved parsed resume data');

      const updatedFields = [];
      if (parsedData.name) updatedFields.push('name');
      if (parsedData.email) updatedFields.push('email');
      if (parsedData.phone) updatedFields.push('phone');
      if (parsedData.location) updatedFields.push('location');
      if (parsedData.skills?.length > 0) updatedFields.push('skills');
      if (parsedData.experience?.length > 0) updatedFields.push('experience');
      if (parsedData.education?.length > 0) updatedFields.push('education');
      
      if (updatedFields.length > 0) {
        alert(`Resume parsed and saved! Updated: ${updatedFields.join(', ')}. Please review and edit the information.`);
        setIsEditing(true);
      } else {
        alert('Resume uploaded but no information could be extracted. Please check if the PDF contains readable text.');
      }
      
    } catch (error) {
      console.error('Error processing resume:', error);
      alert(`Failed to parse resume: ${error.message}. Please ensure the PDF contains readable text.`);
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  // ✅ Enhanced save function with validation and verification
  const handleSaveProfile = () => {
    try {
      // Apply local changes first
      applyLocalChanges();
      
      const finalData = {
        ...profileData,
        ...localInputs
      };

      if (!finalData.name?.trim()) {
        alert('Name is required');
        return;
      }
      if (!finalData.email?.trim()) {
        alert('Email is required');
        return;
      }

      setIsEditing(false);
      const updatedProfile = {
        ...finalData,  
        lastUpdated: new Date().toLocaleDateString(),
        savedAt: Date.now()
      };
      
      setProfileData(updatedProfile);
      setOriginalData(updatedProfile); // Update original data after successful save
      localStorage.setItem('userProfileData', JSON.stringify(updatedProfile));
      
      const savedData = localStorage.getItem('userProfileData');
      if (savedData) {
        console.log('✅ Profile saved successfully');
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to save to localStorage');
      }
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const addSkill = () => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: '',
      company: '',
      duration: '',
      description: ''
    };
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      institution: '',
      degree: '',
      period: '',
      gpa: ''
    };
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Improved EditableField component with better key handling
  const EditableField = React.memo(({ value, onChange, multiline = false, placeholder = "", type = "text" }) => {
    if (!isEditing) {
      return <span className={styles.contactValue}>{value || 'Not provided'}</span>;
    }
    
    const handleChange = (e) => {
      const newValue = e.target.value;
      onChange(newValue);
    };

    if (multiline) {
      return (
        <textarea
          key={`textarea-${placeholder}`}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className={styles.editTextarea}
          rows={3}
          autoComplete="off"
        />
      );
    }
    
    return (
      <input
        key={`input-${placeholder}-${type}`}
        type={type}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.editInput}
        autoComplete="off"
        spellCheck="false"
      />
    );
  });

  return (
    <div className={styles.profileContainer}>
      {/* Header */}
      <div className={styles.userHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.userInfo}>
            <span>👤 {profileData.name || 'User Profile'}</span>
          </div>
          <ul className={styles.navItems}>
            {navigationItems.map(item => (
              <li key={item.path}>
                <button
                  className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <section className={styles.profileHeader}>
        <div className={styles.profileCover}>
          <div className={styles.profileAvatarSection}>
            <div className={styles.profileAvatar}>
              <span className={styles.avatarText}>
                {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : '?'}
              </span>
            </div>
            <div className={styles.profileBasicInfo}>
              {isEditing ? (
                <input
                  type="text"
                  value={localInputs.name}
                  onChange={(e) => handleLocalInputChange('name', e.target.value)}
                  className={styles.editInput}
                  placeholder="Full Name"
                  autoComplete="off"
                />
              ) : (
                <h1 className={styles.profileName}>{profileData.name || 'Name not set'}</h1>
              )}
              <p className={styles.profileTitle}>
                {isEditing ? (
                  <input
                    type="text"
                    value={localInputs.major}
                    onChange={(e) => handleLocalInputChange('major', e.target.value)}
                    className={styles.editInput}
                    placeholder="Major"
                    autoComplete="off"
                  />
                ) : (
                  profileData.major || 'Major not set'
                )} Student at {isEditing ? (
                  <input
                    type="text"
                    value={localInputs.university}
                    onChange={(e) => handleLocalInputChange('university', e.target.value)}
                    className={styles.editInput}
                    placeholder="University"
                    autoComplete="off"
                  />
                ) : (
                  profileData.university || 'University not set'
                )}
              </p>
              <div className={styles.profileLocation}>
                <MapPin size={16} />
                {isEditing ? (
                  <input
                    type="text"
                    value={localInputs.location}
                    onChange={(e) => handleLocalInputChange('location', e.target.value)}
                    className={styles.editInput}
                    placeholder="Location"
                    autoComplete="off"
                  />
                ) : (
                  `📍 ${profileData.location || 'Location not set'}`
                )}
              </div>
            </div>
          </div>
          <div className={styles.profileActions}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className={`${styles.btn} ${styles['btn-primary']}`} onClick={handleSaveProfile}>
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  Save Changes
                </button>
                <button className={`${styles.btn} ${styles['btn-secondary']}`} onClick={handleCancelEditing}>
                  <X size={16} style={{ marginRight: '0.5rem' }} />
                  Cancel
                </button>
              </div>
            ) : (
              <button className={`${styles.btn} ${styles['btn-secondary']}`} onClick={handleStartEditing}>
                <Edit3 size={16} style={{ marginRight: '0.5rem' }} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area - Unified Scroll */}
      <div className={styles.profileContent}>
        {/* Left Sidebar */}
        <div className={styles.profileSidebar}>
          {/* Contact Info Card */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>
              <Mail size={20} style={{ color: 'var(--purple-light)' }} />
              Contact Information
            </h3>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📧</span>
              <div>
                <p className={styles.contactLabel}>Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={localInputs.email}
                    onChange={(e) => handleLocalInputChange('email', e.target.value)}
                    placeholder="Email address"
                    className={styles.editInput}
                    autoComplete="off"
                    spellCheck="false"
                  />
                ) : (
                  <span className={styles.contactValue}>{profileData.email || 'Not provided'}</span>
                )}
              </div>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📱</span>
              <div>
                <p className={styles.contactLabel}>Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={localInputs.phone}
                    onChange={(e) => handleLocalInputChange('phone', e.target.value)}
                    placeholder="Phone number"
                    className={styles.editInput}
                    autoComplete="off"
                    spellCheck="false"
                  />
                ) : (
                  <span className={styles.contactValue}>{profileData.phone || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Resume Upload Card */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>
              <FileText size={20} style={{ color: 'var(--purple-light)' }} />
              Resume
            </h3>
            <div className={styles.resumeSection}>
              {profileData.resumeUploaded ? (
                <div className={styles.resumeUploaded}>
                  <span className={styles.resumeIcon}>📄</span>
                  <div>
                    <p className={styles.resumeStatus}>Resume uploaded</p>
                  </div>
                </div>
              ) : (
                <div className={styles.resumeEmpty}>
                  <span className={styles.resumeIcon}>📄</span>
                  <p>No resume uploaded</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                style={{ display: 'none' }}
              />
              <button
                className={`${styles.btn} ${styles['btn-primary']}`}
                style={{ width: '100%' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={16} style={{ marginRight: '0.5rem' }} />
                {uploading ? 'Uploading...' : profileData.resumeUploaded ? 'Update Resume' : 'Upload Resume'}
              </button>
            </div>
          </div>

          {/* Skills Card */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>
              <Award size={20} style={{ color: 'var(--purple-light)' }} />
              Skills
            </h3>
            <div className={styles.skillsContainer}>
              {profileData.skills.length > 0 ? (
                profileData.skills.map(skill => (
                  <span key={skill} className={styles.skillTag}>
                    {skill}
                    {isEditing && (
                      <button 
                        className={styles.removeSkill}
                        onClick={() => removeSkill(skill)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No skills added yet</p>
              )}
              {isEditing && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', width: '100%' }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className={styles.editInput}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    style={{ flex: 1 }}
                    autoComplete="off"
                  />
                  <button 
                    className={`${styles.btn} ${styles['btn-primary']}`}
                    onClick={addSkill}
                    style={{ padding: '0.5rem' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className={styles.profileMain}>
          {/* About Section */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>
              <User size={20} style={{ color: 'var(--purple-light)' }} />
              About
            </h3>
            {isEditing ? (
              <textarea
                value={localInputs.bio}
                onChange={(e) => handleLocalInputChange('bio', e.target.value)}
                className={styles.editTextarea}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            ) : (
              <p className={styles.bioText}>{profileData.bio || 'No bio provided yet'}</p>
            )}
          </div>

          {/* Education Section */}
          <div className={styles.profileCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className={styles.cardTitle}>
                <GraduationCap size={20} style={{ color: 'var(--purple-light)' }} />
                Education
              </h3>
              {isEditing && (
                <button
                  onClick={addEducation}
                  className={`${styles.btn} ${styles['btn-primary']}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  <Plus size={14} style={{ marginRight: '0.5rem' }} />
                  Add Education
                </button>
              )}
            </div>
            {profileData.education.length > 0 ? (
              profileData.education.map((edu) => (
                <div key={edu.id} className={styles.educationItem}>
                  <div className={styles.educationIcon}>🎓</div>
                  <div className={styles.educationDetails} style={{ flex: 1 }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className={styles.editInput}
                          placeholder="Degree"
                          autoComplete="off"
                        />
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          className={styles.editInput}
                          placeholder="Institution"
                          autoComplete="off"
                        />
                        <input
                          type="text"
                          value={edu.period || ''}
                          onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                          className={styles.editInput}
                          placeholder="Period"
                          autoComplete="off"
                        />
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          className={styles.editInput}
                          placeholder="GPA"
                          autoComplete="off"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className={styles.educationDegree}>{edu.degree || 'Degree not specified'}</h4>
                        <p className={styles.educationInstitution}>{edu.institution || 'Institution not specified'}</p>
                        <p className={styles.educationPeriod}>{edu.period || 'Period not specified'}</p>
                        {edu.gpa && <p className={styles.educationGpa}>GPA: {edu.gpa}</p>}
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeEducation(edu.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No education information added yet</p>
            )}
          </div>

          {/* Experience Section */}
          <div className={styles.profileCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className={styles.cardTitle}>
                <Briefcase size={20} style={{ color: 'var(--purple-light)' }} />
                Experience
              </h3>
              {isEditing && (
                <button
                  onClick={addExperience}
                  className={`${styles.btn} ${styles['btn-primary']}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  <Plus size={14} style={{ marginRight: '0.5rem' }} />
                  Add Experience
                </button>
              )}
            </div>
            {profileData.experience.length > 0 ? (
              profileData.experience.map((exp) => (
                <div key={exp.id} className={styles.experienceItem}>
                  <div className={styles.experienceIcon}>💼</div>
                  <div className={styles.experienceDetails} style={{ flex: 1 }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={exp.title || ''}
                          onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                          className={styles.editInput}
                          placeholder="Job title"
                          autoComplete="off"
                        />
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className={styles.editInput}
                          placeholder="Company name"
                          autoComplete="off"
                        />
                        <input
                          type="text"
                          value={exp.duration || ''}
                          onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                          className={styles.editInput}
                          placeholder="Duration"
                          autoComplete="off"
                        />
                        <textarea
                          value={exp.description || ''}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          className={styles.editTextarea}
                          placeholder="Job description"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className={styles.experienceTitle}>{exp.title || 'Position not specified'}</h4>
                        <p className={styles.experienceCompany}>{exp.company || 'Company not specified'}</p>
                        <p className={styles.experienceDuration}>{exp.duration || 'Duration not specified'}</p>
                        <p className={styles.experienceDescription}>{exp.description || 'No description provided'}</p>
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeExperience(exp.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No work experience added yet</p>
            )}
          </div>

          {/* Application Stats */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>Application Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>0</span>
                <span className={styles.statLabel}>Applications Sent</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>0</span>
                <span className={styles.statLabel}>Interviews</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>0</span>
                <span className={styles.statLabel}>Offers Received</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>0%</span>
                <span className={styles.statLabel}>Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;