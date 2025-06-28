import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../styles/Home.module.css';
import DataService from '../../services/dataService';

const Home = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  // State for dynamic data
  const [internships, setInternships] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    matches: 4,
    applications: 1,
    bookmarks: 2
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories
        const categoriesResponse = await DataService.getCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        // Load featured internships
        if (user) {
          // For logged-in users, use personalized recommendations
          const userProfile = {
            id: user.id,
            skills: user.skills || ['React', 'JavaScript', 'Python', 'Node.js'],
            experience: user.experience || [],
            education: user.education || [],
            location: user.location || 'Singapore',
            preferredCategories: user.preferredCategories || ['technology', 'data'],
            experienceLevel: user.experienceLevel || 'beginner'
          };
          
          const recommendationsResponse = await DataService.getRecommendations(userProfile, 8);
          if (recommendationsResponse.success) {
            setInternships(recommendationsResponse.data);
          }
        } else {
          // For guests, show general popular internships
          const internshipsResponse = await DataService.getAllInternships({
            sortBy: 'posted',
            limit: 8
          });
          if (internshipsResponse.success) {
            setInternships(internshipsResponse.data.slice(0, 8));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Navigation items
  const navItems = user ? [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
   { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/about', label: 'About', icon: '🏢' }  
] : [
   { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
   { path: '/how-it-works', label: 'How It Works', icon: '❓' },
   { path: '/about', label: 'About', icon: '🏢' }
];

  // Handle various actions
  const handleAction = async (action, internship = null) => {
    if (action === 'logout') { 
      logout(); 
      navigate('/login'); 
    }
    else if (action === 'apply') {
      if (user) {
        navigate(`/apply/${internship.id}`);
      } else {
        navigate('/signup');
      }
    }
    else if (action === 'bookmark') {
      if (user) {
        try {
          const response = await DataService.bookmarkInternship(user.id, internship.id, 'Saved from home page');
          if (response.success) {
            alert(`Bookmarked: ${internship.title}`);
            setUserStats(prev => ({ ...prev, bookmarks: prev.bookmarks + 1 }));
          }
        } catch (error) {
          console.error('Error bookmarking:', error);
          alert('Failed to bookmark internship');
        }
      } else {
        navigate('/signup');
      }
    }
    else if (action === 'details') {
      navigate(`/internships/${internship.id}`);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    
    try {
      // Simulate upload and parsing
      await new Promise(resolve => setTimeout(resolve, 3000));
      setResumeUploaded(true);
      alert('Resume uploaded and parsed successfully! Your profile has been updated.');
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Filter internships based on search and category
  const filtered = internships.filter(i => 
    (selectedCategory === 'all' || i.category === selectedCategory) &&
    (i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     i.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
     i.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loading) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>Loading AI-powered internship recommendations...</p>
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
            {user && <span>👋 {user.full_name || user.email}</span>}
            {isGuest && <span>🔍 Browsing as Guest</span>}
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
          {user && (
            <>
              <button className={styles.profileBtn} onClick={() => navigate('/profile')}>Profile</button>
              <button className={styles.logoutBtn} onClick={() => handleAction('logout')}>Logout</button>
            </>
          )}
          {!user && !isGuest && (
            <>
              <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
              <button className={styles.signupBtn} onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
          {isGuest && (
            <button className={styles.signupBtn} onClick={() => navigate('/signup')}>Sign Up</button>
          )}
          <button className={styles.mobileNavToggle}>☰</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          {user ? `Welcome back, ${user.full_name || user.email}!` : 
           isGuest ? 'Discover Your Dream Internship' : 'Find Your Perfect Internship at NUS'}
        </h1>
        <p className={styles.heroSubtitle}>
          {user ? 'AI-powered recommendations tailored just for you' : 
           'Connect with top companies and land your ideal internship.'}
        </p>
        
        {user && (
          <div className={styles.userStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userStats.matches}</span>
              <span className={styles.statLabel}>New Matches</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userStats.applications}</span>
              <span className={styles.statLabel}>Applications</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userStats.bookmarks}</span>
              <span className={styles.statLabel}>Bookmarks</span>
            </div>
          </div>
        )}
      </section>

      {/* Resume Upload Section - Only for logged in users */}
      {user && (
        <section className={styles.resumeUploadSection}>
          <div className={styles.resumeUploadCard}>
            <div className={styles.resumeUploadContent}>
              <div className={styles.resumeUploadIcon}>
                {resumeUploaded ? '✅' : '🤖'}
              </div>
              <div className={styles.resumeUploadText}>
                <h3 className={styles.resumeUploadTitle}>
                  {resumeUploaded ? 'AI Recommendations Active!' : 'Boost Your AI Matching'}
                </h3>
                <p className={styles.resumeUploadSubtitle}>
                  {resumeUploaded 
                    ? 'Your resume has been analyzed by our AI algorithm. You\'re getting personalized matches!'
                    : 'Upload your resume to get AI-powered internship recommendations and auto-fill application forms'
                  }
                </p>
              </div>
              <div className={styles.resumeUploadActions}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleResumeUpload}
                  accept=".pdf"
                  style={{ display: 'none' }}
                />
                <button
                  className={styles.modernUploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className={styles.uploadSpinner}></span>
                      <span>Analyzing Resume...</span>
                    </>
                  ) : resumeUploaded ? (
                    <>
                      <span className={styles.uploadIcon}>🔄</span>
                      <span>Update Resume</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.uploadIcon}>📁</span>
                      <span>Upload Resume</span>
                    </>
                  )}
                </button>
                {resumeUploaded && (
                  <button 
                    className={styles.viewProfileBtn}
                    onClick={() => navigate('/profile')}
                  >
                    View Profile
                  </button>
                )}
              </div>
            </div>
            {!resumeUploaded && (
              <div className={styles.resumeUploadFeatures}>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>🎯</span>
                  <span>AI-powered matching</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>⚡</span>
                  <span>Auto-fill applications</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>📊</span>
                  <span>Track your progress</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Search Section */}
      <section className={styles.searchSection}>
        <h2>Find Your Next Opportunity</h2>
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search internships, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className={styles.categories}>
          {categories.map(cat => (
              <button
                  key={cat.id}
                  className={`${styles.categoryChip} ${selectedCategory === cat.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                 >
                  {cat.icon} {cat.name}
              </button>
              ))}
          </div>
      </section>
      
      {/* Featured Internships */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>
            {user ? '🤖 AI-Powered Recommendations' : 'Featured Internships'}
            <span className={styles.badge}>{filtered.length}</span>
          </h2>
          <button className={styles.viewAllButton} onClick={() => navigate('/internships')}>
            View All
          </button>
        </div>

        <div className={styles.internshipsGrid}>
          {filtered.map(internship => (
            <div key={internship.id} className={styles.internshipCard}>
              {/* Top-right elements (match badge and bookmark) */}
              {user && (
                <div className={styles.cardTopRight}>
                  <div className={styles.matchBadge}>{internship.match}% Match</div>
                  <button 
                    className={styles.bookmarkButton} 
                    onClick={() => handleAction('bookmark', internship)}
                    aria-label="Bookmark this internship"
                  >
                    🔖
                  </button>
                </div>
              )}
              
              {/* Card header with company info */}
              <div className={styles.cardHeader}>
                <div className={styles.companyLogo}>{internship.logo}</div>
                <div className={styles.companyInfo}>
                  <h3 className={styles.jobTitle}>{internship.title}</h3>
                  <p className={styles.companyName}>{internship.company}</p>
                </div>
              </div>

              {/* Job details grid */}
              <div className={styles.jobDetails}>
                <div className={styles.detailItem}>
                  <span>📍</span> {internship.location}
                </div>
                <div className={styles.detailItem}>
                  <span>💰</span> {internship.stipend}
                </div>
                <div className={styles.detailItem}>
                  <span>⏱️</span> {internship.duration}
                </div>
                <div className={styles.detailItem}>
                  <span>📅</span> Due {internship.deadline}
                </div>
              </div>

              {/* Job description */}
              <p className={styles.jobDescription}>{internship.description}</p>

              {/* Skills tags */}
              <div className={styles.skillsTags}>
                {internship.skills.slice(0, 4).map(skill => (
                  <span key={skill} className={styles.skillTag}>{skill}</span>
                ))}
                {internship.skills.length > 4 && (
                  <span className={styles.skillTag}>+{internship.skills.length - 4} more</span>
                )}
              </div>

              {/* Action buttons */}
              <div className={styles.cardActions}>
                <button 
                  className={styles.applyButton} 
                  data-guest={!user ? "true" : "false"}
                  onClick={() => handleAction('apply', internship)}
                >
                  {user ? 'Apply Now' : 'Sign Up to Apply'}
                </button>
                <button 
                  className={styles.detailsButton} 
                  onClick={() => handleAction('details', internship)}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={styles.noResults}>
            <h3>No internships found</h3>
            <p>Try adjusting your search terms or category filters</p>
          </div>
        )}
      </section>

      {/* Platform Statistics */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎯</div>
            <div className={styles.statContent}>
              <h3>{internships.length}+</h3>
              <p>Active Internships</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🤖</div>
            <div className={styles.statContent}>
              <h3>95%</h3>
              <p>AI Match Accuracy</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>87%</h3>
              <p>Success Rate</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏢</div>
            <div className={styles.statContent}>
              <h3>150+</h3>
              <p>Partner Companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section for non-users */}
      {!user && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Your AI-Powered Journey?</h2>
            <p>Join thousands of NUS students using our smart matching algorithm</p>
            <button className={styles.ctaPrimary} onClick={() => navigate('/signup')}>
              Get AI Recommendations
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;