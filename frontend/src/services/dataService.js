
import { 
  dummyInternships, 
  simulateAPIResponse, 
  simulateWebScrapingResults,
  internshipCategories,
  calculateMatchScore 
} from '../data/internshipData';

class DataService {
  // Simulate fetching all internships (as if from aggregated API/scraping)
  static async getAllInternships(filters = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let internships = [...dummyInternships];

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      internships = internships.filter(i => i.category === filters.category);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      internships = internships.filter(i =>
        i.title.toLowerCase().includes(searchTerm) ||
        i.company.toLowerCase().includes(searchTerm) ||
        i.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
        i.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.location) {
      internships = internships.filter(i => 
        i.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minStipend) {
      internships = internships.filter(i => {
        const stipend = parseInt(i.stipend.replace(/[^\d]/g, ''));
        return stipend >= filters.minStipend;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'deadline':
          internships.sort((a, b) => 
            new Date(a.deadline.split('/').reverse().join('-')) - 
            new Date(b.deadline.split('/').reverse().join('-'))
          );
          break;
        case 'stipend':
          internships.sort((a, b) => {
            const stipendA = parseInt(a.stipend.replace(/[^\d]/g, ''));
            const stipendB = parseInt(b.stipend.replace(/[^\d]/g, ''));
            return stipendB - stipendA;
          });
          break;
        case 'posted':
          internships.sort((a, b) => 
            new Date(b.postedDate.split('/').reverse().join('-')) - 
            new Date(a.postedDate.split('/').reverse().join('-'))
          );
          break;
        case 'match':
          if (filters.userProfile) {
            internships.forEach(internship => {
              internship.match = calculateMatchScore(filters.userProfile, internship);
            });
            internships.sort((a, b) => b.match - a.match);
          }
          break;
        default:
          // Default to posted date
          internships.sort((a, b) => 
            new Date(b.postedDate.split('/').reverse().join('-')) - 
            new Date(a.postedDate.split('/').reverse().join('-'))
          );
      }
    }

    return {
      success: true,
      data: internships,
      total: internships.length,
      filters: filters,
      lastUpdated: new Date().toISOString()
    };
  }

  // Simulate getting personalized recommendations
  static async getRecommendations(userProfile, limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 300));

    let recommendations = [...dummyInternships];

    // Calculate match scores for all internships
    recommendations = recommendations.map(internship => ({
      ...internship,
      match: calculateMatchScore(userProfile, internship)
    }));

    // Sort by match score and take top results
    recommendations.sort((a, b) => b.match - a.match);
    recommendations = recommendations.slice(0, limit);

    return {
      success: true,
      data: recommendations,
      userProfile: userProfile,
      algorithmUsed: 'TF-IDF + Cosine Similarity (Simulated)',
      generatedAt: new Date().toISOString()
    };
  }

