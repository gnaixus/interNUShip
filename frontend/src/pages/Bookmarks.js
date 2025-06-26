import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import DataService from '../services/dataService';

const Bookmarks = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for filtering and sorting bookmarks
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('saved'); // saved, deadline, match

  // State for dynamic data
  const [bookmarkedInternships, setBookmarkedInternships] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect users who aren't logged in
  useEffect(() => {
    if (!user && !isGuest) {
      navigate('/login');
    }
  }, [user, isGuest, navigate]);

  // Load bookmarks data
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load categories
        const categoriesResponse = await DataService.getCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        // Load user's bookmarks
        const bookmarksResponse = await DataService.getUserBookmarks(user.id);
        if (bookmarksResponse.success) {
          setBookmarkedInternships(bookmarksResponse.data);
        }
      } catch (err) {
        console.error('Error loading bookmarks:', err);
        setError('Failed to load bookmarks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [user]);

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  const statusColors = {
    'not-applied': '#6b7280',
    'planning': '#3b82f6',
    'applied': '#10b981',
    'considering': '#8b5cf6'
  };

  const navigationItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/internships', label: 'Browse', icon: '🔍' },
    { path: '/applications', label: 'Applications', icon: '📝' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' }
  ];

  // Handle various user interactions
  const handleAction = async (action, internship = null) => {
    switch (action) {
      case 'logout':
        logout();
        navigate('/login');
        break;
      case 'apply':
        if (user) {
          navigate(`/apply/${internship.id}`);
        } else {
          navigate('/signup');
        }
        break;
      case 'removeBookmark':
        if (window.confirm(`Remove "${internship.title}" from bookmarks?`)) {
          try {
            const response = await DataService.removeBookmark(user.id, internship.id);
            if (response.success) {
              setBookmarkedInternships(prev => 
                prev.filter(bookmark => bookmark.id !== internship.id)
              );
              alert(`Removed "${internship.title}" from bookmarks`);
            }
          } catch (error) {
            console.error('Error removing bookmark:', error);
            alert('Failed to remove bookmark. Please try again.');
          }
        }
        break;
      case 'viewDetails':
        navigate(`/internships/${internship.id}`);
        break;
      case 'editNotes':
        const newNotes = prompt('Edit your notes:', internship.notes);
        if (newNotes !== null) {
          // Update locally (in real app, this would call API)
          setBookmarkedInternships(prev => 
            prev.map(bookmark => 
              bookmark.id === internship.id 
                ? { ...bookmark, notes: newNotes }
                : bookmark
            )
          );
          alert('Notes updated!');
        }
        break;
      case 'changePriority':
        const priorities = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(internship.priority);
        const newPriority = priorities[(currentIndex + 1) % priorities.length];
        
        // Update locally (in real app, this would call API)
        setBookmarkedInternships(prev => 
          prev.map(bookmark => 
            bookmark.id === internship.id 
              ? { ...bookmark, priority: newPriority }
              : bookmark
          )
        );
        alert(`Priority changed to ${newPriority}`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Filter and sort bookmarks
  const getFilteredBookmarks = () => {
    let filtered = bookmarkedInternships.filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || internship.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort bookmarks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'saved':
          return new Date(b.bookmarkedDate) - new Date(a.bookmarkedDate);
        case 'deadline':
          return new Date(a.deadline.split('/').reverse().join('-')) - new Date(b.deadline.split('/').reverse().join('-'));
        case 'match':
          return user ? b.match - a.match : 0;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredBookmarks = getFilteredBookmarks();

  // Calculate quick stats
  const bookmarkStats = {
    total: bookmarkedInternships.length,
    notApplied: bookmarkedInternships.filter(b => b.status === 'not-applied').length,
    applied: bookmarkedInternships.filter(b => b.status === 'applied').length,
    highPriority: bookmarkedInternships.filter(b => b.priority === 'high').length
  };

  // Show login prompt for non-authenticated users
  if (!user) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.userHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.userInfo}>
              <span>🔍 Please log in to view bookmarks</span>
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
          <h1 className={styles.heroTitle}>Your Bookmark Collection</h1>
          <p className={styles.heroSubtitle}>Sign in to save and organize your favorite internships</p>
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
            <p>Loading your bookmarks...</p>
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
          <button className={styles.logoutBtn} onClick={() => handleAction('logout')}>
            Logout
          </button>
          <button className={styles.mobileNavToggle}>☰</button>
        </div>
      </div>

      {/* Page Header */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>🔖 Your Saved Internships</h1>
        <p className={styles.heroSubtitle}>
          Keep track of opportunities that caught your eye and plan your applications strategically
        </p>

        {/* Quick Stats */}
        <div className={styles.userStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bookmarkStats.total}</span>
            <span className={styles.statLabel}>Saved</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bookmarkStats.notApplied}</span>
            <span className={styles.statLabel}>To Apply</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bookmarkStats.highPriority}</span>
            <span className={styles.statLabel}>High Priority</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bookmarkStats.applied}</span>
            <span className={styles.statLabel}>Applied</span>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search your bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
              <option value="saved">Recently Saved</option>
              <option value="deadline">Deadline</option>
              <option value="priority">Priority</option>
              {user && <option value="match">Best Match</option>}
            </select>
          </div>
        </div>
      </section>

      {/* Bookmarks List */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>
            Your Collection
            <span className={styles.badge}>{filteredBookmarks.length}</span>
          </h2>
          <button className={styles.viewAllButton} onClick={() => navigate('/internships')}>
            Find More
          </button>
        </div>

        {filteredBookmarks.length === 0 ? (
          <div className={styles.noResults}>
            <h3>No bookmarks found</h3>
            {searchTerm || selectedCategory !== 'all' ? (
              <p>Try adjusting your search or filters</p>
            ) : (
              <>
                <p>You haven't saved any internships yet!</p>
                <div className={styles.viewOptions}>
                  <p>💡 Pro tip: Click the bookmark icon 🔖 on any internship card to save it here</p>
                </div>
              </>
            )}
            <button className={styles.ctaPrimary} onClick={() => navigate('/internships')}>
              Browse Internships
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
            gap: '2rem',
            marginTop: '2rem',
            maxWidth: '1400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {filteredBookmarks.map(internship => (
              <div key={internship.id} style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                transition: 'var(--transition)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '580px'
              }}>
                {/* Top gradient bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'var(--accent-gradient)'
                }} />

                {/* Priority and Match badges */}
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  left: '1rem', 
                  display: 'flex', 
                  gap: '0.5rem', 
                  zIndex: 2 
                }}>
                  <div style={{
                    backgroundColor: priorityColors[internship.priority],
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {internship.priority}
                  </div>
                  {user && (
                    <div style={{
                      background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {internship.match}% Match
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: statusColors[internship.status],
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  zIndex: 2
                }}>
                  {internship.status.replace('-', ' ')}
                </div>

                {/* Header with company info */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '1rem', 
                  marginBottom: '1.5rem',
                  marginTop: '2.5rem'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--border-radius)',
                    padding: '0.75rem',
                    border: '1px solid var(--glass-border)',
                    width: '70px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {internship.logo}
                  </div>
                  <div style={{ flex: 1, minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{
                      color: 'var(--text-primary)',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.3'
                    }}>
                      {internship.title}
                    </h3>
                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '1rem',
                      margin: 0,
                      lineHeight: '1.2'
                    }}>
                      {internship.company}
                    </p>
                  </div>
                </div>

                {/* Job details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  margin: '1rem 0',
                  minHeight: '100px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-subtle)', fontSize: '0.9rem' }}>
                    <span>📍</span> {internship.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-subtle)', fontSize: '0.9rem' }}>
                    <span>💰</span> {internship.stipend}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-subtle)', fontSize: '0.9rem' }}>
                    <span>⏱️</span> {internship.duration}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-subtle)', fontSize: '0.9rem' }}>
                    <span>📅</span> Due {internship.deadline}
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  margin: '1rem 0',
                  flex: 1,
                  minHeight: '60px'
                }}>
                  {internship.description}
                </p>

                {/* Skills */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  margin: '1rem 0',
                  minHeight: '50px',
                  alignItems: 'flex-start',
                  alignContent: 'flex-start'
                }}>
                  {internship.skills.map(skill => (
                    <span key={skill} style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: '#c4b5fd',
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--border-radius)',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      whiteSpace: 'nowrap'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Bookmark info */}
                <div style={{ 
                  margin: '1rem 0', 
                  padding: '1rem', 
                  backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  minHeight: '80px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '0.5rem' 
                  }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#8b5cf6', 
                      fontWeight: '600' 
                    }}>
                      📌 Saved {new Date(internship.bookmarkedDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleAction('changePriority', internship)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.65rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #8b5cf6',
                        borderRadius: '0.25rem',
                        color: '#8b5cf6',
                        cursor: 'pointer'
                      }}
                    >
                      🎯 Priority
                    </button>
                  </div>
                  {internship.notes && (
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: '#6b7280', 
                      margin: 0, 
                      fontStyle: 'italic',
                      lineHeight: '1.4'
                    }}>
                      "{internship.notes}"
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem' }}>
                  {internship.status === 'not-applied' || internship.status === 'planning' ? (
                    <button 
                      onClick={() => handleAction('apply', internship)}
                      style={{
                        flex: 2,
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      Apply Now
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction('viewDetails', internship)}
                      style={{
                        flex: 2,
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      View Details
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleAction('editNotes', internship)}
                    style={{
                      flex: 1,
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--glass-border)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    📝
                  </button>
                  
                  <button 
                    onClick={() => handleAction('removeBookmark', internship)}
                    style={{
                      flex: 1,
                      background: 'var(--glass-bg)',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tips Section */}
      <section className={styles.tipsSection}>
        <h2>💡 Smart Bookmark Tips</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🎯</div>
            <h3>Set Priorities</h3>
            <p>Mark internships as high, medium, or low priority to focus your application efforts on the opportunities that matter most to your career goals.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📝</div>
            <h3>Add Personal Notes</h3>
            <p>Jot down why you saved each internship, what excites you about the role, or what you need to prepare before applying. Your future self will thank you!</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>⏰</div>
            <h3>Track Deadlines</h3>
            <p>Sort by deadline to see which applications need urgent attention. Set personal deadlines a few days before the actual deadline to avoid last-minute stress.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🔄</div>
            <h3>Regular Review</h3>
            <p>Review your bookmarks weekly. Remove positions you're no longer interested in and update your notes as your priorities evolve.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Bookmarks;