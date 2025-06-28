import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import DataService from '../services/dataService';

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

  // Redirect users who aren't logged in
  useEffect(() => {
    if (!user && !isGuest) {
      navigate('/login');
    }
  }, [user, isGuest, navigate]);

  // Load applications data
  useEffect(() => {
    const loadApplications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await DataService.getUserApplications(user.id);
        if (response.success) {
          setUserApplications(response.data);
        }
      } catch (err) {
        console.error('Error loading applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  // Navigation items for the header
  const navigationItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/about', label: 'About', icon: '🏢' }  
  ];

  // Configuration for different application statuses
  const statusConfiguration = {
    pending: { color: '#f59e0b', icon: '⏳', label: 'Under Review' },
    interview: { color: '#3b82f6', icon: '🎯', label: 'Interview Stage' },
    accepted: { color: '#10b981', icon: '✅', label: 'Accepted' },
    rejected: { color: '#ef4444', icon: '❌', label: 'Not Selected' }
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
          // In real app, this would update via API
          const updatedApplications = userApplications.map(app => 
            app.id === applicationData.id ? { ...app, notes: newNotes } : app
          );
          setUserApplications(updatedApplications);
          alert('Notes updated!');
        }
        break;
      case 'withdrawApplication':
        if (window.confirm('Are you sure you want to withdraw this application?')) {
          try {
            // Simulate withdrawal API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedApplications = userApplications.map(app => 
              app.id === applicationData.id 
                ? { ...app, status: 'withdrawn', currentStep: 'Application withdrawn' }
                : app
            );
            setUserApplications(updatedApplications);
            alert('Application withdrawn successfully');
          } catch (error) {
            alert('Failed to withdraw application. Please try again.');
          }
        }
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
            <h3>Nothing here yet!</h3>
            <p>
              {currentTab === 'all' 
                ? "Ready to start your internship journey? Browse opportunities and apply to roles that excite you!" 
                : `No applications in this category yet. Keep applying - you've got this! 💪`}
            </p>
            <button className={styles.ctaPrimary} onClick={() => navigate('/internships')}>
              Explore Opportunities
            </button>
          </div>
        ) : (
          <div className={styles.applicationsGrid}>
            {filteredApplications.map(application => (
              <div key={application.id} className={styles.applicationCard}>
                <div 
                  className={styles.statusBadge}
                  style={{ backgroundColor: statusConfiguration[application.status]?.color || '#6b7280' }}
                >
                  {statusConfiguration[application.status]?.icon || '📋'} {statusConfiguration[application.status]?.label || application.status}
                </div>
                
                <div className={styles.cardHeader}>
                  <div className={styles.companyLogo}>{application.internship?.logo || '🏢'}</div>
                  <div className={styles.companyInfo}>
                    <h3 className={styles.jobTitle}>{application.internship?.title || 'Unknown Position'}</h3>
                    <p className={styles.companyName}>{application.internship?.company || 'Unknown Company'}</p>
                  </div>
                </div>

                <div className={styles.jobDetails}>
                  <div className={styles.detailItem}>
                    <span>📅</span> Applied: {new Date(application.submittedAt).toLocaleDateString()}
                  </div>
                  <div className={styles.detailItem}>
                    <span>⏰</span> Deadline: {application.internship?.deadline || 'N/A'}
                  </div>
                  <div className={styles.detailItem}>
                    <span>📍</span> {application.internship?.location || 'Remote'}
                  </div>
                  <div className={styles.detailItem}>
                    <span>💰</span> {application.internship?.stipend || 'Not specified'}
                  </div>
                </div>

                {application.nextStep && (
                  <div className={styles.interviewInfo}>
                    {application.nextStep}
                  </div>
                )}

                <div className={styles.nextStep}>
                  <strong>Status:</strong> {application.status}
                </div>

                {application.notes && (
                  <div className={styles.applicationNotes}>
                    <strong>Notes:</strong>
                    {application.notes}
                  </div>
                )}

                <div className={styles.documents}>
                  <strong>Documents:</strong>
                  <div>
                    {application.documents && application.documents.map(doc => (
                      <span key={doc} className={styles.documentTag}>{doc}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button 
                    className={styles.detailsButton} 
                    onClick={() => handleUserAction('viewDetails', application)}
                  >
                    View Details
                  </button>
                  <button 
                    className={styles.editButton} 
                    onClick={() => handleUserAction('editNotes', application)}
                  >
                    Edit Notes
                  </button>
                  {(application.status === 'pending' || application.status === 'interview') && (
                    <button 
                      className={styles.withdrawButton} 
                      onClick={() => handleUserAction('withdrawApplication', application)}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tips Section */}
      <section className={styles.tipsSection}>
        <h2>💡 Your Success Toolkit</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📋</div>
            <h3>Stay Organized</h3>
            <p>Keep detailed notes about each application. What went well in interviews? What could you improve? Track your progress and celebrate small wins!</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📅</div>
            <h3>Never Miss a Beat</h3>
            <p>Set phone reminders for deadlines and follow-ups. Companies appreciate candidates who are responsive and proactive. A simple "thank you" email can make a difference!</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>✉️</div>
            <h3>Follow Up Smartly</h3>
            <p>If you haven't heard back in a week, a polite follow-up shows genuine interest. Keep it brief, friendly, and express continued enthusiasm for the role.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Applications;