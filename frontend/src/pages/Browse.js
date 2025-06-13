import React, { useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';

const Browse = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('match'); // match, published, deadline


  const allInternships = [
    { id: 1, title: 'Software Engineering Intern', company: 'TechCorp Singapore', location: 'Singapore', 
      stipend: 'S$1,200/month', duration: '3 months', category: 'technology', match: 92, logo: '💻',
      description: 'Build innovative web applications using React and Node.js', deadline: '15/06/2025', 
      postedDate: '01/05/2025', skills: ['React', 'Node.js', 'JavaScript'] },
    { id: 2, title: 'Data Science Intern', company: 'Analytics Plus', location: 'Singapore',
      stipend: 'S$1,100/month', duration: '6 months', category: 'data', match: 87, logo: '📊',
      description: 'Analyse large datasets and create machine learning models', deadline: '20/06/2025',
      postedDate: '03/05/2025', skills: ['Python', 'ML', 'SQL'] },
    { id: 3, title: 'Marketing Intern', company: 'Creative Agency', location: 'Singapore',
      stipend: 'S$1,200/month', duration: '4 months', category: 'marketing', match: 75, logo: '📈',
      description: 'Create engaging marketing campaigns for tech startups', deadline: '10/06/2025',
      postedDate: '28/04/2025', skills: ['Content Creation', 'Social Media', 'Analytics'] },
    { id: 4, title: 'UX Design Intern', company: 'Design Studio', location: 'Singapore',
      stipend: 'S$1,100/month', duration: '3 months', category: 'design', match: 81, logo: '🎨',
      description: 'Design user experiences for mobile and web applications', deadline: '25/06/2025',
      postedDate: '05/05/2025', skills: ['Figma', 'UI/UX', 'Prototyping'] },
    { id: 5, title: 'Backend Developer Intern', company: 'CloudTech Solutions', location: 'Singapore',
      stipend: 'S$1,300/month', duration: '4 months', category: 'technology', match: 89, logo: '⚙️',
      description: 'Develop scalable backend systems and APIs', deadline: '18/06/2025',
      postedDate: '02/05/2025', skills: ['Python', 'FastAPI', 'PostgreSQL'] },
    { id: 6, title: 'Product Management Intern', company: 'StartupXYZ', location: 'Singapore',
      stipend: 'S$1,000/month', duration: '5 months', category: 'business', match: 78, logo: '📋',
      description: 'Work with product teams to define and launch new features', deadline: '30/06/2025',
      postedDate: '10/05/2025', skills: ['Product Strategy', 'Analytics', 'Communication'] },
    { id: 7, title: 'Mobile App Developer Intern', company: 'MobileTech', location: 'Singapore',
      stipend: 'S$1,150/month', duration: '3 months', category: 'technology', match: 85, logo: '📱',
      description: 'Develop iOS and Android applications using React Native', deadline: '22/06/2025',
      postedDate: '08/05/2025', skills: ['React Native', 'JavaScript', 'Mobile Development'] },
    { id: 8, title: 'Financial Analyst Intern', company: 'InvestCorp', location: 'Singapore',
      stipend: 'S$1,400/month', duration: '6 months', category: 'finance', match: 82, logo: '💰',
      description: 'Conduct financial analysis and market research', deadline: '12/06/2025',
      postedDate: '15/04/2025', skills: ['Excel', 'Financial Modeling', 'Research'] }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'technology', name: 'Tech', icon: '💻' },
    { id: 'data', name: 'Data', icon: '📊' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'business', name: 'Business', icon: '📋' },
    { id: 'finance', name: 'Finance', icon: '💰' }
  ];



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

  const handleAction = (action, internship = null) => {
    if (action === 'logout') { logout(); navigate('/login'); }
    else if (action === 'apply') user ? navigate(`/apply/${internship.id}`) : navigate('/signup');
    else if (action === 'bookmark') user ? alert(`Bookmarked: ${internship.title}`) : navigate('/signup');
    else if (action === 'details') navigate(`/internships/${internship.id}`);
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
              </button>
            ))}
          </div>

          {/* Sort options only */}
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
                  {internship.skills.map(skill => (
                    <span key={skill} className={styles.skillTag}>{skill}</span>
                  ))}
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