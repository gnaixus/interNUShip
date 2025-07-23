import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, DollarSign, Users, Calendar, ChevronLeft, Heart, Share2, Flag, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './auth/AuthContext'; 
import DataService from '../services/dataService';
import { createUnifiedBookmarkHandler } from './utils/bookmarkHandler';
import styles from '../styles/InternshipDetails.module.css';

const InternshipDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth(); 
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [internship, setInternship] = useState(null);
  const [loadingInternship, setLoadingInternship] = useState(true);
  const [error, setError] = useState(null);
  
  const bookmarkHandler = createUnifiedBookmarkHandler(user, navigate);

  // Get current user from localStorage (fallback if useAuth doesn't work)
  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const isAuthenticated = () => {
    return user !== null || getCurrentUser() !== null;
  };

  // Load internship data and check bookmark status
  useEffect(() => {
    if (id) {
      loadInternshipData();
      if (user) {
        checkBookmarkStatus(id);
        checkApplicationStatus(id);
      }
    }
  }, [id, user]);

  const loadInternshipData = async () => {
    try {
      setLoadingInternship(true);
      const response = await DataService.getInternshipById(id);
      
      if (response.success) {
        setInternship(response.data);
      } else {
        setError(response.error || 'Internship not found');
      }
    } catch (error) {
      console.error('Error loading internship:', error);
      setError('Failed to load internship details');
    } finally {
      setLoadingInternship(false);
    }
  };

  const checkBookmarkStatus = async (internshipId) => {
    if (!user) return;
    
    try {
      const response = await DataService.isBookmarked(user.id, internshipId);
      if (response.success) {
        setIsBookmarked(response.isBookmarked);
        console.log('Bookmark status checked:', response.isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const checkApplicationStatus = (internshipId) => {
    // Check localStorage or make API call to check if user has applied
    const appliedInternships = JSON.parse(localStorage.getItem('appliedInternships') || '[]');
    const hasApplied = appliedInternships.includes(internshipId.toString());
    setIsApplied(hasApplied);
  };

  // Enhanced bookmark handler for details page
  const handleBookmarkToggle = async () => {
  if (!user) {
    navigate('/signup');
    return;
  }

  if (!displayInternship) {
    alert('❌ Internship data not available');
    return;
  }

  try {
    setBookmarkLoading(true);
    
    // Create complete internship object with all required fields
    const completeInternship = {
      id: parseInt(id),
      internshipId: parseInt(id),
      title: displayInternship.title,
      company: displayInternship.company,
      location: displayInternship.location,
      description: displayInternship.description,
      category: displayInternship.category || 'Technology',
      skills: displayInternship.skills || ['JavaScript', 'React'],
      stipend: displayInternship.stipend || displayInternship.salary || '$1000',
      duration: displayInternship.duration || '12 weeks',
      type: displayInternship.type || 'Full-time',
      startDate: displayInternship.startDate || '2024-03-15',
      applicationDeadline: displayInternship.applicationDeadline || '2024-02-15',
      published: displayInternship.published || new Date().toISOString(),
      requirements: displayInternship.requirements || [],
      benefits: displayInternship.benefits || [],
      companyLogo: displayInternship.companyLogo,
      rating: displayInternship.rating,
      reviewCount: displayInternship.reviewCount
    };

    console.log('🔖 Complete internship for bookmarking:', completeInternship);
    
    const result = await bookmarkHandler(
      completeInternship, 
      isBookmarked, 
      setIsBookmarked,
      {
        source: 'details_page',
        skipPrompts: false
      }
    );

    if (result && result.success) {
      console.log('✅ Bookmark successful');
      
      if (!isBookmarked) {
        const showBookmarks = window.confirm(
          `✅ "${completeInternship.title}" has been bookmarked!\n\nView your bookmarks page?`
        );
        
        if (showBookmarks) {
          navigate('/bookmarks');
        }
      }
    } else {
      console.error('❌ Bookmark failed:', result?.error);
      alert(`❌ ${result?.error || 'Failed to bookmark'}`);
    }
  } catch (error) {
    console.error('💥 Bookmark error:', error);
    alert('❌ Failed to update bookmark. Please try again.');
  } finally {
    setBookmarkLoading(false);
  }
};

  const handleBackToBrowse = () => {
    navigate('/internships');
  };

  const handleApplyNow = () => {
    if (isApplied) return; // Don't do anything if already applied
    
    if (!isAuthenticated()) {
      navigate('/signup');
      return;
    }

    setIsLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      // Add this internship to applied list
      const appliedInternships = JSON.parse(localStorage.getItem('appliedInternships') || '[]');
      appliedInternships.push(id.toString());
      localStorage.setItem('appliedInternships', JSON.stringify(appliedInternships));
      
      // Navigate to application form
      navigate(`/apply/${id}`);
      setIsLoading(false);
    }, 1000);
  };

  const handleContactRecruiter = () => {
    alert('Recruiter website link will be prompted here; For eg, https://www.nus.edu.sg/.');
  };

  // Show loading state
  if (loadingInternship) {
    return (
      <div className={styles.minHeight}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className={styles.spinner} style={{ margin: '0 auto 16px' }}></div>
            <p>Loading internship details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !internship) {
    return (
      <div className={styles.minHeight}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Oops! Something went wrong</h2>
            <p>{error || 'Internship not found'}</p>
            <button 
              className={styles.applyButton} 
              onClick={() => navigate('/internships')}
              style={{ marginTop: '1rem' }}
            >
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }
    
  // Mock internship data (fallback if internship is not loaded)
  const mockInternship = {
    id: parseInt(id) || 1,
    title: "Frontend Developer Intern",
    company: "TechFlow Solutions",
    companyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
    location: "Singapore",
    duration: "12 weeks",
    salary: "$1200",
    type: "Physical",
    posted: "2 days ago",
    applications: 124,
    spots: 3,
    rating: 4.6,
    reviewCount: 28,
    description: "Join our dynamic frontend team to build cutting-edge web applications using React, TypeScript, and modern development tools. You'll work alongside senior developers on real projects that impact thousands of users.",
    requirements: [
      "Currently pursuing a degree in Computer Science or related field",
      "Proficiency in HTML, CSS, and JavaScript",
      "Experience with React or similar frontend frameworks",
      "Understanding of version control (Git)",
      "Strong problem-solving skills and attention to detail"
    ],
    responsibilities: [
      "Develop responsive web interfaces using React and TypeScript",
      "Collaborate with UX designers",
      "Participate in code reviews and team meetings",
      "Write clean, maintainable code following best practices",
      "Contribute to testing and debugging processes"
    ],
    benefits: [
      "Flexible working hours",
      "Mentorship from senior developers",
      "Access to learning resources and conferences",
      "Potential for full-time conversion"
    ],
    timeline: {
      application: "Jan 15 - Feb 15, 2024",
      interviews: "Feb 20 - Mar 5, 2024",
      start: "March 15, 2024"
    }
  };

  // Use internship data if available, otherwise use mock data with safe fallbacks
  const displayInternship = internship ? {
    ...internship,
    requirements: internship.requirements || mockInternship.requirements,
    responsibilities: internship.responsibilities || mockInternship.responsibilities,
    benefits: internship.benefits || mockInternship.benefits,
    timeline: internship.timeline || mockInternship.timeline,
    rating: internship.rating || mockInternship.rating,
    reviewCount: internship.reviewCount || mockInternship.reviewCount,
    applications: internship.applications || mockInternship.applications,
    spots: internship.spots || mockInternship.spots,
    posted: internship.posted || mockInternship.posted,
    type: internship.type || mockInternship.type,
    companyLogo: internship.companyLogo || internship.logo || mockInternship.companyLogo
  } : mockInternship;

  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      author: "Sarah Wong",
      role: "Frontend Development Intern",
      period: "Summer 2023",
      rating: 5,
      title: "Amazing learning experience!",
      content: "This internship exceeded my expectations. The mentorship was outstanding, and I got to work on real projects that made a significant impact. The team was welcoming and always willing to help.",
      helpful: 12,
      date: "3 months ago",
      pros: ["Great mentorship", "Real project experience", "Supportive team"],
      cons: ["Fast-paced environment"]
    },
    {
      id: 2,
      author: "Alex Tan",
      role: "Frontend Development Intern",
      period: "Winter 2023",
      rating: 4,
      title: "Solid internship with room for improvement",
      content: "Good experience overall. Got exposure to modern tech stack and learned a lot about professional development practices. Communication could have been better at times.",
      helpful: 8,
      date: "1 month ago",
      pros: ["Modern tech stack", "Professional growth", "Flexible hours"],
      cons: ["Communication gaps", "Limited networking opportunities"]
    },
    {
      id: 3,
      author: "Rachel Ang",
      role: "Frontend Development Intern",
      period: "Semester 1",
      rating: 5,
      title: "Perfect start to my career",
      content: "Couldn't have asked for a better first internship. The projects were challenging but achievable, and the feedback was constructive and frequent.",
      helpful: 15,
      date: "6 months ago",
      pros: ["Challenging projects", "Regular feedback", "Career guidance"],
      cons: ["High expectations"]
    }
  ];

  const ratingDistribution = [
    { stars: 5, count: 18, percentage: 64 },
    { stars: 4, count: 7, percentage: 25 },
    { stars: 3, count: 2, percentage: 7 },
    { stars: 2, count: 1, percentage: 4 },
    { stars: 1, count: 0, percentage: 0 }
  ];

  const renderStars = (rating, large = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${styles.star} ${index < rating ? styles.filled : styles.empty}`}
      />
    ));
  };

  return (
    <div className={styles.minHeight}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <button className={styles.backButton} onClick={handleBackToBrowse}>
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Browse
            </button>
            <div className={styles.headerActions}>
              <button
                onClick={handleBookmarkToggle}
                className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarked : ''}`}
                title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                disabled={bookmarkLoading}
              >
                <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{bookmarkLoading ? 'Loading...' : (isBookmarked ? 'Bookmarked' : 'Bookmark')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.mainGrid}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Internship Header */}
            <div className={styles.card}>
              <div className={styles.internshipHeader}>
                <img
                  src={displayInternship.companyLogo}
                  alt={displayInternship.company}
                  className={styles.companyLogo}
                />
                <div>
                  <h1 className={styles.internshipTitle}>{displayInternship.title}</h1>
                  <h2 className={styles.companyName}>{displayInternship.company}</h2>
                  <div className={styles.internshipMeta}>
                    <div className={styles.metaItem}>
                      <MapPin className="w-4 h-4" />
                      {displayInternship.location}
                    </div>
                    <div className={styles.metaItem}>
                      <Clock className="w-4 h-4" />
                      {displayInternship.duration}
                    </div>
                    <div className={styles.metaItem}>
                      <DollarSign className="w-4 h-4" />
                      {displayInternship.salary || displayInternship.stipend}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className={styles.ratingContainer}>
                <div className={styles.stars}>
                  {renderStars(Math.floor(displayInternship.rating))}
                </div>
                <span className={styles.ratingScore}>{displayInternship.rating}</span>
                <span className={styles.reviewCount}>({displayInternship.reviewCount} reviews)</span>
              </div>

              {/* Quick Stats */}
              <div className={styles.quickStats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{displayInternship.applications}</div>
                  <div className={styles.statLabel}>Applications</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{displayInternship.spots}</div>
                  <div className={styles.statLabel}>Open Spots</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{displayInternship.posted}</div>
                  <div className={styles.statLabel}>Posted</div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.card}>
              <div className={styles.tabNavigation}>
                <ul className={styles.tabList}>
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'reviews', label: 'Reviews' },
                    { key: 'timeline', label: 'Timeline' }
                  ].map((tab) => (
                    <li key={tab.key}>
                      <button
                        onClick={() => setActiveTab(tab.key)}
                        className={`${styles.tabButton} ${activeTab === tab.key ? styles.active : ''}`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.tabContent}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className={styles.overviewContent}>
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>About This Internship</h3>
                      <p className={styles.sectionDescription}>{displayInternship.description}</p>
                    </div>

                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Requirements</h3>
                      <ul className={styles.bulletList}>
                        {displayInternship.requirements.map((req, index) => (
                          <li key={index}>
                            <span className={`${styles.bulletPoint} ${styles.blue}`}></span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Responsibilities</h3>
                      <ul className={styles.bulletList}>
                        {displayInternship.responsibilities.map((resp, index) => (
                          <li key={index}>
                            <span className={`${styles.bulletPoint} ${styles.green}`}></span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Benefits</h3>
                      <ul className={styles.bulletList}>
                        {displayInternship.benefits.map((benefit, index) => (
                          <li key={index}>
                            <span className={`${styles.bulletPoint} ${styles.purple}`}></span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className={styles.reviewsContent}>
                    {/* Rating Overview */}
                    <div className={styles.ratingOverview}>
                      <div className={styles.ratingSummary}>
                        <div className={styles.ratingLarge}>{displayInternship.rating}</div>
                        <div className={styles.starsLarge}>
                          {renderStars(Math.floor(displayInternship.rating), true)}
                        </div>
                        <div className={styles.reviewCount}>{displayInternship.reviewCount} reviews</div>
                      </div>
                      <div className={styles.ratingDistribution}>
                        {ratingDistribution.map((dist) => (
                          <div key={dist.stars} className={styles.ratingBar}>
                            <span className={styles.ratingStarsLabel}>{dist.stars}★</span>
                            <div className={styles.ratingProgress}>
                              <div
                                className={styles.ratingProgressFill}
                                style={{ width: `${dist.percentage}%` }}
                              ></div>
                            </div>
                            <span className={styles.ratingCount}>{dist.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className={styles.reviewsHeader}>
                      <h3 className={styles.sectionTitle}>Reviews</h3>
                      <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value)}
                        className={styles.sortSelect}
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                        <option value="helpful">Most Helpful</option>
                      </select>
                    </div>

                    {/* Reviews List */}
                    <div className={styles.reviewsList}>
                      {mockReviews.map((review) => (
                        <div key={review.id} className={styles.reviewCard}>
                          <div className={styles.reviewHeader}>
                            <div className={styles.reviewerInfo}>
                              <div className={styles.reviewerAvatar}>
                                {review.author.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className={styles.reviewerName}>{review.author}</div>
                                <div className={styles.reviewerRole}>{review.role} • {review.period}</div>
                              </div>
                            </div>
                            <div className={styles.reviewDate}>{review.date}</div>
                          </div>

                          <div className={styles.reviewRating}>
                            <div className={styles.stars}>
                              {renderStars(review.rating)}
                            </div>
                            <span className={styles.reviewTitle}>{review.title}</span>
                          </div>

                          <p className={styles.reviewContent}>{review.content}</p>

                          {(review.pros || review.cons) && (
                            <div className={styles.prosCons}>
                              {review.pros && (
                                <div>
                                  <h5 className={styles.prosTitle}>Pros</h5>
                                  <ul>
                                    {review.pros.map((pro, index) => (
                                      <li key={index}>• {pro}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {review.cons && (
                                <div>
                                  <h5 className={styles.consTitle}>Cons</h5>
                                  <ul>
                                    {review.cons.map((con, index) => (
                                      <li key={index}>• {con}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          <div className={styles.reviewActions}>
                            <div className={styles.reviewButtons}>
                              <button className={`${styles.reviewButton} ${styles.helpful}`}>
                                <ThumbsUp className="w-4 h-4" />
                                <span>Helpful ({review.helpful})</span>
                              </button>
                              <button className={`${styles.reviewButton} ${styles.unhelpful}`}>
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                            <button className={styles.reportButton}>Report</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className={styles.timelineContent}>
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Application Timeline</h3>
                      <div className={styles.timeline}>
                        <div className={styles.timelineItem}>
                          <div className={`${styles.timelineIcon} ${styles.blue}`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className={styles.timelineTitle}>Application Period</h4>
                            <p className={styles.timelineDescription}>{displayInternship.timeline.application}</p>
                          </div>
                        </div>
                        <div className={styles.timelineItem}>
                          <div className={`${styles.timelineIcon} ${styles.green}`}>
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className={styles.timelineTitle}>Interview Process</h4>
                            <p className={styles.timelineDescription}>{displayInternship.timeline.interviews}</p>
                          </div>
                        </div>
                        <div className={styles.timelineItem}>
                          <div className={`${styles.timelineIcon} ${styles.purple}`}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className={styles.timelineTitle}>Internship Start Date</h4>
                            <p className={styles.timelineDescription}>{displayInternship.timeline.start}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <button 
                className={`${styles.applyButton} ${isApplied ? styles.appliedButton : ''}`}
                onClick={handleApplyNow}
                disabled={isApplied || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Applying...
                  </>
                ) : isApplied ? (
                  'Applied ✓'
                ) : (
                  'Apply Now'
                )}
              </button>
              <button className={styles.contactButton} onClick={handleContactRecruiter}>
                Contact Recruiter
              </button>

              <div className={styles.companyDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Company Size</span>
                  <span className={styles.detailValue}>50-200 employees</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Industry</span>
                  <span className={styles.detailValue}>Technology</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Work Type</span>
                  <span className={styles.detailValue}>{displayInternship.type}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Application Deadline</span>
                  <span className={`${styles.detailValue} ${styles.urgent}`}>Feb 15, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailPage;