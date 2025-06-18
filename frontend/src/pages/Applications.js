import React, { useState } from 'react';
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

  // Redirect users who aren't logged in
  React.useEffect(() => {
    if (!user && !isGuest) {
      navigate('/login');
    }
  }, [user, isGuest, navigate]);

  // Sample application data - in production this would come from an API
  const userApplications = [
    {
      id: 1,
      internshipId: 1,
      jobTitle: 'Software Engineering Intern',
      companyName: 'TechCorp Singapore',
      companyLogo: '💻',
      applicationStatus: 'pending',
      dateApplied: '2025-05-15',
      applicationDeadline: '15/06/2025',
      currentStep: 'Waiting for HR to review application',
      monthlySalary: 'S$1,200/month',
      internshipDuration: '3 months',
      workLocation: 'Singapore',
      upcomingInterview: null,
      personalNotes: 'Applied through university career portal. Really excited about this one - they work on projects I use daily!',
      submittedDocuments: ['Resume', 'Cover Letter']
    },
    {
      id: 2,
      internshipId: 5,
      jobTitle: 'Backend Developer Intern',
      companyName: 'CloudTech Solutions',
      companyLogo: '⚙️',
      applicationStatus: 'interview',
      dateApplied: '2025-05-10',
      applicationDeadline: '18/06/2025',
      currentStep: 'Technical interview scheduled for next week',
      monthlySalary: 'S$1,300/month',
      internshipDuration: '4 months',
      workLocation: 'Singapore',
      upcomingInterview: '2025-06-20',
      personalNotes: 'Had a great phone screening with the team lead. She mentioned they were impressed with my Python side projects, especially the web scraper I built for my course!',
      submittedDocuments: ['Resume', 'Cover Letter', 'GitHub Portfolio']
    },
    {
      id: 3,
      internshipId: 2,
      jobTitle: 'Data Science Intern',
      companyName: 'Analytics Plus',
      companyLogo: '📊',
      applicationStatus: 'accepted',
      dateApplied: '2025-05-05',
      applicationDeadline: '20/06/2025',
      currentStep: 'Submit final onboarding documents',
      monthlySalary: 'S$1,100/month',
      internshipDuration: '6 months',
      workLocation: 'Singapore',
      upcomingInterview: '2025-05-25',
      personalNotes: 'YES! Got the offer! 🎉 They loved my final year project on customer behavior analysis. Need to submit health forms and sign contract by June 1st.',
      submittedDocuments: ['Resume', 'Cover Letter', 'Academic Transcript', 'Reference Letter']
    },
    {
      id: 4,
      internshipId: 3,
      jobTitle: 'Marketing Intern',
      companyName: 'Creative Agency',
      companyLogo: '📈',
      applicationStatus: 'rejected',
      dateApplied: '2025-04-28',
      applicationDeadline: '10/06/2025',
      currentStep: 'Application closed',
      monthlySalary: 'S$1,200/month',
      internshipDuration: '4 months',
      workLocation: 'Singapore',
      upcomingInterview: null,
      personalNotes: 'Didn\'t get this one - they went with someone who had more TikTok marketing experience. But great practice for interviews! The feedback was actually helpful.',
      submittedDocuments: ['Resume', 'Cover Letter', 'Portfolio']
    }
  ];

  // Navigation items for the header
  const navigationItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' }
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
    { id: 'pending', label: 'Under Review', count: userApplications.filter(app => app.applicationStatus === 'pending').length },
    { id: 'interview', label: 'Interview Stage', count: userApplications.filter(app => app.applicationStatus === 'interview').length },
    { id: 'accepted', label: 'Got the Job! 🎉', count: userApplications.filter(app => app.applicationStatus === 'accepted').length },
    { id: 'rejected', label: 'Not This Time', count: userApplications.filter(app => app.applicationStatus === 'rejected').length }
  ];

  // Handle various user interactions
  const handleUserAction = (actionType, applicationData = null) => {
    switch (actionType) {
      case 'logout':
        logout();
        navigate('/login');
        break;
      case 'viewDetails':
        navigate(`/internships/${applicationData.internshipId}`);
        break;
      case 'editNotes':
        navigate(`/applications/${applicationData.id}/edit`);
        break;
      case 'withdrawApplication':
        if (window.confirm('Are you sure you want to withdraw this application?')) {
          // TODO: Implement withdrawal logic
          alert('Application withdrawn');
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
        application.applicationStatus === currentTab
      );
    }

    // Apply sorting
    filteredResults.sort((applicationA, applicationB) => {
      switch (sortOption) {
        case 'applied':
          return new Date(applicationB.dateApplied) - new Date(applicationA.dateApplied);
        case 'deadline':
          const deadlineA = new Date(applicationA.applicationDeadline.split('/').reverse().join('-'));
          const deadlineB = new Date(applicationB.applicationDeadline.split('/').reverse().join('-'));
          return deadlineA - deadlineB;
        case 'status':
          const statusPriority = { 'accepted': 0, 'interview': 1, 'pending': 2, 'rejected': 3 };
          return statusPriority[applicationA.applicationStatus] - statusPriority[applicationB.applicationStatus];
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
    pendingReviews: userApplications.filter(app => app.applicationStatus === 'pending').length,
    scheduledInterviews: userApplications.filter(app => app.applicationStatus === 'interview').length,
    successfulApplications: userApplications.filter(app => app.applicationStatus === 'accepted').length,
    successRate: userApplications.length > 0 ? 
      Math.round((userApplications.filter(app => app.applicationStatus === 'accepted').length / userApplications.length) * 100) : 0
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
                  style={{ backgroundColor: statusConfiguration[application.applicationStatus].color }}
                >
                  {statusConfiguration[application.applicationStatus].icon} {statusConfiguration[application.applicationStatus].label}
                </div>
                
                <div className={styles.cardHeader}>
                  <div className={styles.companyLogo}>{application.companyLogo}</div>
                  <div className={styles.companyInfo}>
                    <h3 className={styles.jobTitle}>{application.jobTitle}</h3>
                    <p className={styles.companyName}>{application.companyName}</p>
                  </div>
                </div>

                <div className={styles.jobDetails}>
                  <div className={styles.detailItem}>
                    <span>📅</span> Applied: {new Date(application.dateApplied).toLocaleDateString()}
                  </div>
                  <div className={styles.detailItem}>
                    <span>⏰</span> Deadline: {application.applicationDeadline}
                  </div>
                  <div className={styles.detailItem}>
                    <span>📍</span> {application.workLocation}
                  </div>
                  <div className={styles.detailItem}>
                    <span>💰</span> {application.monthlySalary}
                  </div>
                </div>

                {application.upcomingInterview && (
                  <div className={styles.interviewInfo}>
                    Interview: {new Date(application.upcomingInterview).toLocaleDateString()}
                  </div>
                )}

                <div className={styles.nextStep}>
                  <strong>Next Step:</strong> {application.currentStep}
                </div>

                {application.personalNotes && (
                  <div className={styles.applicationNotes}>
                    <strong>Notes:</strong>
                    {application.personalNotes}
                  </div>
                )}

                <div className={styles.documents}>
                  <strong>Documents:</strong>
                  <div>
                    {application.submittedDocuments.map(doc => (
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
                  {(application.applicationStatus === 'pending' || application.applicationStatus === 'interview') && (
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

      {/* Upcoming Deadlines Section */}
      {userApplications.filter(app => {
        const deadlineDate = new Date(app.applicationDeadline.split('/').reverse().join('-'));
        const today = new Date();
        const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7 && daysUntil > 0 && 
         (app.applicationStatus === 'pending' || app.applicationStatus === 'interview');
      }).length > 0 && (
        <section className={styles.upcomingSection}>
          <h2>🚨 Upcoming Deadlines</h2>
          <div className={styles.upcomingDeadlines}>
            {userApplications
              .filter(app => {
                const deadlineDate = new Date(app.applicationDeadline.split('/').reverse().join('-'));
                const today = new Date();
                const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
                return daysUntil <= 7 && daysUntil > 0 &&
                  (app.applicationStatus === 'pending' || app.applicationStatus === 'interview');
              })
              .map(app => {
                const deadlineDate = new Date(app.applicationDeadline.split('/').reverse().join('-'));
                const today = new Date();
                const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
                return (
                  <div key={app.id} className={styles.deadlineCard}>
                    <div className={styles.deadlineInfo}>
                      <span className={styles.companyName}>{app.companyName}</span>
                      <span className={styles.jobTitle}>{app.jobTitle}</span>
                    </div>
                    <div className={styles.deadlineTime}>
                      <span className={styles.daysLeft}>
                        {daysUntil === 1 ? '1 day left' : `${daysUntil} days left`}
                      </span>
                      <span className={styles.deadlineDate}>{app.applicationDeadline}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

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