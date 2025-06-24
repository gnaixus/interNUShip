import React, { useState, useRef } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
        title: 'Web Development Intern',
        company: 'Tech Startup SG',
        duration: 'Jun 2024 - Aug 2024',
        description: 'Developed responsive web applications using React and Node.js'
      }
    ],
    education: [
      {
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
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const saveDraft = () => {
    // Simulate draft save
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000); // reset after 2s
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate form submit
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

    // Simulate upload process
    try {
      // In a real app, you'd upload to your backend here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProfileData(prev => ({
        ...prev,
        resumeUploaded: true,
        lastUpdated: new Date().toLocaleDateString()
      }));
      
      alert('Resume uploaded successfully!');
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    setProfileData(prev => ({
      ...prev,
      lastUpdated: new Date().toLocaleDateString()
    }));
    alert('Profile updated successfully!');
  };

  const addSkill = (newSkill) => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
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
                  onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                  className={styles.editInput}
                />
              ) : (
                <h1 className={styles.profileName}>{profileData.name}</h1>
              )}
              <p className={styles.profileTitle}>{profileData.major} Student at {profileData.university}</p>
              <p className={styles.profileLocation}>📍 {profileData.location}</p>
            </div>
          </div>
          <div className={styles.profileActions}>
            {isEditing ? (
              <button className={styles.btn + ' ' + styles.btnPrimary} onClick={handleSaveProfile}>
                Save Changes
              </button>
            ) : (
              <button className={styles.btn + ' ' + styles.btnSecondary} onClick={() => setIsEditing(true)}>
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
            <h3 className={styles.cardTitle}>Contact Information</h3>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📧</span>
              <div>
                <p className={styles.contactLabel}>Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                    className={styles.editInput}
                  />
                ) : (
                  <p className={styles.contactValue}>{profileData.email}</p>
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
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                    className={styles.editInput}
                  />
                ) : (
                  <p className={styles.contactValue}>{profileData.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Resume Upload Card */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>Resume</h3>
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
                className={styles.btn + ' ' + styles.btnPrimary}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : profileData.resumeUploaded ? 'Update Resume' : 'Upload Resume'}
              </button>
            </div>
          </div>

          {/* Skills Card */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>Skills</h3>
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
                <button 
                  className={styles.addSkillBtn}
                  onClick={() => {
                    const newSkill = prompt('Enter a new skill:');
                    if (newSkill) addSkill(newSkill);
                  }}
                >
                  + Add Skill
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.profileMain}>
          {/* About Section */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>About</h3>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                className={styles.editTextarea}
                rows={4}
              />
            ) : (
              <p className={styles.bioText}>{profileData.bio}</p>
            )}
          </div>

          {/* Education Section */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>Education</h3>
            {profileData.education.map((edu, index) => (
              <div key={index} className={styles.educationItem}>
                <div className={styles.educationIcon}>🎓</div>
                <div className={styles.educationDetails}>
                  <h4 className={styles.educationDegree}>{edu.degree}</h4>
                  <p className={styles.educationInstitution}>{edu.institution}</p>
                  <p className={styles.educationPeriod}>{edu.period}</p>
                  <p className={styles.educationGpa}>GPA: {edu.gpa}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Experience Section */}
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>Experience</h3>
            {profileData.experience.map((exp, index) => (
              <div key={index} className={styles.experienceItem}>
                <div className={styles.experienceIcon}>💼</div>
                <div className={styles.experienceDetails}>
                  <h4 className={styles.experienceTitle}>{exp.title}</h4>
                  <p className={styles.experienceCompany}>{exp.company}</p>
                  <p className={styles.experienceDuration}>{exp.duration}</p>
                  <p className={styles.experienceDescription}>{exp.description}</p>
                </div>
              </div>
            ))}
            <button className={styles.btn + ' ' + styles.btnSecondary}>
              + Add Experience
            </button>
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={saveDraft}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={draftSaved}
            >
              {draftSaved ? 'Draft Saved!' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Profile;