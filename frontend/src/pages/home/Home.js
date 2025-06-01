import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/Home.module.css';

const Home = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Simplified mock data
  const internships = [
    { id: 1, title: 'Software Engineering Intern', company: 'TechCorp Singapore', location: 'Singapore', 
      stipend: 'S$1,200/month', duration: '3 months', category: 'technology', match: 92, logo: '💻',
      description: 'Build innovative web applications using React and Node.js', deadline: '15/06/2025' },
    { id: 2, title: 'Data Science Intern', company: 'Analytics Plus', location: 'Remote',
      stipend: 'S$1,100/month', duration: '6 months', category: 'data', match: 87, logo: '📊',
      description: 'Analyse large datasets and create machine learning models', deadline: '20/06/2025' },
    { id: 3, title: 'Marketing Intern', company: 'Creative Agency', location: 'Singapore',
      stipend: 'S$1,200/month', duration: '4 months', category: 'marketing', match: 75, logo: '📈',
      description: 'Create engaging marketing campaigns for tech startups', deadline: '10/06/2025' },
    { id: 4, title: 'UX Design Intern', company: 'Design Studio', location: 'Hybrid',
      stipend: 'S$1,100/month', duration: '3 months', category: 'design', match: 81, logo: '🎨',
      description: 'Design user experiences for mobile and web applications', deadline: '25/06/2025' }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'technology', name: 'Tech', icon: '💻' },
    { id: 'data', name: 'Data', icon: '📊' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'design', name: 'Design', icon: '🎨' }
  ];

  const handleAction = (action, internship = null) => {
    const actions = {
      apply: () => user ? navigate(`/apply/${internship.id}`) : promptSignup('apply'),
      bookmark: () => user ? alert(`Bookmarked: ${internship.title}`) : promptSignup('bookmark'),
      details: () => navigate(`/internships/${internship.id}`),
      logout: () => { logout(); navigate('/login'); }
    };
    actions[action]?.();
  };

  const promptSignup = (action) => {
    if (window.confirm(`Sign up to ${action} internships!`)) navigate('/signup');
  };

  const filtered = internships.filter(i => 
    (selectedCategory === 'all' || i.category === selectedCategory) &&
    (i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     i.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const UserHeader = () => (
    <div className={styles.userHeader}>
      <div className={styles.userInfo}>
        {user && <span>👋 {user.full_name || user.email}</span>}
        {isGuest && <span>🔍 Browsing as Guest</span>}
      </div>
      <div className={styles.headerActions}>
        {user && (
          <>
            <button className={styles.profileBtn} onClick={() => navigate('/profile')}>
              Profile
            </button>
            <button className={styles.logoutBtn} onClick={() => handleAction('logout')}>
              Logout
            </button>
          </>
        )}
        {!user && !isGuest && (
          <>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
            <button className={styles.signupBtn} onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        )}
        {isGuest && (
          <button className={styles.signupBtn} onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        )}
      </div>
    </div>
  );

  const HeroSection = () => (
    <section className={styles.heroSection}>
      <h1 className={styles.heroTitle}>
        {user ? `Welcome back, ${user.full_name || user.email}!` : 
         isGuest ? 'Discover Your Dream Internship' : 'Find Your Perfect Internship at NUS'}
      </h1>
      <p className={styles.heroSubtitle}>
        {user ? 'Ready to take the next step in your career?' : 
         'Connect with top companies and land your ideal internship.'}
      </p>
      
      {user && (
        <div className={styles.userStats}>
          {[{num: 4, label: 'New Matches'}, {num: 1, label: 'Applications'}, {num: 2, label: 'Bookmarks'}]
            .map(stat => (
              <div key={stat.label} className={styles.statItem}>
                <span className={styles.statNumber}>{stat.num}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
        </div>
      )}
    </section>
  );

  const SearchSection = () => (
    <section className={styles.searchSection}>
      <h2>Find Your Next Opportunity</h2>
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search internships or companies..."
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
  );

  const InternshipCard = ({ internship }) => (
    <div className={styles.internshipCard}>
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
        {[
          {icon: '📍', text: internship.location},
          {icon: '💰', text: internship.stipend},
          {icon: '⏱️', text: internship.duration},
          {icon: '📅', text: `Due ${internship.deadline}`}
        ].map((detail, i) => (
          <div key={i} className={styles.detailItem}>
            <span className={styles.detailIcon}>{detail.icon}</span>
            {detail.text}
          </div>
        ))}
      </div>

      <p className={styles.jobDescription}>{internship.description}</p>

      <div className={styles.cardActions}>
        <button className={styles.applyButton} onClick={() => handleAction('apply', internship)}>
          {user ? 'Apply Now' : 'Sign Up to Apply'}
        </button>
        <button className={styles.detailsButton} onClick={() => handleAction('details', internship)}>
          Details
        </button>
      </div>
    </div>
  );

  const StatsSection = () => (
    <section className={styles.statsSection}>
      <div className={styles.statsGrid}>
        {[
          {icon: '🎯', number: '500+', label: 'Active Internships'},
          {icon: '👥', number: '5,000+', label: 'NUS Students'},
          {icon: '✅', number: '95%', label: 'Success Rate'}
        ].map(stat => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className={styles.homeContainer}>
      <UserHeader />
      <HeroSection />
      <SearchSection />
      
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>
            {user ? 'Recommended For You' : 'Featured Internships'}
            <span className={styles.badge}>{filtered.length}</span>
          </h2>
          <button className={styles.viewAllButton} onClick={() => navigate('/internships')}>
            View All
          </button>
        </div>

        <div className={styles.internshipsGrid}>
          {filtered.map(internship => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      </section>

      <StatsSection />

      {!user && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Your Internship Journey?</h2>
            <p>Join thousands of NUS students who found their dream internships</p>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaPrimary} onClick={() => navigate('/signup')}>
                Create Account
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;