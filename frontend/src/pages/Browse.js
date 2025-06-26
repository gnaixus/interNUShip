import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import DataService from '../services/dataService';

const Browse = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('match'); // match, published, deadline

  // State for dynamic data
  const [allInternships, setAllInternships] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load categories
        const categoriesResponse = await DataService.getCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        // Load all internships with user profile for matching
        const userProfile = user ? {
          skills: ['React', 'JavaScript', 'Python', 'Node.js'],
          preferredCategories: ['technology', 'data'],
          location: 'Singapore',
          experienceLevel: 'beginner'
        } : null;

        const internshipsResponse = await DataService.getAllInternships({
          sortBy: sortBy,
          userProfile: userProfile
        });
        
        if (internshipsResponse.success) {
          setAllInternships(internshipsResponse.data);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load internships. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, sortBy]);

  const navItems = user ? [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' }
  ] : [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/how-it-works', label: 'How It Works', icon: '❓' },
    { path: '/about', label: 'About', icon: '🏢' }
  ];

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
          const response = await DataService.bookmarkInternship(user.id, internship.id, 'Saved from browse page');
          if (response.success) {
            alert(`Bookmarked: ${internship.title}`);
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
          return user ? b.match - a.match : 0; // Only sort by match for logged in users
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
          Discover opportunities from top companies across Singapore
        </p>
        
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
              {user && <option value="match">Best Match</option>}
              <option value="published">Recently Published</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>
            Available Internships
            <span className={styles.badge}>{filteredInternships.length}</span>
          </h2>
          <div className={styles.viewOptions}>
            <span>Showing {filteredInternships.length} of {allInternships.length} internships</span>
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
                {user && <div className={styles.matchBadge}>{internship.match}% Match</div>}
                
                <div className={styles.cardHeader}>
                  <div className={styles.companyLogo}>{internship.logo}</div>
                  <div className={styles.companyInfo}>
                    <h3 className={styles.jobTitle}>{internship.title}</h3>
                    <p className={styles.companyName}>{internship.company}</p>
                  </div>
                  <button className={styles.bookmarkButton} onClick={() => handleAction('bookmark', internship)}>
                    🔖
                  </button>
                </div>

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
                  <div style={{ marginTop: '0.5rem' }}>
                    <span>📂 Source: {internship.source}</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.applyButton} onClick={() => handleAction('apply', internship)}>
                    {user ? 'Apply Now' : 'Sign Up to Apply'}
                  </button>
                  <button className={styles.detailsButton} onClick={() => handleAction('details', internship)}>
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
            <p>Create an account to apply for internships and get personalized recommendations</p>
            <button className={styles.ctaPrimary} onClick={() => navigate('/signup')}>
              Create Account
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Browse;