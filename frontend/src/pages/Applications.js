import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';

const Applications = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for filtering and sorting applications
  const [currentTab, setCurrentTab] = useState('all');
  const [sortOption, setSortOption] = useState('applied');
  
  // State for dynamic data
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date formatting helper functions
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return 'N/A';
    
    let date;
    
    // Handle different date formats
    if (dateString.includes('/')) {
      // If already in DD/MM/YYYY or MM/DD/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY if day > 12, otherwise MM/DD/YYYY
        if (parseInt(parts[0]) > 12) {
          return dateString; // Already in DD/MM/YYYY
        } else {
          // Convert from MM/DD/YYYY to DD/MM/YYYY
          return `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${parts[2]}`;
        }
      }
    } else {
      // Handle ISO date strings (YYYY-MM-DD)
      date = new Date(dateString);
    }
    
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    // For older dates, return DD/MM/YYYY format
    return formatDateToDDMMYYYY(dateString);
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadlineString) => {
    if (!deadlineString) return null;
    
    let deadline;
    
    // Handle DD/MM/YYYY format
    if (deadlineString.includes('/')) {
      const parts = deadlineString.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY format
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        deadline = new Date(year, month, day);
      }
    } else {
      deadline = new Date(deadlineString);
    }
    
    if (!deadline || isNaN(deadline.getTime())) return null;
    
    const now = new Date();
    const diffInDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    return diffInDays;
  };

  // Load applications from localStorage or create initial empty state
  const loadUserApplications = (userId) => {
    try {
      const savedApplications = localStorage.getItem(`userApplications_${userId}`);
      if (savedApplications) {
        return JSON.parse(savedApplications);
      }
      return []; // Return empty array for new users
    } catch (error) {
      console.error('Error loading applications from localStorage:', error);
      return [];
    }
  };

  // Save applications to localStorage
  const saveUserApplications = (userId, applications) => {
    try {
      localStorage.setItem(`userApplications_${userId}`, JSON.stringify(applications));
    } catch (error) {
      console.error('Error saving applications to localStorage:', error);
    }
  };

  // Add a new application (this would be called when user applies to an internship)
  const addNewApplication = (internshipData, applicationData = {}) => {
    if (!user) return;

    const newApplication = {
      id: Date.now(),
      internshipId: internshipData.id,
      userId: user.id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      internship: internshipData,
      documents: applicationData.documents || ['resume.pdf'],
      notes: applicationData.notes || '',
      ...applicationData
    };

    const updatedApplications = [newApplication, ...userApplications];
    setUserApplications(updatedApplications);
    saveUserApplications(user.id, updatedApplications);
    
    return newApplication;
  };

  // Update an existing application
  const updateApplication = (applicationId, updates) => {
    const updatedApplications = userApplications.map(app => 
      app.id === applicationId 
        ? { ...app, ...updates, lastUpdated: new Date().toISOString() }
        : app
    );
    setUserApplications(updatedApplications);
    saveUserApplications(user.id, updatedApplications);
  };

  // Redirect users who aren't logged in
  useEffect(() => {
    if (!user && !isGuest) {
      navigate('/login');
    }
  }, [user, isGuest, navigate]);

  // Load applications data when user changes
  useEffect(() => {
    const loadApplications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load from localStorage
        const applications = loadUserApplications(user.id);
        setUserApplications(applications);
        
        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (err) {
        console.error('Error loading applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  // Make addNewApplication available globally for other components
  useEffect(() => {
    if (user) {
      // Store the function globally so other components can add applications
      window.addApplicationToTracker = addNewApplication;
    }
    
    return () => {
      // Cleanup
      delete window.addApplicationToTracker;
    };
  }, [user, userApplications]);

  // Navigation items for the header
  const navItems = user ? [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/community', label: 'Community', icon: '👥' },
    { path: '/about', label: 'About', icon: '🏢' }
  ] : [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/about', label: 'About', icon: '🏢' }
  ];

  // Configuration for different application statuses
  const statusConfiguration = {
    pending: { color: '#f59e0b', icon: '⏳', label: 'Under Review' },
    interview: { color: '#3b82f6', icon: '🎯', label: 'Interview Stage' },
    accepted: { color: '#10b981', icon: '✅', label: 'Accepted' },
    rejected: { color: '#ef4444', icon: '❌', label: 'Not Selected' },
    withdrawn: { color: '#6b7280', icon: '🚫', label: 'Withdrawn' }
  };

  // Tab options for filtering applications
  const filterTabs = [
    { id: 'all', label: 'All My Applications', count: userApplications.length },
    { id: 'pending', label: 'Under Review', count: userApplications.filter(app => app.status === 'pending').length },
    { id: 'interview', label: 'Interview Stage', count: userApplications.filter(app => app.status === 'interview').length },
    { id: 'accepted', label: 'Got the Job! 🎉', count: userApplications.filter(app => app.status === 'accepted').length },
    { id: 'rejected', label: 'Not This Time', count: userApplications.filter(app => app.status === 'rejected').length }
  ];

  // Handle various user interactions
  const handleUserAction = async (actionType, applicationData = null) => {
    switch (actionType) {
      case 'logout':
        logout();
        navigate('/login');
        break;
      case 'viewDetails':
        navigate(`/internships/${applicationData.internshipId}`);
        break;
      case 'editNotes':
        const newNotes = prompt('Edit your notes:', applicationData.notes);
        if (newNotes !== null) {
          updateApplication(applicationData.id, { notes: newNotes });
          alert('Notes updated!');
        }
        break;
      case 'updateStatus':
        const newStatus = prompt('Update status (pending/interview/accepted/rejected):', applicationData.status);
        if (newStatus && ['pending', 'interview', 'accepted', 'rejected'].includes(newStatus)) {
          updateApplication(applicationData.id, { status: newStatus });
          alert('Status updated!');
        }
        break;
      case 'withdrawApplication':
        if (window.confirm('Are you sure you want to withdraw this application?')) {
          try {
            updateApplication(applicationData.id, { 
              status: 'withdrawn', 
              currentStep: 'Application withdrawn',
              nextStep: null
            });
            alert('Application withdrawn successfully');
          } catch (error) {
            alert('Failed to withdraw application. Please try again.');
          }
        }
        break;
      case 'addTestApplication':
        // Add a test application for demo purposes
        const testInternship = {
          id: Date.now(),
          title: 'Software Engineering Intern',
          company: 'Tech Corp Singapore',
          location: 'Singapore',
          deadline: '31/08/2025',
          stipend: 'S$1,200/month',
          logo: '💻'
        };
        addNewApplication(testInternship, {
          notes: 'Applied through university career portal',
          documents: ['resume.pdf', 'cover_letter.pdf']
        });
        alert('Test application added!');
        break;
      default:
        console.log('Unknown action:', actionType);
    }
  };

  // Filter and sort applications based on user selection
  const getFilteredApplications = () => {
    let filteredResults = userApplications;
    
    // Apply status filter
    if (currentTab !== 'all') {
      filteredResults = filteredResults.filter(application => 
        application.status === currentTab
      );
    }

    // Apply sorting
    filteredResults.sort((applicationA, applicationB) => {
      switch (sortOption) {
        case 'applied':
          return new Date(applicationB.submittedAt) - new Date(applicationA.submittedAt);
        case 'deadline':
          const deadlineA = new Date(applicationA.internship?.deadline?.split('/').reverse().join('-') || '2025-12-31');
          const deadlineB = new Date(applicationB.internship?.deadline?.split('/').reverse().join('-') || '2025-12-31');
          return deadlineA - deadlineB;
        case 'status':
          const statusPriority = { 'accepted': 0, 'interview': 1, 'pending': 2, 'rejected': 3, 'withdrawn': 4 };
          return statusPriority[applicationA.status] - statusPriority[applicationB.status];
        default:
          return 0;
      }
    });

    return filteredResults;
  };

  const filteredApplications = getFilteredApplications();

  // Calculate quick statistics for the dashboard
  const applicationStats = {
    totalApplications: userApplications.length,
    pendingReviews: userApplications.filter(app => app.status === 'pending').length,
    scheduledInterviews: userApplications.filter(app => app.status === 'interview').length,
    successfulApplications: userApplications.filter(app => app.status === 'accepted').length,
    successRate: userApplications.length > 0 ? 
      Math.round((userApplications.filter(app => app.status === 'accepted').length / userApplications.length) * 100) : 0
  };

  // Show login prompt for non-authenticated users
  if (!user) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.userHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.userInfo}>
              <span>🔍 Please log in to view applications</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>
              Login
            </button>
            <button className={styles.signupBtn} onClick={() => navigate('/signup')}>
              Sign Up
            </button>
          </div>
        </div>
        
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Application Tracker</h1>
          <p className={styles.heroSubtitle}>Sign in to track your internship applications</p>
          <button className={styles.ctaPrimary} onClick={() => navigate('/login')}>
            Login to Continue
          </button>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.homeContainer}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.homeContainer}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button 
              className={styles.ctaPrimary} 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <div className={styles.userHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.userInfo}>
            <span>👋 {user.full_name || user.email}</span>
          </div>

          <ul className={styles.navItems}>
            {navItems.map(item => (
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
          <button className={styles.profileBtn} onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className={styles.logoutBtn} onClick={() => handleUserAction('logout')}>
            Logout
          </button>
          <button className={styles.mobileNavToggle}>☰</button>
        </div>
      </div>

      {/* Page Header */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Your Application Journey</h1>
        <p className={styles.heroSubtitle}>
          Track your progress, manage deadlines, and celebrate your wins along the way!
        </p>

        {/* Quick Stats */}
        <div className={styles.userStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{applicationStats.totalApplications}</span>
            <span className={styles.statLabel}>Total Applied</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{applicationStats.scheduledInterviews}</span>
            <span className={styles.statLabel}>Interviews</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{applicationStats.successfulApplications}</span>
            <span className={styles.statLabel}>Accepted</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{applicationStats.successRate}%</span>
            <span className={styles.statLabel}>Success Rate</span>
          </div>
        </div>
      </section>

      {/* Tabs and Controls */}
      <section className={styles.searchSection}>
        <div className={styles.tabsContainer}>
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.categoryChip} ${currentTab === tab.id ? styles.active : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              {tab.label} <span className={styles.badge}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.additionalFilters}>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="applied">Recently Applied</option>
            <option value="deadline">Deadline</option>
            <option value="status">Status</option>
          </select>
          
          {/* Add test application button for demo */}
          <button 
            onClick={() => handleUserAction('addTestApplication')}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              background: 'var(--accent-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            + Add Test Application
          </button>
        </div>
      </section>

      {/* Applications List */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>
            {currentTab === 'all' ? 'All Applications' : filterTabs.find(tab => tab.id === currentTab)?.label}
            <span className={styles.badge}>{filteredApplications.length}</span>
          </h2>
        </div>

        {filteredApplications.length === 0 ? (
          <div className={styles.noResults}>
            <h3>No applications found</h3>
            <p>
              {currentTab === 'all' 
                ? "You haven't applied to any internships yet. Start browsing to find your perfect match!"
                : `No applications in the "${filterTabs.find(tab => tab.id === currentTab)?.label}" category.`
              }
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className={styles.ctaPrimary} onClick={() => navigate('/internships')}>
                Browse Internships
              </button>
              <button 
                className={styles.ctaSecondary} 
                onClick={() => handleUserAction('addTestApplication')}
                style={{
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)'
                }}
              >
                Add Test Application
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredApplications.map(application => {
              const config = statusConfiguration[application.status] || statusConfiguration.pending;
              const daysUntilDeadline = getDaysUntilDeadline(application.internship?.deadline);
              
              return (
                <div key={application.id} style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '2rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  {/* Application Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ 
                          color: 'var(--text-primary)', 
                          margin: 0,
                          fontSize: '1.25rem',
                          fontWeight: '600'
                        }}>
                          {application.internship?.title || 'Internship Position'}
                        </h3>
                        <span style={{
                          background: config.color + '20',
                          color: config.color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {config.icon} {config.label}
                        </span>
                      </div>
                      <p style={{ 
                        color: 'var(--text-muted)', 
                        margin: '0 0 0.5rem 0',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}>
                        {application.internship?.company || 'Company Name'}
                      </p>
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        margin: 0,
                        fontSize: '0.875rem'
                      }}>
                        📍 {application.internship?.location || 'Location not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Applied On
                      </label>
                      <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontWeight: '500' }}>
                        📅 {formatDateToDDMMYYYY(application.submittedAt)}
                      </p>
                    </div>
                    
                    {application.internship?.deadline && (
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Deadline
                        </label>
                        <p style={{ 
                          color: daysUntilDeadline && daysUntilDeadline < 7 ? '#ef4444' : 'var(--text-primary)', 
                          margin: '0.25rem 0 0 0', 
                          fontWeight: '500' 
                        }}>
                          ⏰ {formatDateToDDMMYYYY(application.internship.deadline)}
                          {daysUntilDeadline !== null && (
                            <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                              ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 
                                daysUntilDeadline === 0 ? 'Due today' : 'Overdue'})
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {application.internship?.stipend && (
                      <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Stipend
                        </label>
                        <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontWeight: '500' }}>
                          💰 {application.internship.stipend}
                        </p>
                      </div>
                    )}

                    <div>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Last Updated
                      </label>
                      <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontWeight: '500' }}>
                        🔄 {formatTimeAgo(application.lastUpdated)}
                      </p>
                    </div>
                  </div>

                  {/* Next Step or Special Info */}
                  {application.nextStep && (
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <p style={{ 
                        color: '#3b82f6', 
                        margin: 0, 
                        fontWeight: '500',
                        fontSize: '0.9rem'
                      }}>
                        🎯 Next Step: {application.nextStep}
                      </p>
                    </div>
                  )}

                  {/* Documents */}
                  {application.documents && application.documents.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                        Documents Submitted
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {application.documents.map(doc => (
                          <span
                            key={doc}
                            style={{
                              background: 'rgba(167, 139, 250, 0.2)',
                              color: '#c4b5fd',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '1rem',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            📄 {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {application.notes && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                        Your Notes
                      </label>
                      <p style={{
                        color: 'var(--text-secondary)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        margin: 0,
                        fontStyle: 'italic'
                      }}>
                        💭 {application.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--glass-border)',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleUserAction('viewDetails', application)}
                      style={{
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleUserAction('editNotes', application)}
                      style={{
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Edit Notes
                    </button>
                    <button
                      onClick={() => handleUserAction('updateStatus', application)}
                      style={{
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Update Status
                    </button>
                    {application.status !== 'accepted' && application.status !== 'withdrawn' && (
                      <button
                        onClick={() => handleUserAction('withdrawApplication', application)}
                        style={{
                          background: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Tips Section */}
      <section className={styles.tipsSection}>
        <h2>💡 Application Management Tips</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📝</div>
            <h3>Keep Detailed Notes</h3>
            <p>Track important details about each application - interview feedback, key contacts, and next steps. Use the "Edit Notes" feature to stay organized!</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🔄</div>
            <h3>Update Status Regularly</h3>
            <p>Keep your application status current. Move applications to "Interview Stage" when scheduled, and update to "Accepted" or "Rejected" when you hear back.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📅</div>
            <h3>Monitor Deadlines</h3>
            <p>Watch for red deadline warnings! Applications due soon are highlighted in red. Set phone reminders for important deadlines.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📊</div>
            <h3>Track Your Progress</h3>
            <p>Use the stats above to monitor your success rate. Learn from rejections and celebrate acceptances. Every application is a learning opportunity!</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Applications;