import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import DataService from '../services/dataService';
import { createUnifiedBookmarkHandler } from './utils/bookmarkHandler';
import ProfileBasedMatchingService from '../services/profileBasedMatchingService';

const Browse = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const bookmarkHandler = createUnifiedBookmarkHandler(user, navigate);
  const [sortBy, setSortBy] = useState(user ? 'match' : 'published'); 

  // Profile-based matching service same as Home.js
  const [matchingService] = useState(() => new ProfileBasedMatchingService());

  // State for dynamic data
  const [allInternships, setAllInternships] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingSmartMatching, setIsUsingSmartMatching] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState('');

  // Load data on component mount with smart matching
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setMatchingStatus('');
        
        // Load categories
        const categoriesResponse = await DataService.getCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        // For logged-in users, try to get smart matching data
        if (user) {
          console.log('Loading Browse data with profile-based matching for user...');
          
          try {
            // Check if user has profile data
            const savedProfile = localStorage.getItem('userProfileData');
            
            if (savedProfile && sortBy === 'match') {
              console.log('Using profile-based matching for browse sorting...');
              setMatchingStatus('Using AI matching for sorting');
              
              // Get profile-based recommendations for ALL internships (higher limit)
              const smartResult = await matchingService.getPersonalizedRecommendations({
                limit: 50, // Get more internships for browse page
                minMatchScore: 20 // Lower threshold to include more options
              });
              
              if (smartResult.success && smartResult.data.length > 0) {
                console.log('Profile-based matching successful for browse:', smartResult.data.length, 'internships');
                console.log('Algorithm used:', smartResult.metadata.algorithm);
                console.log('Weights:', smartResult.metadata.weights);
                setAllInternships(smartResult.data);
                setIsUsingSmartMatching(true);
                setMatchingStatus('✅ AI-powered sorting active (Master Formula)');
              } else {
                throw new Error('Profile-based matching returned no results');
              }
            } else {
              // Fallback to regular data loading
              throw new Error('No profile data or not using match sorting');
            }
          } catch (smartError) {
            console.warn('Profile-based matching failed for browse, using regular data:', smartError.message);
            setIsUsingSmartMatching(false);
            setMatchingStatus('⚠️ Using basic sorting (complete profile for AI sorting)');
            
            // Load regular internship data
            const internshipsResponse = await DataService.getAllInternships({
              sortBy: sortBy === 'match' ? 'published' : sortBy
            });
            
            if (internshipsResponse.success) {
              // Add basic match scores for logged-in users
              const internshipsWithScores = internshipsResponse.data.map(internship => ({
                ...internship,
                match: Math.floor(Math.random() * 40) + 40 // Random 40-80%
              }));
              setAllInternships(internshipsWithScores);
            }
          }
        } else {
          // For guests, load regular data without match scores
          console.log('Loading Browse data for guest user...');
          const internshipsResponse = await DataService.getAllInternships({
            sortBy: sortBy
          });
          
          if (internshipsResponse.success) {
            setAllInternships(internshipsResponse.data);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load internships. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, sortBy, matchingService]);

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
          source: 'browse_page'
        });
        
        navigate(`/apply/${internship.id}`);
      } else {
        navigate('/signup');
      }
    }

    else if (action === 'bookmark') {
    if (user) {
      try {
        console.log('🔖 Bookmarking from browse page:', internship.title);
        
        // Use the unified bookmark handler
        const result = await bookmarkHandler(internship, false, null);
        
        if (result && result.success) {
          console.log('✅ Bookmark successful from browse page');
          
          // Optional: Show success with navigation option
          const showBookmarks = window.confirm(
            `✅ "${internship.title}" has been bookmarked!\n\nWould you like to view your bookmarks page?`
          );
          
          if (showBookmarks) {
            navigate('/bookmarks');
          }
        }
      } catch (error) {
        console.error('❌ Error bookmarking from browse page:', error);
        alert('Failed to bookmark internship. Please try again.');
      }
    } else {
      navigate('/signup');
    }
  }

    else if (action === 'details') {
      navigate(`/internships/${internship.id}`);
    }
    else if (action === 'explain-match') {
      // Show explanation for why this internship matches
      if (user && internship && isUsingSmartMatching) {
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
            '📈 Detailed Breakdown:',
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
    else if (action === 'refresh-smart-sorting') {
      // Refresh with smart matching
      if (user) {
        setSortBy('match');
        // This will trigger the useEffect to reload with smart matching
      }
    }
    else if (action === 'test-matching') {
      // Test the matching algorithm
      if (user) {
        try {
          const userProfile = matchingService.getUserProfile();
          console.log('Testing matching algorithm with profile:', userProfile);
          
          const testResult = await matchingService.getPersonalizedRecommendations({
            limit: 5,
            minMatchScore: 30
          });
          
          if (testResult.success) {
            const avgMatch = testResult.data.reduce((sum, i) => sum + i.match, 0) / testResult.data.length;
            const metrics = matchingService.getMetrics();
            
            alert([
              '🧪 Matching Algorithm Test Results:',
              `✅ Success! Found ${testResult.data.length} recommendations`,
              `📊 Average match score: ${avgMatch.toFixed(1)}%`,
              `🤖 Algorithm: ${testResult.metadata.algorithm}`,
              `📚 Vocabulary size: ${testResult.metadata.vocabularySize}`,
              `💾 Total feedback recorded: ${metrics.totalFeedback}`,
              '',
              'Top matches:',
              ...testResult.data.slice(0, 3).map(i => `• ${i.title} (${i.match}%)`)
            ].join('\n'));
          } else {
            alert(`❌ Test failed: ${testResult.error}`);
          }
        } catch (error) {
          console.error('Test error:', error);
          alert(`❌ Test error: ${error.message}`);
        }
      }
    }
  };


  // Enhanced filtering and sorting
  const getFilteredAndSortedInternships = () => {
    let filtered = allInternships.filter(i => {
      const matchesCategory = selectedCategory === 'all' || i.category === selectedCategory;
      const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           i.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           i.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    // Sort based on selected criteria
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'match':
          return user ? (b.match || 0) - (a.match || 0) : 0; // Only sort by match for logged in users
        case 'deadline':
          return new Date(a.deadline.split('/').reverse().join('-')) - new Date(b.deadline.split('/').reverse().join('-'));
        case 'published':
          return new Date(b.postedDate.split('/').reverse().join('-')) - new Date(a.postedDate.split('/').reverse().join('-'));
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredInternships = getFilteredAndSortedInternships();

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
            <p>Loading internship opportunities...</p>
            {user && sortBy === 'match' && (
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                Applying Master Formula AI matching to sort by relevance...
              </p>
            )}
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

      {/* Page Header */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Browse All Internships</h1>
        <p className={styles.heroSubtitle}>
          {user && isUsingSmartMatching ? 
            '🤖 Master Formula AI-powered sorting to show the most relevant opportunities first' :
            'Discover opportunities from top companies across Singapore'
          }
        </p>
        
        {/* Smart Matching Status for logged-in users */}
        {user && (
          <div style={{ 
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <span style={{
              backgroundColor: isUsingSmartMatching ? 
                'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: isUsingSmartMatching ? '#10b981' : '#f59e0b',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: `1px solid ${isUsingSmartMatching ? 
                'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              {matchingStatus || (isUsingSmartMatching ? '✅ Master Formula AI active' : '📋 Basic sorting')}
            </span>
            
            {!isUsingSmartMatching && (
              <button
                onClick={() => handleAction('refresh-smart-sorting')}
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
                🤖 Try AI Sorting
              </button>
            )}
            
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => handleAction('test-matching')}
                style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🧪 Test Algorithm
              </button>
            )}
          </div>
        )}
        
        {/* Show data source info */}
        <div style={{ 
          marginTop: '1rem', 
          fontSize: '0.9rem', 
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span>📊 Data from LinkedIn, Indeed, JobsBank & more</span>
          <span>🔄 Updated daily</span>
          {user && isUsingSmartMatching && <span>🤖 Master Formula AI-ranked for you</span>}
        </div>
      </section>

      {/* Enhanced Search and Filter Section */}
      <section className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className={styles.filterControls}>
          {/* Category filters */}
          <div className={styles.categories}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.categoryChip} ${selectedCategory === cat.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.name}
                {cat.count > 0 && <span className={styles.badge}>{cat.count}</span>}
              </button>
            ))}
          </div>

          {/* Sort options */}
          <div className={styles.additionalFilters}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              {user && <option value="match">🤖 Master Formula Match Score</option>}
              <option value="published">📅 Recently Published</option>
              <option value="deadline">⏰ Application Deadline</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>
            {user && isUsingSmartMatching ? '🤖 Master Formula AI-Sorted Internships' : 'Available Internships'}
            <span className={styles.badge}>{filteredInternships.length}</span>
          </h2>
          <div className={styles.viewOptions}>
            <span>Showing {filteredInternships.length} of {allInternships.length} internships</span>
            {user && sortBy === 'match' && isUsingSmartMatching && (
              <span style={{ color: 'var(--success)', fontSize: '0.875rem', marginLeft: '1rem' }}>
                ✨ Sorted by Master Formula relevance to your profile
              </span>
            )}
          </div>
        </div>

        {filteredInternships.length === 0 ? (
          <div className={styles.noResults}>
            <h3>No internships found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button 
              className={styles.ctaPrimary} 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.internshipsGrid}>
            {filteredInternships.map(internship => (
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
                      {internship.match || 'N/A'}% Match
                      {isUsingSmartMatching && internship.match && (
                        <button
                          onClick={() => handleAction('explain-match', internship)}
                          title="Why this matches you (Master Formula breakdown)"
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

                {/* Additional info */}
                <div style={{
                  margin: '1rem 0',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📈 {internship.applicationCount} applications</span>
                    <span>🏢 {internship.companySize}</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📂 Source: {internship.source}</span>
                    {user && isUsingSmartMatching && sortBy === 'match' && (
                      <span style={{ color: 'var(--success)' }}>🤖 Master Formula ranked</span>
                    )}
                  </div>
                </div>

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
        )}
      </section>

      {/* Call to action for non-users */}
      {!user && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Applying?</h2>
            <p>Create an account to get Master Formula AI-powered recommendations and personalized sorting</p>
            <button className={styles.ctaPrimary} onClick={() => navigate('/signup')}>
              Get Master Formula AI Recommendations
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Browse;

// ms2 final
// a bit faulty still with the bookmark function will debug in ms3