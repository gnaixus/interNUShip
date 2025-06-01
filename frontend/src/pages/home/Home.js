import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/Home.module.css';
import { formatDateToDDMMYYYY } from '../utils/dateHelpers';

const Home = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for featured internships
  const featuredInternships = [
    {
      id: 1,
      title: 'Software Engineering Intern',
      company: 'TechCorp Singapore',
      location: 'Singapore',
      type: 'Full-time',
      duration: '3 months',
      stipend: 'S$2,000/month',
      category: 'technology',
      matchPercentage: user ? 92 : null,
      logo: '💻',
      description: 'Build innovative web applications using React and Node.js',
      deadline: '2025-06-15'
    },
    {
      id: 2,
      title: 'Data Science Intern',
      company: 'Analytics Plus',
      location: 'Remote',
      type: 'Part-time',
      duration: '6 months',
      stipend: 'S$1,500/month',
      category: 'data',
      matchPercentage: user ? 87 : null,
      logo: '📊',
      description: 'Analyze large datasets and create machine learning models',
      deadline: '2025-06-20'
    },
    {
      id: 3,
      title: 'Marketing Intern',
      company: 'Creative Agency',
      location: 'Singapore',
      type: 'Full-time',
      duration: '4 months',
      stipend: 'S$1,800/month',
      category: 'marketing',
      matchPercentage: user ? 75 : null,
      logo: '📈',
      description: 'Create engaging marketing campaigns for tech startups',
      deadline: '2025-06-10'
    },
    {
      id: 4,
      title: 'UX Design Intern',
      company: 'Design Studio',
      location: 'Hybrid',
      type: 'Full-time',
      duration: '3 months',
      stipend: 'S$1,700/month',
      category: 'design',
      matchPercentage: user ? 81 : null,
      logo: '🎨',
      description: 'Design user experiences for mobile and web applications',
      deadline: '2025-06-25'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🌟' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'data', name: 'Data Science', icon: '📊' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'consulting', name: 'Consulting', icon: '💼' }
  ];

  const handleApplyClick = (internship) => {
    if (user) {
      navigate(`/apply/${internship.id}`);
    } else if (isGuest) {
      const shouldSignUp = window.confirm('Sign up to apply for internships and unlock personalised matches!');
      if (shouldSignUp) {
        navigate('/signup');
      }
    } else {
      navigate('/login');
    }
  };

  const handleBookmarkClick = (internship) => {
    if (user) {
      // TODO: Add to bookmarks
      alert(`Bookmarked: ${internship.title}`);
    } else {
      const shouldSignUp = window.confirm('Sign up to bookmark internships!');
      if (shouldSignUp) {
        navigate('/signup');
      }
    }
  };

  const filteredInternships = featuredInternships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || internship.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              {user ? `Welcome back, ${user.full_name || user.email}!` : 
               isGuest ? 'Discover Your Dream Internship' :
               'Find Your Perfect Internship at NUS'}
            </h1>
            <p className={styles.heroSubtitle}>
              {user ? 'Ready to take the next step in your career? We\'ve got personalised recommendations waiting for you.' :
               'Connect with top companies, track your applications, and land your ideal internship opportunity.'}
            </p>
            
            {user && (
              <div className={styles.userStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>12</span>
                  <span className={styles.statLabel}>New Matches</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>3</span>
                  <span className={styles.statLabel}>Applications</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>8</span>
                  <span className={styles.statLabel}>Bookmarks</span>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.heroActions}>
            {!user && !isGuest && (
              <>
                <button 
                  className={styles.ctaPrimary}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </button>
                <button 
                  className={styles.ctaSecondary}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </>
            )}
            
            {user && (
              <button 
                className={styles.ctaPrimary}
                onClick={() => navigate('/internships')}
              >
                Browse All Internships
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchHeader}>
            <h2>Find Your Next Opportunity</h2>
            <p>Search through hundreds of internship opportunities</p>
          </div>
          
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
            <button className={styles.searchButton}>Search</button>
          </div>
          
          <div className={styles.categories}>
            {categories.map(category => (
              <button
                key={category.id}
                className={`${styles.categoryChip} ${selectedCategory === category.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>
            {user ? 'Recommended For You' : 'Featured Internships'}
            <span className={styles.badge}>{filteredInternships.length}</span>
          </h2>
          <button 
            className={styles.viewAllButton}
            onClick={() => navigate('/internships')}
          >
            View All
          </button>
        </div>

        <div className={styles.internshipsGrid}>
          {filteredInternships.map(internship => (
            <div key={internship.id} className={styles.internshipCard}>
              {user && internship.matchPercentage && (
                <div className={styles.matchBadge}>
                  {internship.matchPercentage}% Match
                </div>
              )}
              
              <div className={styles.cardHeader}>
                <div className={styles.companyLogo}>{internship.logo}</div>
                <div className={styles.companyInfo}>
                  <h3 className={styles.jobTitle}>{internship.title}</h3>
                  <p className={styles.companyName}>{internship.company}</p>
                </div>
                <button 
                  className={styles.bookmarkButton}
                  onClick={() => handleBookmarkClick(internship)}
                >
                  🔖
                </button>
              </div>

              <div className={styles.jobDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>📍</span>
                  {internship.location}
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>💰</span>
                  {internship.stipend}
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>⏱️</span>
                  {internship.duration}
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailIcon}>📅</span>
                  Due {formatDateToDDMMYYYY(internship.deadline)}
                </div>
              </div>

              <p className={styles.jobDescription}>{internship.description}</p>

              <div className={styles.cardActions}>
                <button 
                  className={styles.applyButton}
                  onClick={() => handleApplyClick(internship)}
                >
                  {user ? 'Apply Now' : 'Sign Up to Apply'}
                </button>
                <button 
                  className={styles.detailsButton}
                  onClick={() => navigate(`/internships/${internship.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎯</div>
            <div className={styles.statContent}>
              <h3>500+</h3>
              <p>Active Internships</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>5,000+</h3>
              <p>NUS Students</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>95%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Your Internship Journey?</h2>
            <p>Join thousands of NUS students who have found their dream internships through InterNUShip</p>
            <div className={styles.ctaButtons}>
              <button 
                className={styles.ctaPrimary}
                onClick={() => navigate('/signup')}
              >
                Create Account
              </button>
              <button 
                className={styles.ctaSecondary}
                onClick={() => navigate('/internships')}
              >
                Browse as Guest
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;