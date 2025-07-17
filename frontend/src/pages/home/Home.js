import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../styles/Home.module.css';
import DataService from '../../services/dataService';
import ProfileBasedMatchingService from '../../services/profileBasedMatchingService';

const Home = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');


  // Profile-based matching service from services
  const [matchingService] = useState(() => new ProfileBasedMatchingService());

  const [internships, setInternships] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingError, setMatchingError] = useState(null);
  const [isUsingSmartMatching, setIsUsingSmartMatching] = useState(false);
  const [userStats, setUserStats] = useState({
    matches: 4,
    applications: 1,
    bookmarks: 2
  });

  // Load data on component with smart matching
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setMatchingError(null);
        
        // Load categories first
        const categoriesResponse = await DataService.getCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        // For logged-in users, try smart matching first
        if (user) {
          console.log('Loading data for logged-in user with profile-based matching...');
          
          try {
            // Check if there is profile data for smart matching
            const savedProfile = localStorage.getItem('userProfileData');
            console.log('Profile data available:', !!savedProfile);
            
            if (savedProfile) {
              const profileData = JSON.parse(savedProfile);
              console.log('Profile data for matching:', {
                skills: profileData.skills?.length || 0,
                major: profileData.major || 'not set',
                university: profileData.university || 'not set',
                location: profileData.location || 'not set'
              });
              
              // Try profile-based matching
              const smartRecommendations = await matchingService.getPersonalizedRecommendations({
                limit: 8,
                minMatchScore: 30
              });
              
              if (smartRecommendations.success && smartRecommendations.data.length > 0) {
                console.log('Profile-based matching successful:', smartRecommendations.data.length, 'recommendations');
                console.log('Algorithm used:', smartRecommendations.metadata.algorithm);
                console.log('Weights applied:', smartRecommendations.metadata.weights);
                console.log('Match scores:', smartRecommendations.data.map(i => `${i.title}: ${i.match}%`));
                
                setInternships(smartRecommendations.data);
                setIsUsingSmartMatching(true);
                
                // Update user stats based on matches
                const avgMatch = smartRecommendations.data.reduce((sum, i) => sum + i.match, 0) / smartRecommendations.data.length;
                const highMatches = smartRecommendations.data.filter(i => i.match > 70).length;
                setUserStats(prev => ({ 
                  ...prev, 
                  matches: highMatches
                }));
                
              } else {
                throw new Error('Profile-based matching returned no results');
              }
            } else {
              console.log('No profile data found, using fallback');
              throw new Error('No profile data available for smart matching');
            }
            
          } catch (smartError) {
            console.warn('Profile-based matching failed, using fallback:', smartError.message);
            setMatchingError(smartError.message);
            setIsUsingSmartMatching(false);
            
            // Fallback to regular recommendations
            const fallbackResponse = await DataService.getAllInternships({
              sortBy: 'posted',
              limit: 8
            });
            
            if (fallbackResponse.success) {
              // Add random match scores for display
              const internshipsWithScores = fallbackResponse.data.slice(0, 8).map(internship => ({
                ...internship,
                match: Math.floor(Math.random() * 40) + 50 // Random 50-90%
              }));
              setInternships(internshipsWithScores);
            }
          }
        } else {
          // For guests, show general popular internships
          console.log('Loading data for guest user...');
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
        setMatchingError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, matchingService]);

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
    { path: '/about', label: 'About', icon: '🏢' }
  ];

  // Handle various actions with smart matching feedback
  const handleAction = async (action, internship = null) => {
    if (action === 'logout') { 
      logout(); 
      navigate('/login'); 
    }
    else if (action === 'apply') {
      if (user) {
        // Record feedback for algorithm improvement
        matchingService.recordFeedback({
          type: 'applied',
          internshipId: internship.id,
          userId: user.id,
          match: internship.match,
          category: internship.category,
          source: 'home_page'
        });
        
        navigate(`/apply/${internship.id}`);
      } else {
        navigate('/signup');
      }
    }
    else if (action === 'bookmark') {
      if (user) {
        try {
          // Record feedback
          matchingService.recordFeedback({
            type: 'bookmarked',
            internshipId: internship.id,
            userId: user.id,
            match: internship.match,
            category: internship.category,
            source: 'home_page'
          });
          
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

    else if (action === 'refresh-recommendations') {
      // Manually refresh recommendations
      setLoading(true);
      try {
        const freshRecommendations = await matchingService.getPersonalizedRecommendations({
          limit: 8,
          minMatchScore: 25
        });
        
        if (freshRecommendations.success) {
          setInternships(freshRecommendations.data);
          setIsUsingSmartMatching(true);
          setMatchingError(null);
          
          // Update stats
          const avgMatch = freshRecommendations.data.reduce((sum, i) => sum + i.match, 0) / freshRecommendations.data.length;
          const highMatches = freshRecommendations.data.filter(i => i.match > 70).length;
          setUserStats(prev => ({ 
            ...prev, 
            matches: highMatches
          }));
          
          alert(`✅ Recommendations refreshed! Found ${freshRecommendations.data.length} matches.`);
        }
      } catch (error) {
        setMatchingError(error.message);
        alert('Failed to refresh recommendations');
      } finally {
        setLoading(false);
      }
    }
    else if (action === 'explain-match') {
      // Show explanation for why this internship was recommended
      if (user && internship) {
        try {
          const userProfile = matchingService.getUserProfile();
          const explanation = matchingService.explainRecommendation(userProfile, internship);
          
          const explanationText = [
            `🎯 Match Score: ${explanation.score}%`,
            `📊 Recommendation: ${explanation.recommendation}`,
            '',
            '💡 Why this matches you:',
            ...explanation.explanations,
            '',
            '📈 Master Formula Breakdown:',
            `• Content Similarity: ${explanation.breakdown.contentSimilarity}%`,
            `• Skill Match: ${explanation.breakdown.skillMatch}%`,
            `• Experience Relevance: ${explanation.breakdown.experienceRelevance}%`,
            `• Education Relevance: ${explanation.breakdown.educationRelevance}%`,
            `• Location Score: ${explanation.breakdown.locationScore}%`,
            `• Category Score: ${explanation.breakdown.categoryScore}%`,
            `• Experience Level: ${explanation.breakdown.experienceLevelScore}%`
          ].join('\n');
          
          alert(explanationText);
        } catch (error) {
          console.error('Error generating explanation:', error);
          alert('Unable to generate explanation at this time.');
        }
      }
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
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>{user ? 'Loading Master Formula AI-powered internship recommendations...' : 'Loading internships...'}</p>
            {user && <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Analysing your profile </p>}
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
          {user ? (isUsingSmartMatching ? 
            '🤖 AI recommendations based on your profile' : 
            'Complete your profile to get AI-powered recommendations') : 
           'Connect with top companies and land your ideal internship.'}
        </p>
        
        {/* Smart Matching Status */}
        {user && (
          <div style={{ 
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {isUsingSmartMatching ? (
              <span style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                ✅Formula active
              </span>
            ) : (
              <span style={{
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#f59e0b',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                ⚠️ Complete profile for AI matching
              </span>
            )}
            
            <button
              onClick={() => handleAction('refresh-recommendations')}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Matches
            </button>
          </div>
        )}
        
        {matchingError && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            borderRadius: '8px',
            fontSize: '0.875rem',
            maxWidth: '600px',
            margin: '1rem auto 0'
          }}>
            ⚠️ Complete your profile for better AI recommendations.
          </div>
        )}
        
        {user && (
          <div className={styles.userStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{userStats.matches}</span>
              <span className={styles.statLabel}>High Matches (70%+)</span>
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



      {/* Search Section */}
      <section className={styles.searchSection}>
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
            {user ? (isUsingSmartMatching ? '🤖 AI Recommendations' : 'Popular Internships') : 'Featured Internships'}
            <span className={styles.badge}>{filtered.length}</span>
          </h2>
          <button className={styles.viewAllButton} onClick={() => navigate('/internships')}>
            View All
          </button>
        </div>

        <div className={styles.internshipsGrid}>
          {filtered.map(internship => (
            <div key={internship.id} className={styles.internshipCard}>
              {/* Top-right container for match badge and bookmark */}
              <div style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                display: 'flex', 
                gap: '0.5rem',
                alignItems: 'flex-start',
                zIndex: 2
              }}>
                {user && (
                  <div className={styles.matchBadge} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem' 
                  }}>
                    {internship.match}% Match
                    {isUsingSmartMatching && (
                      <button
                        onClick={() => handleAction('explain-match', internship)}
                        title="Why this matches you"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          fontSize: '0.8em',
                          padding: '0.2rem'
                        }}
                      >
                        ❓
                      </button>
                    )}
                  </div>
                )}
                <button 
                  className={styles.bookmarkButton} 
                  onClick={() => handleAction('bookmark', internship)}
                  aria-label="Bookmark this internship"
                >
                  🔖
                </button>
              </div>
              
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

              {/* Formula indicator */}
              {user && isUsingSmartMatching && (
                <div style={{
                  margin: '1rem 0',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--success)',
                  textAlign: 'center',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  🤖 AI Recommended
                </div>
              )}

              {/* Action buttons */}
              <div className={styles.cardActions}>
                <button 
                  className={styles.applyButton} 
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
              <h3>{isUsingSmartMatching ? '95%' : 'N/A'}</h3>
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

//milestone 2 final