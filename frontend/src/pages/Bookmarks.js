import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import DataService from '../services/dataService';
import ProfileBasedMatchingService from '../services/profileBasedMatchingService';

const Bookmarks = () => {
  const { user, isGuest,logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('saved');
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [userBookmarks, setUserBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingService] = useState(() => new ProfileBasedMatchingService());

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

  // Load bookmarks and categories
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load categories
        const categoriesResponse = await DataService.getCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }
        
        // Load bookmarks from localStorage and DataService fallback
        let savedBookmarks = [];
        
        // Try localStorage first
        const userBookmarks = JSON.parse(localStorage.getItem('userBookmarks') || '{}');
        savedBookmarks = userBookmarks[user.id] || [];
        
        // If no localStorage bookmarks, try DataService
        if (savedBookmarks.length === 0) {
          const bookmarksResponse = await DataService.getUserBookmarks(user.id);
          if (bookmarksResponse.success) {
            savedBookmarks = bookmarksResponse.data;
          }
        }
        
        // Enhance with AI matching
        const userProfile = matchingService.getUserProfile();
        const enhancedBookmarks = savedBookmarks.map(bookmark => {
          const enhancedBookmark = {
            ...bookmark,
            priority: bookmark.priority || 'medium',
            status: bookmark.status || 'not-applied',
            bookmarkedDate: bookmark.bookmarkedDate || new Date().toISOString().split('T')[0],
            notes: bookmark.notes || `Saved this ${bookmark.title} position for future application.`
          };
          
          if (userProfile) {
            const matchResult = matchingService.calculateMatchScore(userProfile, bookmark);
            const explanation = matchingService.explainRecommendation(userProfile, bookmark);
            enhancedBookmark.match = matchResult.totalScore;
            enhancedBookmark.matchBreakdown = matchResult.breakdown;
            enhancedBookmark.explanation = explanation;
          }
          
          return enhancedBookmark;
        });
        
        setBookmarks(enhancedBookmarks);
        
        // Save enhanced bookmarks back to localStorage
        if (enhancedBookmarks.length > 0) {
          const userBookmarks = JSON.parse(localStorage.getItem('userBookmarks') || '{}');
          userBookmarks[user.id] = enhancedBookmarks;
          localStorage.setItem('userBookmarks', JSON.stringify(userBookmarks));
        }
        
      } catch (err) {
        console.error('Error loading bookmarks:', err);
        setError('Failed to load bookmarks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, matchingService]);

  // Save bookmarks to localStorage
  const saveBookmarks = (updatedBookmarks) => {
    try {
      const userBookmarks = JSON.parse(localStorage.getItem('userBookmarks') || '{}');
      userBookmarks[user.id] = updatedBookmarks;
      localStorage.setItem('userBookmarks', JSON.stringify(userBookmarks));
      setBookmarks(updatedBookmarks);
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  // Handle actions
  const handleAction = async (action, internship = null) => {
    switch (action) {
      case 'logout':
        logout();
        navigate('/login');
        break;
        
      case 'apply':
        navigate(`/apply/${internship.id}`);
        break;
        
      case 'viewDetails':
        navigate(`/internships/${internship.id}`);
        break;
        
      case 'removeBookmark':
        if (window.confirm(`Remove "${internship.title}" from bookmarks?`)) {
          const updatedBookmarks = bookmarks.filter(b => b.id !== internship.id);
          saveBookmarks(updatedBookmarks);
          alert(`Removed "${internship.title}" from bookmarks`);
        }
        break;
        
      case 'editNotes':
        const newNotes = prompt('Edit your notes:', internship.notes);
        if (newNotes !== null) {
          const updatedBookmarks = bookmarks.map(b => 
            b.id === internship.id ? { ...b, notes: newNotes } : b
          );
          saveBookmarks(updatedBookmarks);
          alert('Notes updated successfully!');
        }
        break;
        
      case 'changePriority':
        const priorities = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(internship.priority);
        const newPriority = priorities[(currentIndex + 1) % priorities.length];
        
        const updatedBookmarks = bookmarks.map(b => 
          b.id === internship.id ? { ...b, priority: newPriority } : b
        );
        saveBookmarks(updatedBookmarks);
        alert(`Priority changed to ${newPriority.toUpperCase()}`);
        break;
        
      case 'changeStatus':
        const statuses = ['not-applied', 'planning', 'applied', 'considering'];
        const currentStatusIndex = statuses.indexOf(internship.status);
        const newStatus = statuses[(currentStatusIndex + 1) % statuses.length];
        
        const updatedBookmarksStatus = bookmarks.map(b => 
          b.id === internship.id ? { ...b, status: newStatus } : b
        );
        saveBookmarks(updatedBookmarksStatus);
        alert(`Status changed to ${newStatus.replace('-', ' ').toUpperCase()}`);
        break;
        
      default:
        console.log('Unknown action:', action);
    }
  };

  // Filter and sort bookmarks
  const getFilteredBookmarks = () => {
    let filtered = bookmarks.filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || internship.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'saved':
          return new Date(b.bookmarkedDate) - new Date(a.bookmarkedDate);
        case 'deadline':
          const deadlineA = new Date(a.deadline?.split('/').reverse().join('-') || '2025-12-31');
          const deadlineB = new Date(b.deadline?.split('/').reverse().join('-') || '2025-12-31');
          return deadlineA - deadlineB;
        case 'match':
          return (b.match || 0) - (a.match || 0);
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

  // Calculate stats
  const bookmarkStats = {
    total: bookmarks.length,
    notApplied: bookmarks.filter(b => b.status === 'not-applied').length,
    applied: bookmarks.filter(b => b.status === 'applied').length,
    highPriority: bookmarks.filter(b => b.priority === 'high').length,
    highMatch: bookmarks.filter(b => (b.match || 0) > 80).length
  };

  if (!user) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.userHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.userInfo}>🔍 Please log in to view bookmarks</div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
            <button className={styles.signupBtn} onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Your Bookmark Collection</h1>
          <p className={styles.heroSubtitle}>Sign in to save and organise your favorite internships</p>
          <button className={styles.ctaPrimary} onClick={() => navigate('/login')}>Login to Continue</button>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.homeContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Loading your AI-enhanced bookmarks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.homeContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary)' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button className={styles.ctaPrimary} onClick={() => window.location.reload()}>Try Again</button>
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
          <div className={styles.userInfo}>👋 {user.full_name || user.email}</div>
          <ul className={styles.navItems}>
            {navItems.map(item => (
              <li key={item.path}>
                <button
                  className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.profileBtn} onClick={() => navigate('/profile')}>Profile</button>
          <button className={styles.logoutBtn} onClick={() => handleAction('logout')}>Logout</button>
        </div>
      </div>

      {/* Page Header */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>🔖 Your Smart Bookmarks</h1>
        <p className={styles.heroSubtitle}>AI-powered organisation for your saved internships</p>
        
        <div className={styles.userStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bookmarkStats.total}</span>
            <span className={styles.statLabel}>Saved</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bookmarkStats.highMatch}</span>
            <span className={styles.statLabel}>High Match</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bookmarkStats.highPriority}</span>
            <span className={styles.statLabel}>Priority</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{bookmarkStats.notApplied}</span>
            <span className={styles.statLabel}>To Apply</span>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
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

          <div className={styles.additionalFilters}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="saved">Recently Saved</option>
              <option value="match">AI Match Score</option>
              <option value="deadline">Deadline</option>
              <option value="priority">Priority Level</option>
            </select>
          </div>
        </div>
      </section>

      {/* Bookmarks List */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Collection <span className={styles.badge}>{filteredBookmarks.length}</span></h2>
          <button className={styles.viewAllButton} onClick={() => navigate('/internships')}>Find More</button>
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
            <button className={styles.ctaPrimary} onClick={() => navigate('/internships')}>Browse Internships</button>
          </div>
        ) : (
          <div className={styles.internshipsGrid}>
            {filteredBookmarks.map(internship => (
              <div key={internship.id} className={styles.internshipCard}>
                {/* Priority and Match badges */}
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
                  <button
                    onClick={() => handleAction('changePriority', internship)}
                    style={{
                      backgroundColor: priorityColors[internship.priority],
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {internship.priority}
                  </button>
                  
                  {internship.match && (
                    <div style={{
                      background: internship.match > 80 ? 'linear-gradient(135deg, #10b981, #059669)' :
                                internship.match > 60 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                'linear-gradient(135deg, #6b7280, #4b5563)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      🤖 {internship.match}%
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <button
                  onClick={() => handleAction('changeStatus', internship)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: statusColors[internship.status],
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                >
                  {internship.status.replace('-', ' ')}
                </button>
                
                {/* Card Header */}
                <div className={styles.cardHeader} style={{ marginTop: '2.5rem' }}>
                  <div className={styles.companyLogo}>{internship.logo}</div>
                  <div className={styles.companyInfo}>
                    <h3 className={styles.jobTitle}>{internship.title}</h3>
                    <p className={styles.companyName}>{internship.company}</p>
                  </div>
                </div>

                {/* Job Details */}
                <div className={styles.jobDetails}>
                  <div className={styles.detailItem}><span>📍</span> {internship.location}</div>
                  <div className={styles.detailItem}><span>💰</span> {internship.stipend}</div>
                  <div className={styles.detailItem}><span>⏱️</span> {internship.duration}</div>
                  <div className={styles.detailItem}><span>📅</span> Due {internship.deadline}</div>
                </div>

                {/* AI Explanation */}
                {internship.explanation && (
                  <div style={{
                    margin: '1rem 0',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '600', marginBottom: '0.5rem' }}>
                      🤖 AI Analysis: {internship.explanation.recommendation}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {internship.explanation.explanations.slice(0, 2).join('. ')}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className={styles.jobDescription}>{internship.description}</p>

                {/* Skills */}
                <div className={styles.skillsTags}>
                  {internship.skills.slice(0, 4).map(skill => (
                    <span key={skill} className={styles.skillTag}>{skill}</span>
                  ))}
                  {internship.skills.length > 4 && (
                    <span className={styles.skillTag}>+{internship.skills.length - 4} more</span>
                  )}
                </div>

                {/* Bookmark Info */}
                <div style={{
                  margin: '1rem 0',
                  padding: '1rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '600' }}>
                      📌 Saved {new Date(internship.bookmarkedDate).toLocaleDateString()}
                    </span>
                  </div>
                  {internship.notes && (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
                      "{internship.notes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  {internship.status === 'not-applied' || internship.status === 'planning' ? (
                    <button className={styles.applyButton} onClick={() => handleAction('apply', internship)}>
                      Apply Now
                    </button>
                  ) : (
                    <button className={styles.detailsButton} onClick={() => handleAction('viewDetails', internship)}>
                      View Details
                    </button>
                  )}
                  <button className={styles.editButton} onClick={() => handleAction('editNotes', internship)}>
                    📝 Notes
                  </button>
                  <button 
                    className={styles.withdrawButton} 
                    onClick={() => handleAction('removeBookmark', internship)}
                  >
                    🗑️ Remove
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
            <h3>Use Priority Levels</h3>
            <p>Click priority badges to cycle through low/medium/high. Focus on high-priority, high-match internships first!</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🤖</div>
            <h3>Trust the AI Scores</h3>
            <p>Internships with 80%+ match scores align well with your profile. Use AI explanations to understand why.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📝</div>
            <h3>Add Meaningful Notes</h3>
            <p>Jot down why you saved each internship, preparation needed, or questions to ask during interviews.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Enhanced bookmark handler hook for other components
export const useBookmarkHandler = () => {
  const { user } = useAuth();
  const [matchingService] = useState(() => new ProfileBasedMatchingService());

  const addBookmark = async (internship) => {
    if (!user) return { success: false, message: 'Please log in to bookmark internships' };

    try {
      const userBookmarks = JSON.parse(localStorage.getItem('userBookmarks') || '{}');
      const currentBookmarks = userBookmarks[user.id] || [];
      
      // Check if already bookmarked
      if (currentBookmarks.some(b => b.id === internship.id)) {
        return { success: false, message: 'Already bookmarked!' };
      }
      
      // Create enhanced bookmark with AI
      const userProfile = matchingService.getUserProfile();
      const newBookmark = { 
        ...internship, 
        bookmarkedDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        status: 'not-applied',
        notes: `Saved this ${internship.title} position for future application.`
      };
      
      if (userProfile) {
        const matchResult = matchingService.calculateMatchScore(userProfile, newBookmark);
        const explanation = matchingService.explainRecommendation(userProfile, newBookmark);
        newBookmark.match = matchResult.totalScore;
        newBookmark.matchBreakdown = matchResult.breakdown;
        newBookmark.explanation = explanation;
      }
      
      userBookmarks[user.id] = [newBookmark, ...currentBookmarks];
      localStorage.setItem('userBookmarks', JSON.stringify(userBookmarks));
      
      return { success: true, message: `Bookmarked "${internship.title}" with ${newBookmark.match}% match!` };
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return { success: false, message: 'Failed to bookmark internship' };
    }
  };

  const removeBookmark = async (internshipId) => {
    if (!user) return { success: false, message: 'Please log in' };

    try {
      const userBookmarks = JSON.parse(localStorage.getItem('userBookmarks') || '{}');
      const currentBookmarks = userBookmarks[user.id] || [];
      
      userBookmarks[user.id] = currentBookmarks.filter(b => b.id !== internshipId);
      localStorage.setItem('userBookmarks', JSON.stringify(userBookmarks));
      
      return { success: true, message: 'Bookmark removed successfully' };
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return { success: false, message: 'Failed to remove bookmark' };
    }
  };

  const isBookmarked = (internshipId) => {
    if (!user) return false;
    
    try {
      const userBookmarks = JSON.parse(localStorage.getItem('userBookmarks') || '{}');
      const currentBookmarks = userBookmarks[user.id] || [];
      return currentBookmarks.some(b => b.id === internshipId);
    } catch (error) {
      return false;
    }
  };

  return { addBookmark, removeBookmark, isBookmarked };
};

export default Bookmarks;

//ms2 final