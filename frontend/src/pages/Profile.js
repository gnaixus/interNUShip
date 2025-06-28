import React, { useState, useRef } from 'react';
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
  const [profileData, setProfileData] = useState({
    name: user?.full_name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+65 9123 4567',
    university: 'National University of Singapore',
    major: 'Computer Science',
    year: 'Year 3',
    location: 'Singapore',
    bio: 'Passionate computer science student with experience in web development and data analysis. Looking for exciting internship opportunities to apply my skills and learn from industry professionals.',
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Machine Learning'],
    experience: [
      {
        id: 1,
        title: 'Web Development Intern',
        company: 'Tech Startup SG',
        duration: 'Jun 2024 - Aug 2024',
        description: 'Developed responsive web applications using React and Node.js'
      }
    ],
    education: [
      {
        id: 1,
        institution: 'National University of Singapore',
        degree: 'Bachelor of Computer Science',
        period: '2022 - 2026',
        gpa: '4.2/5.0'
      }
    ],
    resumeUploaded: false,
    lastUpdated: new Date().toLocaleDateString()
  });

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

  const saveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Application submitted!');
      setIsSubmitting(false);
    }, 2000);
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
      console.log('Extracted text preview:', result.extractedText);
      
      setProfileData(prev => ({
        ...prev,
        name: parsedData.name && parsedData.name.trim() ? parsedData.name : prev.name,
        email: parsedData.email && parsedData.email.trim() ? parsedData.email : prev.email,
        phone: parsedData.phone && parsedData.phone.trim() ? parsedData.phone : prev.phone,
        location: parsedData.location && parsedData.location.trim() ? parsedData.location : prev.location,
        skills: parsedData.skills && parsedData.skills.length > 0 ? parsedData.skills : prev.skills,
        experience: parsedData.experience && parsedData.experience.length > 0 ? parsedData.experience : prev.experience,
        education: parsedData.education && parsedData.education.length > 0 ? parsedData.education : prev.education,
        resumeUploaded: true,
        lastUpdated: new Date().toLocaleDateString()
      }));

      const updatedFields = [];
      if (parsedData.name) updatedFields.push('name');
      if (parsedData.email) updatedFields.push('email');
      if (parsedData.phone) updatedFields.push('phone');
      if (parsedData.location) updatedFields.push('location');
      if (parsedData.skills.length > 0) updatedFields.push('skills');
      if (parsedData.experience.length > 0) updatedFields.push('experience');
      if (parsedData.education.length > 0) updatedFields.push('education');
      
      if (updatedFields.length > 0) {
        alert(`Resume parsed successfully! Updated: ${updatedFields.join(', ')}. Please review and edit the information.`);
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

const handleSaveProfile = () => {
  setIsEditing(false);
  const updatedProfile = {
    ...profileData,  
    lastUpdated: new Date().toLocaleDateString()
  };
  setProfileData(updatedProfile);
  localStorage.setItem('userProfileData', JSON.stringify(updatedProfile));
  console.log('Saved profile data to localStorage:', updatedProfile);
  alert('Profile updated successfully!');
};

  const updateField = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
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
      title: 'New Position',
      company: 'Company Name',
      duration: 'Start - End',
      description: 'Job description...'
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
      institution: 'University Name',
      degree: 'Degree',
      period: 'Start - End',
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

  // Standardized EditableField component using existing CSS module styles
  const EditableField = ({ value, onChange, multiline = false, placeholder = "", type = "text" }) => {
    if (!isEditing) {
      return <span className={styles.contactValue}>{value}</span>;
    }
    
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.editTextarea}
          rows={3}
        />
      );
    }
    
    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.editInput}
      />
    );
  };

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <div className={styles.userHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.userInfo}>
            <span>👤 {profileData.name}</span>
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
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className={styles.profileBasicInfo}>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={styles.editInput}
                  placeholder="Full Name"
                />
              ) : (
                <h1 className={styles.profileName}>{profileData.name}</h1>
              )}
              <p className={styles.profileTitle}>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.major}
                    onChange={(e) => updateField('major', e.target.value)}
                    className={styles.editInput}
                    placeholder="Major"
                  />
                ) : (
                  profileData.major
                )} Student at {isEditing ? (
                  <input
                    type="text"
                    value={profileData.university}
                    onChange={(e) => updateField('university', e.target.value)}
                    className={styles.editInput}
                    placeholder="University"
                  />
                ) : (
                  profileData.university
                )}
              </p>
              <div className={styles.profileLocation}>
                <MapPin size={16} />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className={styles.editInput}
                    placeholder="Location"
                  />
                ) : (
                  `📍 ${profileData.location}`
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
                <button className={`${styles.btn} ${styles['btn-secondary']}`} onClick={() => setIsEditing(false)}>
                  <X size={16} style={{ marginRight: '0.5rem' }} />
                  Cancel
                </button>
              </div>
            ) : (
              <button className={`${styles.btn} ${styles['btn-secondary']}`} onClick={() => setIsEditing(true)}>
                <Edit3 size={16} style={{ marginRight: '0.5rem' }} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <div className={styles.profileContent}>
        {/* Left Column */}
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
                <EditableField
                  value={profileData.email}
                  onChange={(value) => updateField('email', value)}
                  placeholder="Email address"
                  type="email"
                />
              </div>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📱</span>
              <div>
                <p className={styles.contactLabel}>Phone</p>
                <EditableField
                  value={profileData.phone}
                  onChange={(value) => updateField('phone', value)}
                  placeholder="Phone number"
                  type="tel"
                />
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
                    <p className={styles.resumeDate}>Last updated: {profileData.lastUpdated}</p>
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
              {profileData.skills.map(skill => (
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
              ))}
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

        {/* Right Column */}
        <div className={styles.profileMain}>
          {/* About Section */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>
              <User size={20} style={{ color: 'var(--purple-light)' }} />
              About
            </h3>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                className={styles.editTextarea}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            ) : (
              <p className={styles.bioText}>{profileData.bio}</p>
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
            {profileData.education.map((edu) => (
              <div key={edu.id} className={styles.educationItem}>
                <div className={styles.educationIcon}>🎓</div>
                <div className={styles.educationDetails} style={{ flex: 1 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className={styles.editInput}
                        placeholder="Degree"
                      />
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        className={styles.editInput}
                        placeholder="Institution"
                      />
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                        className={styles.editInput}
                        placeholder="Period"
                      />
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        className={styles.editInput}
                        placeholder="GPA"
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className={styles.educationDegree}>{edu.degree}</h4>
                      <p className={styles.educationInstitution}>{edu.institution}</p>
                      <p className={styles.educationPeriod}>{edu.period}</p>
                      <p className={styles.educationGpa}>GPA: {edu.gpa}</p>
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
            ))}
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
            {profileData.experience.map((exp) => (
              <div key={exp.id} className={styles.experienceItem}>
                <div className={styles.experienceIcon}>💼</div>
                <div className={styles.experienceDetails} style={{ flex: 1 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                        className={styles.editInput}
                        placeholder="Job title"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className={styles.editInput}
                        placeholder="Company name"
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                        className={styles.editInput}
                        placeholder="Duration"
                      />
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        className={styles.editTextarea}
                        placeholder="Job description"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className={styles.experienceTitle}>{exp.title}</h4>
                      <p className={styles.experienceCompany}>{exp.company}</p>
                      <p className={styles.experienceDuration}>{exp.duration}</p>
                      <p className={styles.experienceDescription}>{exp.description}</p>
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
            ))}
          </div>

          {/* Application Stats */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>Application Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>12</span>
                <span className={styles.statLabel}>Applications Sent</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>3</span>
                <span className={styles.statLabel}>Interviews</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>1</span>
                <span className={styles.statLabel}>Offers Received</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>25%</span>
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