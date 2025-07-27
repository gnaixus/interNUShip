import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Home.module.css';

const Community = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });
  const [replyingTo, setReplyingTo] = useState(null); 
  const [newComment, setNewComment] = useState(''); 
  const [newTag, setNewTag] = useState('');
  
  // ADD: Profile data state
  const [profileData, setProfileData] = useState(null);

  // ADD: Function to get profile data from localStorage
  const getProfileData = () => {
    try {
      const savedProfile = localStorage.getItem('userProfileData');
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
      return null;
    } catch (error) {
      console.error('Error reading profile data:', error);
      return null;
    }
  };

  // Navigation items
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

  // Categories for posts
  const categories = [
    { id: 'all', name: 'All Posts', icon: '📌' },
    { id: 'general', name: 'General Discussion', icon: '💬' },
    { id: 'interview', name: 'Interview Tips', icon: '🎯' },
    { id: 'company', name: 'Company Reviews', icon: '🏢' },
    { id: 'resume', name: 'Resume Help', icon: '📄' },
    { id: 'networking', name: 'Networking', icon: '🤝' },
    { id: 'advice', name: 'Career Advice', icon: '🌟' }
  ];

  // Dummy data for community posts
  const dummyPosts = [
    {
      id: 1,
      title: "How was your internship experience at Google Singapore?",
      content: "I'm applying for a software engineering internship at Google Singapore for summer 2025. Would love to hear from anyone who's interned there before! What was the interview process like? How was the work culture? Any tips would be appreciated! 🙏",
      author: {
        name: "Alex Chen",
        avatar: "AC",
        year: "Year 3",
        major: "Computer Science"
      },
      category: "company",
      tags: ["google", "software-engineering", "singapore"],
      createdAt: "2025-01-15T10:30:00Z",
      likes: 15,
      comments: [
        {
          id: 1,
          author: {
            name: "Sarah Lim",
            avatar: "SL",
            year: "Year 4",
            major: "Computer Science"
          },
          content: "I interned at Google SG last summer! The interview process was tough - 2 technical rounds + 1 behavioral. The work culture is amazing, very collaborative and inclusive. Happy to chat more if you want!",
          createdAt: "2025-01-15T11:45:00Z",
          likes: 8
        },
        {
          id: 2,
          author: {
            name: "Marcus Wong",
            avatar: "MW",
            year: "Graduate",
            major: "Computer Science"
          },
          content: "Google Singapore is fantastic! Pro tip: brush up on programming basics. The mentorship program there is top-notch. Good luck with your application!",
          createdAt: "2025-01-15T14:20:00Z",
          likes: 5
        }
      ],
      isLiked: false
    },
    {
      id: 2,
      title: "Resume review request - applying for data science roles",
      content: "Hi everyone! I'm a Year 2 Data Science student looking to apply for summer internships. Could someone experienced review my resume? I'm particularly interested in fintech roles. Not sure if my projects section is strong enough. Thanks in advance!",
      author: {
        name: "Emma Tan",
        avatar: "ET",
        year: "Year 2",
        major: "Data Science & Economics"
      },
      category: "resume",
      tags: ["resume-review", "data-science", "fintech"],
      createdAt: "2025-01-14T16:15:00Z",
      likes: 23,
      comments: [
        {
          id: 3,
          author: {
            name: "David Wong",
            avatar: "DW",
            year: "Graduate",
            major: "Statistics"
          },
          content: "Hey Emma! I'd be happy to take a look. I landed a DA internship at DBS last year. Focus on quantifying your project impacts - use metrics like 'improved accuracy by X%' or 'reduced processing time by Y minutes'. DM me your resume!",
          createdAt: "2025-01-14T17:30:00Z",
          likes: 12
        }
      ],
      isLiked: true
    },
    {
      id: 3,
      title: "Virtual networking events - worth attending?",
      content: "There are so many virtual career fairs and networking events happening. Are these actually useful for landing internships? I'm an introverted person and find it hard to make meaningful connections online. Any success stories or tips for making the most of these events? ",
      author: {
        name: "James Tan",
        avatar: "JT",
        year: "Year 3",
        major: "Business Analytics"
      },
      category: "networking",
      tags: ["networking", "virtual-events", "career-fair"],
      createdAt: "2025-01-13T09:45:00Z",
      likes: 18,
      comments: [
        {
          id: 4,
          author: {
            name: "Priya",
            avatar: "P",
            year: "Year 4",
            major: "Business"
          },
          content: "Virtual events actually work! I got my Goldman Sachs internship through a virtual career fair. The key is preparation - research companies beforehand, prepare your elevator pitch, and follow up with LinkedIn connections within 24 hours. Quality over quantity!",
          createdAt: "2025-01-13T11:20:00Z",
          likes: 15
        },
        {
          id: 5,
          author: {
            name: "Ryan Lee",
            avatar: "RL",
            year: "Year 3",
            major: "Economics"
          },
          content: "As a fellow introvert, I feel you! What helped me was joining smaller breakout sessions rather than the main events. Less overwhelming and easier to have real conversations. Also, preparing specific questions about the company shows genuine interest.",
          createdAt: "2025-01-13T13:15:00Z",
          likes: 7
        }
      ],
      isLiked: false
    },
    {
      id: 4,
      title: "Technical interview prep - best resources?",
      content: "I have a technical interview coming up for a SWE intern position at a local startup. What are the best resources for practicing coding problems? LeetCode? Also, any tips for system design questions for intern roles? Thanks! ",
      author: {
        name: "Michelle Chua",
        avatar: "MC",
        year: "Year 2",
        major: "Computer Science"
      },
      category: "interview",
      tags: ["technical-interview", "coding", "system-design"],
      createdAt: "2025-01-12T20:30:00Z",
      likes: 31,
      comments: [
        {
          id: 6,
          author: {
            name: "Kevin Ng",
            avatar: "KN",
            year: "Graduate",
            major: "Computer Science"
          },
          content: "LeetCode is gold standard! Focus on easy/medium problems, especially arrays, strings, and trees. For system design, 'Designing Data-Intensive Applications' book is great. But for intern roles, they usually ask simpler questions like 'design a URL shortener'. Practice explaining your thought process out loud!",
          createdAt: "2025-01-12T21:45:00Z",
          likes: 20
        }
      ],
      isLiked: false
    },
    {
      id: 5,
      title: "Unpaid internships - red flag or opportunity?",
      content: "I got offered an internship at a startup but it's unpaid. They say it's because they're a small company but offer great learning opportunities and potential for full-time conversion. Is this worth considering or should I hold out for paid opportunities? What's everyone's experience with unpaid internships? ",
      author: {
        name: "Daniel Loh",
        avatar: "DL",
        year: "Year 2",
        major: "Information Systems"
      },
      category: "advice",
      tags: ["unpaid-internship", "startup", "career-advice"],
      createdAt: "2025-01-11T14:20:00Z",
      likes: 42,
      comments: [
        {
          id: 7,
          author: {
            name: "Stephanie Wu",
            avatar: "SW",
            year: "Year 4",
            major: "Business"
          },
          content: "Personally, I'd avoid unpaid internships unless it's at a non-profit or NGO. Your time and skills have value! Even small startups should be able to offer at least transport allowance or stipend. There are plenty of paid opportunities if you keep looking. Don't sell yourself short! 💪",
          createdAt: "2025-01-11T15:30:00Z",
          likes: 25
        },
        {
          id: 8,
          author: {
            name: "Andrew Teo",
            avatar: "AT",
            year: "Graduate",
            major: "Information Systems"
          },
          content: "I disagree with the blanket 'no unpaid internships' rule. I did an unpaid internship at a startup in Y2 and learned more in 3 months than some of my friends did in paid roles. Got a full-time offer there too. Evaluate based on learning opportunities, mentorship quality, and growth potential, not just money.",
          createdAt: "2025-01-11T16:45:00Z",
          likes: 18
        }
      ],
      isLiked: true
    }
  ];

  // Load posts on component mount
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPosts(dummyPosts);
      setLoading(false);
    }, 500);
  }, []);

  // Load profile data on component mount
  useEffect(() => {
    const profile = getProfileData();
    setProfileData(profile);
  }, []);

  // Filter and sort posts
  const getFilteredPosts = () => {
    let filtered = posts;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return b.likes - a.likes;
        case 'discussed':
          return b.comments.length - a.comments.length;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  // UPDATED: Handle post creation with profile data
  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    // Get fresh profile data
    const currentProfileData = getProfileData();

    const post = {
      id: Date.now(),
      title: newPost.title,
      content: newPost.content,
      author: {
        name: user?.full_name || 'Anonymous User',
        avatar: user?.full_name?.split(' ').map(n => n[0]).join('') || 'AU',
        year: currentProfileData?.year || 'Year not specified', 
        major: currentProfileData?.major || 'Major not specified' 
      },
      category: newPost.category,
      tags: newPost.tags,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: 'general', tags: [] });
    setShowCreatePost(false);
    alert('Post created successfully!');
  };

  // Handle adding tags
  const handleAddTag = () => {
    if (newTag.trim() && !newPost.tags.includes(newTag.trim().toLowerCase())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, newTag.trim().toLowerCase()]
      });
      setNewTag('');
    }
  };

  // Handle like post
  const handleLikePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  // Handle like comment
  const handleLikeComment = (postId, commentId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked
              };
            }
            return comment;
          })
        };
      }
      return post;
    }));
  };

  // Handle reply to post
  const handleReplyToPost = (postId) => {
    if (!user) {
      alert('Please log in to reply to posts');
      navigate('/login');
      return;
    }
    setReplyingTo(postId);
    setNewComment('');
  };

  // Handle submit comment with profile data
  const handleSubmitComment = (postId) => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    // Get fresh profile data
    const currentProfileData = getProfileData();

    const comment = {
      id: Date.now(),
      author: {
        name: user?.full_name || 'Anonymous User',
        avatar: user?.full_name?.split(' ').map(n => n[0]).join('') || 'AU',
        year: currentProfileData?.year || 'Year not specified', 
        major: currentProfileData?.major || 'Major not specified' 
      },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));

    setReplyingTo(null);
    setNewComment('');
  };

  // Handle cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Time formatting helper
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // ProfileStatus component for create post modal
  const ProfileStatus = () => {
    const currentProfileData = getProfileData();
    
    return (
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>👤</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Posting as:</span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <div><strong>Name:</strong> {user?.full_name || 'Anonymous User'}</div>
          <div><strong>Year:</strong> {currentProfileData?.year || 'Not specified'}</div>
          <div><strong>Major:</strong> {currentProfileData?.major || 'Not specified'}</div>
        </div>
        {(!currentProfileData?.year || !currentProfileData?.major) && (
          <div style={{ 
            marginTop: '0.5rem',
            fontSize: '0.8rem',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>⚠️</span>
            <span>
              Update your <button 
                onClick={() => navigate('/profile')} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#3b82f6', 
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                profile
              </button> to show your year and major in posts
            </span>
          </div>
        )}
      </div>
    );
  };

  const filteredPosts = getFilteredPosts();

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
            <p>Loading community posts...</p>
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
            <span>👥 {user?.full_name || user?.email || 'Community Member'}</span>
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
          <button className={styles.profileBtn} onClick={() => navigate('/profile')}>Profile</button>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>InterNUShip Community</h1>
        <p className={styles.heroSubtitle}>
          Connect with fellow students, share experiences, and get advice on your internship journey
        </p>
        
        <div className={styles.userStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{posts.length}</span>
            <span className={styles.statLabel}>Active Posts</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{posts.reduce((acc, post) => acc + post.comments.length, 0)}</span>
            <span className={styles.statLabel}>Total Comments</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>250+</span>
            <span className={styles.statLabel}>Community Members</span>
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
              placeholder="Search posts, topics, or tags..."
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
              <option value="latest">Latest Posts</option>
              <option value="popular">Most Liked</option>
              <option value="discussed">Most Discussed</option>
            </select>
            
            <button 
              className={styles.ctaPrimary}
              onClick={() => setShowCreatePost(true)}
              style={{ marginLeft: '1rem' }}
            >
              ✏️ New Post
            </button>
          </div>
        </div>
      </section>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Create New Post</h2>
            
            {/* ADD: Profile Status Display */}
            <ProfileStatus />
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Title *</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="What's your question or topic?"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)'
                }}
              >
                {categories.filter(cat => cat.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Content *</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Share your thoughts, questions, or experiences..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Tags</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.5rem',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {newPost.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: '#c4b5fd',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '1rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setNewPost({
                        ...newPost,
                        tags: newPost.tags.filter(t => t !== tag)
                      })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#c4b5fd',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreatePost(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Section */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>
            {selectedCategory === 'all' ? 'All Posts' : categories.find(cat => cat.id === selectedCategory)?.name}
            <span className={styles.badge}>{filteredPosts.length}</span>
          </h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div className={styles.noResults}>
            <h3>No posts found</h3>
            <p>Be the first to start a discussion in this category!</p>
            <button className={styles.ctaPrimary} onClick={() => setShowCreatePost(true)}>
              Create First Post
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {filteredPosts.map(post => (
              <div key={post.id} style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem',
                backdropFilter: 'blur(10px)'
              }}>
                {/* Post Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {post.author.avatar}
                    </div>
                    <div>
                      <h3 style={{ 
                        color: 'var(--text-primary)', 
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.1rem'
                      }}>
                        {post.author.name}
                      </h3>
                      <p style={{ 
                        color: 'var(--text-muted)', 
                        margin: 0,
                        fontSize: '0.875rem'
                      }}>
                        {post.author.year} • {post.author.major} • {formatTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#c4b5fd',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.8rem'
                  }}>
                    {categories.find(cat => cat.id === post.category)?.name}
                  </span>
                </div>

                {/* Post Title */}
                <h2 style={{
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 1rem 0',
                  lineHeight: '1.3'
                }}>
                  {post.title}
                </h2>

                {/* Post Content */}
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  margin: '0 0 1rem 0'
                }}>
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#93c5fd',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleLikePost(post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: post.isLiked ? '#ef4444' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {post.isLiked ? '❤️' : '🤍'} {post.likes}
                    </button>
                    <span style={{
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      💬 {post.comments.length} comments
                    </span>
                  </div>
                  <button
                    onClick={() => handleReplyToPost(post.id)}
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Reply
                  </button>
                </div>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                      Comments ({post.comments.length})
                    </h4>
                    {post.comments.map(comment => (
                      <div key={comment.id} style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1rem',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--accent-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          flexShrink: 0
                        }}>
                          {comment.author.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                              {comment.author.name}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {comment.author.year} • {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p style={{
                            color: 'var(--text-secondary)',
                            lineHeight: '1.5',
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.9rem'
                          }}>
                            {comment.content}
                          </p>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button 
                              onClick={() => handleLikeComment(post.id, comment.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: comment.isLiked ? '#ef4444' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              {comment.isLiked ? '❤️' : '🤍'} {comment.likes}
                            </button>
                            <button 
                              onClick={() => handleReplyToPost(post.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === post.id && (
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--glass-border)'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                      Add a comment
                    </h4>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}>
                        {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '0.5rem',
                            background: 'var(--glass-bg)',
                            color: 'var(--text-primary)',
                            resize: 'vertical',
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={handleCancelReply}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'var(--glass-bg)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitComment(post.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'var(--accent-gradient)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Community Guidelines */}
      <section className={styles.tipsSection}>
        <h2>💡 Community Guidelines</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🤝</div>
            <h3>Be Respectful</h3>
            <p>Treat all community members with respect and kindness. We're all here to learn and help each other succeed in our internship journeys.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🔍</div>
            <h3>Search Before Posting</h3>
            <p>Check if your question has been asked before. Use relevant tags and categories to make your posts easily discoverable by others.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>💎</div>
            <h3>Share Quality Content</h3>
            <p>Provide detailed context in your posts. Share specific experiences, actionable advice, and constructive feedback to help the community grow.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Community;