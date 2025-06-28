import React from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';

const About = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <div className={styles.userHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.userInfo}>
            {user && <span>👋 {user.full_name || user.email}</span>}
            {isGuest && <span>🔍 Browsing as Guest</span>}
            {!user && !isGuest && <span>🌟 Welcome to InterNUShip</span>}
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
              <button className={styles.logoutBtn} onClick={() => navigate('/login')}>Logout</button>
            </>
          )}
          {!user && (
            <>
              <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
              <button className={styles.signupBtn} onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
          <button className={styles.mobileNavToggle}>☰</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>About InterNUShip</h1>
        <p className={styles.heroSubtitle}>
          Revolutionizing how NUS students discover and secure meaningful internship opportunities
        </p>
      </section>

      {/* Mission Section */}
      <section style={{ 
        padding: '60px 24px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: 'var(--border-radius-lg)', 
          padding: '3rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '2rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎯 Our Mission
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.1rem', 
            lineHeight: '1.6', 
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            InterNUShip is a web-based application designed to centralize relevant internship opportunities 
            into a single platform while optimizing the matching process between university students and employers. 
            We help students find meaningful internship opportunities that align with their skills, 
            interests, and career goals while streamlining the application process.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ 
        padding: '60px 24px', 
        maxWidth: '1400px', 
        margin: '0 auto'
      }}>
        <h2 style={{ 
          color: 'var(--text-primary)', 
          fontSize: '2rem', 
          fontWeight: '600', 
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          🔧 How InterNUShip Works
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {[
            {
              step: '1',
              icon: '🎯',
              title: 'Create Your Profile',
              description: 'Sign up and build a comprehensive profile with your skills, experience, education, and career goals. Upload your resume for automatic parsing and profile enhancement.'
            },
            {
              step: '2',
              icon: '🔍',
              title: 'Discover Opportunities',
              description: 'Browse through curated internship listings aggregated from multiple platforms including LinkedIn, Indeed, JobsBank, and company websites - all in one place.'
            },
            {
              step: '3',
              icon: '🤖',
              title: 'Get Smart Matches',
              description: 'Our AI-powered algorithm analyses your profile and matches you with internships that align with your skills, preferences, and career aspirations using TF-IDF and cosine similarity.'
            },
            {
              step: '4',
              icon: '📝',
              title: 'Apply & Track',
              description: 'Apply directly through our platform with auto-filled forms, track your application progress, manage deadlines, and get updates - all in one centralized dashboard.'
            }
          ].map((item) => (
            <div key={item.step} style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              position: 'relative',
              transition: 'var(--transition)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '20px',
                background: 'var(--accent-gradient)',
                color: 'white',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {item.step}
              </div>
              
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                {item.icon}
              </div>
              
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                {item.title}
              </h3>
              
              <p style={{
                color: 'var(--text-muted)',
                lineHeight: '1.5',
                fontSize: '0.95rem'
              }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features Section */}
      <section style={{ 
        padding: '60px 24px', 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <h2 style={{ 
          color: 'var(--text-primary)', 
          fontSize: '2rem', 
          fontWeight: '600', 
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          ✨ Key Features
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem'
        }}>
          {[
            {
              icon: '🎯',
              title: 'AI-Powered Matching',
              description: 'Advanced algorithms analyse your skills, coursework, and preferences to recommend the most suitable internships with percentage match scores.'
            },
            {
              icon: '📊',
              title: 'Centralized Dashboard',
              description: 'Track all your applications, deadlines, and progress in one place. Never miss an opportunity or deadline again.'
            },
            {
              icon: '📄',
              title: 'Resume Parsing & Auto-Fill',
              description: 'Upload your resume once and automatically populate application forms. Our system extracts skills, experience, and education details.'
            },
            {
              icon: '🔖',
              title: 'Smart Bookmarking',
              description: 'Save interesting opportunities with personal notes and priority levels. Organize your internship search effectively.'
            },
            {
              icon: '🌐',
              title: 'Multi-Platform Aggregation',
              description: 'We scrape and aggregate internships from LinkedIn, Indeed, JobsBank, MyCareersFuture, and company websites.'
            },
            {
              icon: '👥',
              title: 'Community Insights',
              description: 'Connect with past interns, read reviews, and share experiences to make informed decisions about companies and roles.'
            }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
              transition: 'var(--transition)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '1rem'
              }}>
                {feature.icon}
              </div>
              
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                {feature.title}
              </h3>
              
              <p style={{
                color: 'var(--text-muted)',
                lineHeight: '1.5',
                fontSize: '0.9rem'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section style={{ 
        padding: '60px 24px', 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <h2 style={{ 
          color: 'var(--text-primary)', 
          fontSize: '2rem', 
          fontWeight: '600', 
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          👥 About Our Team
        </h2>

        <div style={{ 
          background: 'var(--glass-bg)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: 'var(--border-radius-lg)', 
          padding: '3rem',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '2rem'
          }}>
            🎓
          </div>
          
          <h3 style={{
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Built by Students, For Students
          </h3>
          
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            InterNUShip is developed by university students who understand the challenges of internship hunting. 
            Having experienced the process ourselves, we built this platform to solve real problems 
            that students face when searching for meaningful opportunities.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Our Vision</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Democratize access to internship opportunities for all students
              </p>
            </div>
            
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Our Goal</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Increase internship success rates through smart matching and tracking
              </p>
            </div>
            
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Our Promise</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Continuously improve based on student feedback and needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Your Internship Journey?</h2>
            <p>Join the InterNUShip community and discover opportunities that match your goals</p>
            <button className={styles.ctaPrimary} onClick={() => navigate('/signup')}>
              Get Started Today
            </button>
            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.9rem', 
              color: 'var(--text-muted)' 
            }}>
              Free for all NUS students • No hidden fees • Start applying immediately
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <section style={{ 
        padding: '40px 24px', 
        textAlign: 'center',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}>
          Built with ❤️ by students for students
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          color: 'var(--text-subtle)'
        }}>
          <span>🚀 Student Project</span>
          <span>💡 Innovation in Education</span>
          <span>🎯 Empowering Students</span>
        </div>
      </section>
    </div>
  );
};

export default About;