  // Simulate fetching internship by ID
  static async getInternshipById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));

    const internship = dummyInternships.find(i => i.id === parseInt(id));
    
    if (!internship) {
      return {
        success: false,
        error: 'Internship not found'
      };
    }

    return {
      success: true,
      data: internship
    };
  }

  // Simulate getting user profile data
  static async getUserProfile(userId) {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate user profile data - you can customize this data
    const userProfile = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe', 
      email: 'john.doe@example.com',
      phone: '+65 9123 4567',
      university: 'National University of Singapore',
      major: 'Computer Science',
      graduationDate: '2025-12-15',
      gpa: '3.75',
      skills: ['JavaScript', 'React', 'Python', 'Node.js', 'SQL'],
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      githubUrl: 'https://github.com/johndoe',
      portfolioUrl: 'https://johndoe.dev',
      availability: 'full-time',
      relevantExperience: 'Completed several web development projects including a full-stack e-commerce platform and contributed to open-source React libraries.',
      bio: 'Passionate computer science student with strong background in web development.',
      location: 'Singapore',
      yearOfStudy: '3rd Year',
      cgpa: 3.75,
      profileCompleteness: 85,
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      data: userProfile,
      message: 'Profile retrieved successfully'
    };
  }
  
  // Simulate platform-specific scraping results
  static async getInternshipsByPlatform(platform) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return simulateAPIResponse(platform);
  }

  // Simulate full web scraping aggregation
  static async performWebScraping() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return simulateWebScrapingResults();
  }

  // Get categories with counts
  static async getCategories() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      success: true,
      data: internshipCategories
    };
  }

  // Simulate bookmarking an internship
  static async bookmarkInternship(userId, internshipId, notes = '') {
    await new Promise(resolve => setTimeout(resolve, 300));

    // In real implementation, this would save to database
    const bookmark = {
      id: Date.now(),
      userId: userId,
      internshipId: internshipId,
      notes: notes,
      bookmarkedAt: new Date().toISOString(),
      priority: 'medium'
    };

    return {
      success: true,
      data: bookmark,
      message: 'Internship bookmarked successfully'
    };
  }

  // Simulate removing bookmark
  static async removeBookmark(userId, internshipId) {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      success: true,
      message: 'Bookmark removed successfully'
    };
  }

  // Simulate getting user's bookmarks
  static async getUserBookmarks(userId) {
    await new Promise(resolve => setTimeout(resolve, 400));

    // Return a subset of internships as "bookmarked"
    const bookmarkedInternships = dummyInternships.slice(0, 5).map(internship => ({
      ...internship,
      bookmarkedDate: '2025-05-20',
      notes: `Saved this ${internship.title} position for future application.`,
      priority: Math.random() > 0.5 ? 'high' : 'medium',
      status: ['not-applied', 'planning', 'applied', 'considering'][Math.floor(Math.random() * 4)]
    }));

    return {
      success: true,
      data: bookmarkedInternships,
      total: bookmarkedInternships.length
    };
  }

  // Simulate submitting an application
  static async submitApplication(applicationData) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const application = {
      id: Date.now(),
      ...applicationData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      data: application,
      message: 'Application submitted successfully'
    };
  }

  // Simulate getting user's applications
  static async getUserApplications(userId) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return sample applications with full internship data
    const applications = [
      {
        id: 1,
        internshipId: 1,
        userId: userId,
        status: 'pending',
        submittedAt: '2025-05-15',
        lastUpdated: '2025-05-15',
        internship: dummyInternships.find(i => i.id === 1),
        documents: ['resume.pdf', 'cover_letter.pdf'],
        notes: 'Really excited about this opportunity!'
      },
      {
        id: 2,
        internshipId: 5,
        userId: userId,
        status: 'interview',
        submittedAt: '2025-05-10',
        lastUpdated: '2025-05-18',
        internship: dummyInternships.find(i => i.id === 5),
        documents: ['resume.pdf', 'cover_letter.pdf', 'portfolio.pdf'],
        notes: 'Interview scheduled for next week',
        nextStep: 'Technical interview on 2025-05-25'
      },
      {
        id: 3,
        internshipId: 7,
        userId: userId,
        status: 'accepted',
        submittedAt: '2025-05-05',
        lastUpdated: '2025-05-20',
        internship: dummyInternships.find(i => i.id === 7),
        documents: ['resume.pdf', 'cover_letter.pdf'],
        notes: 'Got the offer! Need to submit onboarding documents.',
        nextStep: 'Submit onboarding documents by 2025-06-01'
      }
    ];

    return {
      success: true,
      data: applications,
      total: applications.length
    };
  }

  // Simulate search functionality with autocomplete
  static async searchInternships(query, limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 200));

    const results = dummyInternships.filter(internship =>
      internship.title.toLowerCase().includes(query.toLowerCase()) ||
      internship.company.toLowerCase().includes(query.toLowerCase()) ||
      internship.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, limit);

    return {
      success: true,
      data: results,
      query: query,
      total: results.length
    };
  }

  // Simulate getting trending skills
  static async getTrendingSkills() {
    await new Promise(resolve => setTimeout(resolve, 150));

    const allSkills = dummyInternships.flatMap(i => i.skills);
    const skillCounts = {};
    
    allSkills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    const trendingSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count, trend: '+12%' }));

    return {
      success: true,
      data: trendingSkills
    };
  }

  // Simulate getting company information
  static async getCompanyInfo(companyName) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const companyData = {
      name: companyName,
      size: '101-500 employees',
      industry: 'Technology',
      description: `${companyName} is a leading technology company focused on innovation and growth.`,
      website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      logo: '🏢',
      founded: '2015',
      headquarters: 'Singapore',
      internshipPrograms: dummyInternships.filter(i => i.company === companyName).length,
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
      benefits: [
        'Health insurance',
        'Learning budget',
        'Flexible hours',
        'Free meals'
      ]
    };

    return {
      success: true,
      data: companyData
    };
  }

  // Simulate analytics data for admin dashboard
  static async getAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      success: true,
      data: {
        totalInternships: dummyInternships.length,
        totalApplications: 156,
        totalUsers: 1247,
        successRate: 23.5,
        platformStats: {
          linkedin: { internships: 4, applications: 45 },
          indeed: { internships: 3, applications: 38 },
          jobsbank: { internships: 3, applications: 29 },
          mycareersfuture: { internships: 2, applications: 22 },
          glassdoor: { internships: 2, applications: 15 },
          direct: { internships: 1, applications: 7 }
        },
        categoryStats: internshipCategories.map(cat => ({
          category: cat.name,
          count: cat.count,
          applicationRate: Math.random() * 30 + 10 // Random application rate
        })),
        recentActivity: [
          { action: 'New internship posted', company: 'TechCorp Singapore', time: '2 hours ago' },
          { action: 'Application submitted', user: 'John D.', time: '3 hours ago' },
          { action: 'Interview scheduled', company: 'Design Studio', time: '5 hours ago' }
        ]
      }
    };
  }

  // Simulate real-time notifications
  static async getNotifications(userId) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const notifications = [
      {
        id: 1,
        type: 'deadline',
        title: 'Application Deadline Soon',
        message: 'Your bookmarked internship at TechCorp Singapore is due in 3 days',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'match',
        title: 'New Perfect Match',
        message: 'We found a 95% match for your skills at CloudTech Solutions',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 3,
        type: 'application',
        title: 'Application Status Update',
        message: 'Your application at Design Studio has been reviewed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];

    return {
      success: true,
      data: notifications,
      unreadCount: notifications.filter(n => !n.read).length
    };
  }

  // Simulate industry insights
  static async getIndustryInsights() {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      success: true,
      data: {
        growingIndustries: [
          { name: 'Technology', growth: '+25%', internships: 8 },
          { name: 'Data Science', growth: '+18%', internships: 4 },
          { name: 'Digital Marketing', growth: '+15%', internships: 3 }
        ],
        inDemandSkills: [
          { skill: 'Python', demand: 'High', internships: 6 },
          { skill: 'React', demand: 'High', internships: 5 },
          { skill: 'Machine Learning', demand: 'Medium', internships: 3 }
        ],
        salaryTrends: {
          technology: { min: 1100, max: 1600, average: 1275 },
          finance: { min: 1200, max: 1600, average: 1400 },
          design: { min: 900, max: 1200, average: 1050 }
        },
        applicationTips: [
          'Tailor your resume to match job requirements',
          'Apply early - most positions are filled within 2 weeks',
          'Include a portfolio for design and development roles',
          'Research company culture before applying'
        ]
      }
    };
  }
}

export default DataService;