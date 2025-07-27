import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Profile.module.css';
import { Upload, Edit3, Save, X, Plus, Trash2, FileText, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { processPDFResume } from './resume/pdf.js'

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [parsing, setParsing] = useState(false);
  const [newSkill, setNewSkill] = useState('')
  const fileInputRef = useRef(null);

  // Enhanced state management with better error handling
  const [draftSaved, setDraftSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', 'warning'
  const [uploadMessage, setUploadMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Function to get initial profile data (enhanced with better error handling)
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
      setUploadStatus('error');
      setUploadMessage('Error loading saved profile data');
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
    year: '',
    location: '',
    bio: ''
  });

  // Enhanced auto-save with debouncing
  const autoSaveProfile = useCallback(async (data) => {
    try {
      const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('userProfileData', JSON.stringify(dataToSave));
      console.log('✅ Auto-saved profile data');
      
      // Clear any previous error messages
      if (uploadStatus === 'error') {
        setUploadStatus(null);
        setUploadMessage('');
      }
    } catch (error) {
      console.error('❌ Failed to auto-save profile:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to save profile data');
    }
  }, [uploadStatus]);

  // Debounced auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && profileData) {
      const timeoutId = setTimeout(() => {
        autoSaveProfile(profileData);
        setHasUnsavedChanges(false);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [profileData, hasUnsavedChanges, autoSaveProfile]);

  // Sync local inputs with profile data when editing starts/stops
  useEffect(() => {
    if (isEditing) {
      setLocalInputs({
        email: profileData.email || '',
        phone: profileData.phone || '',
        name: profileData.name || '',
        major: profileData.major || '',
        university: profileData.university || '',
        year: profileData.year || '',
        location: profileData.location || '',
        bio: profileData.bio || ''
      });
    }
  }, [isEditing, profileData.email, profileData.phone, profileData.name, profileData.major, profileData.university, profileData.location, profileData.bio]);

  // Year Selector 
  const YearSelector = ({ value, onChange, isEditing }) => {
  const yearOptions = [
    'Year 1',
    'Year 2', 
    'Year 3',
    'Year 4',
    'Year 5',
    'Graduate',
    'Alumni'
  ];

  if (!isEditing) {
    return <span className={styles.contactValue}>{value || 'Not specified'}</span>;
  }

  return (
    <select 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className={styles.editInput}
    >
      <option value="">Select Year</option>
      {yearOptions.map(year => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
};

  // Handle local input changes with enhanced tracking
  const handleLocalInputChange = useCallback((field, value) => {
    setLocalInputs(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
        setUploadStatus('error');
        setUploadMessage('Error loading saved profile');
      }
    } else {
      // If got no saved data, store current state as original
      setOriginalData(profileData);
    }
  }, [user?.id]);

  const navigationItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/community', label: 'Community', icon: '👥' },
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
    setHasUnsavedChanges(false);
    setUploadStatus(null);
    setUploadMessage('');
  };

  // Replace your handleFileUpload function in Profile.js with this enhanced version:

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset status
    setUploadStatus(null);
    setUploadMessage('');

    // Enhanced file validation
    if (file.type !== 'application/pdf') {
      setUploadStatus('error');
      setUploadMessage('Please upload a PDF file only');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadStatus('error');
      setUploadMessage('File size too large. Please upload a PDF smaller than 10MB');
      return;
    }

    if (file.size < 100) {
      setUploadStatus('error');
      setUploadMessage('File appears to be too small or corrupted');
      return;
    }

    setUploading(true);
    setParsing(true);
    setUploadStatus('info');
    setUploadMessage('Processing your resume...');

    try {
      console.log('🔄 Processing PDF resume:', file.name);
      
      const result = await processPDFResume(file);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const parsedData = result.data;
      console.log('✅ Parsed resume data:', parsedData);
      
      // Smart merging: only update fields that have meaningful data
      const updatedProfile = { ...profileData };
      
      // Enhanced data validation and merging
      if (parsedData.name && parsedData.name.trim() && parsedData.name.length > 1) {
        updatedProfile.name = parsedData.name.trim();
        console.log('✅ Updated name:', updatedProfile.name);
      }
      
      if (parsedData.email && parsedData.email.includes('@')) {
        updatedProfile.email = parsedData.email.trim();
        console.log('✅ Updated email:', updatedProfile.email);
      }
      
      if (parsedData.phone && parsedData.phone.length > 6) {
        updatedProfile.phone = parsedData.phone.trim();
        console.log('✅ Updated phone:', updatedProfile.phone);
      }
      
      if (parsedData.location && parsedData.location.length > 2) {
        updatedProfile.location = parsedData.location.trim();
        console.log('✅ Updated location:', updatedProfile.location);
      }
      
      // FIX: Major field mapping from parsed data
      if (parsedData.major && parsedData.major.trim()) {
        updatedProfile.major = parsedData.major.trim();
        console.log('✅ Updated major:', updatedProfile.major);
      } else if (parsedData.education && parsedData.education.length > 0) {
        const primaryEducation = parsedData.education[0];
        if (primaryEducation.fieldOfStudy && primaryEducation.fieldOfStudy.trim()) {
          updatedProfile.major = primaryEducation.fieldOfStudy.trim();
          console.log('✅ Updated major from education:', updatedProfile.major);
        }
      }
      
      // FIX: University field mapping from parsed data
      if (parsedData.university && parsedData.university.trim()) {
        updatedProfile.university = parsedData.university.trim();
        console.log('✅ Updated university:', updatedProfile.university);
      } else if (parsedData.education && parsedData.education.length > 0) {
        const primaryEducation = parsedData.education[0];
        if (primaryEducation.institution && primaryEducation.institution.trim()) {
          updatedProfile.university = primaryEducation.institution.trim();
          console.log('✅ Updated university from education:', updatedProfile.university);
        }
      }
      
      // FIX: Bio field mapping from parsed data
      if (parsedData.bio && parsedData.bio.trim() && parsedData.bio.length > 10) {
        updatedProfile.bio = parsedData.bio.trim();
        console.log('✅ Updated bio:', updatedProfile.bio.substring(0, 50) + '...');
      }
      
      // Skills: merge without duplicates
      if (parsedData.skills && Array.isArray(parsedData.skills) && parsedData.skills.length > 0) {
        const existingSkills = updatedProfile.skills || [];
        const newSkills = parsedData.skills.filter(skill => 
          skill && skill.trim() && !existingSkills.some(existing => 
            existing.toLowerCase() === skill.toLowerCase()
          )
        );
        updatedProfile.skills = [...existingSkills, ...newSkills];
        console.log('✅ Updated skills:', updatedProfile.skills);
      }
      
      // Experience: replace if better data available
      if (parsedData.experience && Array.isArray(parsedData.experience) && parsedData.experience.length > 0) {
        const hasValidExp = parsedData.experience.some(exp => 
          (exp.position && exp.position.trim()) || (exp.company && exp.company.trim()) ||
          (exp.title && exp.title.trim())
        );
        
        if (hasValidExp) {
          updatedProfile.experience = parsedData.experience.map((exp, index) => ({
            id: Date.now() + index,
            title: exp.position || exp.title || '',
            company: exp.company || '',
            duration: exp.startDate && exp.endDate ? 
              `${exp.startDate} - ${exp.endDate}` : 
              exp.duration || '',
            description: exp.description || ''
          }));
          console.log('✅ Updated experience:', updatedProfile.experience.length + ' entries');
        }
      }
      
      // Education: replace if better data available
      if (parsedData.education && Array.isArray(parsedData.education) && parsedData.education.length > 0) {
        const hasValidEdu = parsedData.education.some(edu => 
          (edu.institution && edu.institution.trim()) || (edu.degree && edu.degree.trim())
        );
        
        if (hasValidEdu) {
          updatedProfile.education = parsedData.education.map((edu, index) => ({
            id: Date.now() + index,
            institution: edu.institution || '',
            degree: edu.degree || '',
            period: edu.year || edu.period || '',
            gpa: edu.gpa || ''
          }));
          console.log('✅ Updated education:', updatedProfile.education.length + ' entries');
        }
      }
      
      updatedProfile.resumeUploaded = true;
      updatedProfile.lastUpdated = new Date().toLocaleDateString();

      // LOG FINAL PROFILE STATE
      console.log('📊 Final profile update summary:');
      console.log('  Name:', updatedProfile.name);
      console.log('  Email:', updatedProfile.email);
      console.log('  Phone:', updatedProfile.phone);
      console.log('  Major:', updatedProfile.major);
      console.log('  University:', updatedProfile.university);
      console.log('  Bio length:', updatedProfile.bio?.length || 0);
      console.log('  Location:', updatedProfile.location);
      console.log('  Skills count:', updatedProfile.skills?.length || 0);
      console.log('  Experience count:', updatedProfile.experience?.length || 0);
      console.log('  Education count:', updatedProfile.education?.length || 0);

      setProfileData(updatedProfile);
      setOriginalData(updatedProfile); // Update original data too
      autoSaveProfile(updatedProfile);

      // Determine success message
      const extractedFields = [];
      if (parsedData.name) extractedFields.push('name');
      if (parsedData.email) extractedFields.push('email');
      if (parsedData.phone) extractedFields.push('phone');
      if (parsedData.location) extractedFields.push('location');
      if (parsedData.major || (parsedData.education?.[0]?.fieldOfStudy)) extractedFields.push('major');
      if (parsedData.university || (parsedData.education?.[0]?.institution)) extractedFields.push('university');
      if (parsedData.bio) extractedFields.push('bio');
      if (parsedData.skills?.length > 0) extractedFields.push('skills');
      if (parsedData.experience?.length > 0) extractedFields.push('experience');
      if (parsedData.education?.length > 0) extractedFields.push('education');
      
      if (extractedFields.length > 0) {
        setUploadStatus('success');
        setUploadMessage(`Resume parsed successfully! Updated: ${extractedFields.join(', ')}`);
        setIsEditing(true);
      } else {
        setUploadStatus('warning');
        setUploadMessage('Resume uploaded but minimal information could be extracted. Please verify the PDF contains readable text.');
      }
      
    } catch (error) {
      console.error('❌ Error processing resume:', error);
      setUploadStatus('error');
      setUploadMessage(`Failed to parse resume: ${error.message}`);
    } finally {
      setUploading(false);
      setParsing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  // Enhanced save function with validation and verification
  const handleSaveProfile = async () => {
    try {
      // Apply local changes first
      applyLocalChanges();
      
      const finalData = {
        ...profileData,
        ...localInputs
      };

      if (!finalData.name?.trim()) {
        setUploadStatus('error');
        setUploadMessage('Name is required');
        return;
      }
      if (!finalData.email?.trim()) {
        setUploadStatus('error');
        setUploadMessage('Email is required');
        return;
      }

      setIsSubmitting(true);
      const updatedProfile = {
        ...finalData,  
        lastUpdated: new Date().toLocaleDateString(),
        savedAt: Date.now()
      };
      
      setProfileData(updatedProfile);
      setOriginalData(updatedProfile); // Update original data after successful save
      await autoSaveProfile(updatedProfile);
      
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setUploadStatus('success');
      setUploadMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setUploadMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced skills management
  const addSkill = () => {
    if (newSkill && newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
      setHasUnsavedChanges(true);
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
    setHasUnsavedChanges(true);
  };

  // Enhanced experience management
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
    setHasUnsavedChanges(true);
  };

  const updateExperience = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeExperience = (id) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
    setHasUnsavedChanges(true);
  };

  // Enhanced education management
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
    setHasUnsavedChanges(true);
  };

  const updateEducation = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeEducation = (id) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
    setHasUnsavedChanges(true);
  };

  // Status message component
  const StatusMessage = () => {
    if (!uploadStatus || !uploadMessage) return null;
    
    const getStatusIcon = () => {
      switch (uploadStatus) {
        case 'success': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
        case 'error': return <AlertCircle size={16} style={{ color: 'var(--danger)' }} />;
        case 'warning': return <AlertCircle size={16} style={{ color: 'var(--warning)' }} />;
        case 'info': return <Loader2 size={16} style={{ color: 'var(--purple-light)' }} className="animate-spin" />;
        default: return null;
      }
    };
    
    const getStatusColor = () => {
      switch (uploadStatus) {
        case 'success': return 'var(--success)';
        case 'error': return 'var(--danger)';
        case 'warning': return 'var(--warning)';
        case 'info': return 'var(--purple-light)';
        default: return 'var(--text-secondary)';
      }
    };
    
    return (
      <div style={{
        position: 'fixed',
        top: '100px',
        right: '2rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--border-radius)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.875rem',
        color: getStatusColor(),
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        maxWidth: '350px',
        wordWrap: 'break-word'
      }}>
        {getStatusIcon()}
        <span>{uploadMessage}</span>
        <button
          onClick={() => {
            setUploadStatus(null);
            setUploadMessage('');
          }}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.7
          }}
        >
          <X size={14} />
        </button>
      </div>
    );
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
      {/* Status Message */}
      <StatusMessage />

      {/* Header - keeping your exact structure */}
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

      {/* Profile Header - keeping your exact design */}
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
                  <>
                    <input
                      type="text"
                      value={localInputs.major}
                      onChange={(e) => handleLocalInputChange('major', e.target.value)}
                      className={styles.editInput}
                      placeholder="Major"
                      autoComplete="off"
                    />
                    {' Student • '}
                    <YearSelector 
                      value={localInputs.year}
                      onChange={(value) => handleLocalInputChange('year', value)}
                      isEditing={true}
                    />
                    {' at '}
                    <input
                      type="text"
                      value={localInputs.university}
                      onChange={(e) => handleLocalInputChange('university', e.target.value)}
                      className={styles.editInput}
                      placeholder="University"
                      autoComplete="off"
                    />
                  </>
                ) : (
                  <>
                    {profileData.major || 'Major not set'} Student
                    {profileData.year && ` • ${profileData.year}`}
                    {' at '}
                    {profileData.university || 'University not set'}
                  </>
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
                <button 
                  className={`${styles.btn} ${styles['btn-primary']}`} 
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} style={{ marginRight: '0.5rem' }} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} style={{ marginRight: '0.5rem' }} />
                      Save Changes
                    </>
                  )}
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

      {/* Main Content Area - keeping your exact layout */}
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
                    {profileData.lastUpdated && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Updated: {profileData.lastUpdated}
                      </p>
                    )}
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
                disabled={uploading}
              />
              <button
                className={`${styles.btn} ${styles['btn-primary']}`}
                style={{ width: '100%', opacity: uploading ? 0.7 : 1 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} style={{ marginRight: '0.5rem' }} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={16} style={{ marginRight: '0.5rem' }} />
                    {profileData.resumeUploaded ? 'Update Resume' : 'Upload Resume'}
                  </>
                )}
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

          {/* Application Stats - keeping your exact design */}
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

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--border-radius)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000
        }}>
          <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
          <span>You have unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default Profile;