<<<<<<< HEAD
import SmartMatchingAlgorithm, { createSmartMatcher } from './smartMatchingAlgorithm.js';
import DataService from './dataService.js';

/**
 * Enhanced Matching Service
 * Integrates the smart matching algorithm with your existing data service
 */
class EnhancedMatchingService {
  constructor() {
    this.matcher = createSmartMatcher();
    this.isInitialized = false;
    this.userFeedback = [];
  }

  /**
   * Initialize the matching service with current data
   */
  async initialize() {
    try {
      console.log('Initializing Enhanced Matching Service...');
      
      // Get all available internships to build vocabulary
      const internshipsResponse = await DataService.getAllInternships();
      
      if (internshipsResponse.success) {
        // Build initial vocabulary
        this.matcher.buildVocabulary(internshipsResponse.data);
        this.isInitialized = true;
        
        console.log(`Matching service initialized with ${internshipsResponse.data.length} internships`);
        return { success: true, internshipsLoaded: internshipsResponse.data.length };
      }
      
      throw new Error('Failed to load internships data');
      
    } catch (error) {
      console.error('Failed to initialize matching service:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(userProfile, options = {}) {
    const {
      limit = 10,
      includeExplanations = false,
      filterByCategory = null,
      minMatchScore = 30
    } = options;

    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get all internships
      const internshipsResponse = await DataService.getAllInternships({
        category: filterByCategory
      });

      if (!internshipsResponse.success) {
        throw new Error('Failed to fetch internships');
      }

      // Use smart matching algorithm
      const result = this.matcher.getRecommendations(
        userProfile, 
        internshipsResponse.data, 
        limit * 2 // Get more to filter by min score
      );

      // Filter by minimum match score
      const filteredRecommendations = result.recommendations
        .filter(internship => internship.match >= minMatchScore)
        .slice(0, limit);

      // Add explanations if requested
      if (includeExplanations) {
        filteredRecommendations.forEach(internship => {
          internship.explanation = this.matcher.explainRecommendation(userProfile, internship);
        });
      }

      return {
        success: true,
        data: filteredRecommendations,
        metadata: {
          algorithm: result.algorithm,
          totalEvaluated: result.totalEvaluated,
          weights: result.weights,
          userProfile: result.userProfile,
          filters: {
            category: filterByCategory,
            minMatchScore: minMatchScore
          }
        },
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return {
        success: false,
        error: error.message,
        fallback: await this.getFallbackRecommendations(userProfile, limit)
      };
    }
  }

  /**
   * Fallback to simple matching if advanced algorithm fails
   */
  async getFallbackRecommendations(userProfile, limit) {
    try {
      return await DataService.getRecommendations(userProfile, limit);
    } catch (error) {
      console.error('Fallback recommendations also failed:', error);
      return { success: false, error: 'All recommendation systems failed' };
    }
  }

  /**
   * Explain why a specific internship was recommended
   */
  explainRecommendation(userProfile, internship) {
    try {
      return this.matcher.explainRecommendation(userProfile, internship);
    } catch (error) {
      console.error('Error explaining recommendation:', error);
      return {
        score: 0,
        breakdown: {},
        explanations: ['Unable to generate explanation'],
        recommendation: 'Error'
      };
    }
  }

  /**
   * Calculate match score for a specific internship
   */
  calculateMatchScore(userProfile, internship) {
    try {
      return this.matcher.calculateMatchScore(userProfile, internship);
    } catch (error) {
      console.error('Error calculating match score:', error);
      return { totalScore: 0, breakdown: {}, error: error.message };
    }
  }

  /**
   * Record user feedback to improve algorithm
   */
  recordUserFeedback(feedback) {
    const feedbackEntry = {
      ...feedback,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    this.userFeedback.push(feedbackEntry);
    
    // Update algorithm weights based on feedback
    this.matcher.updateWeights(feedbackEntry);

    console.log('Recorded user feedback:', feedbackEntry);
    return feedbackEntry;
  }

  /**
   * Batch process recommendations for multiple users
   */
  async batchProcessRecommendations(userProfiles, options = {}) {
    const results = [];
    
    for (const userProfile of userProfiles) {
      try {
        const recommendations = await this.getPersonalizedRecommendations(userProfile, options);
        results.push({
          userId: userProfile.id,
          recommendations: recommendations
        });
      } catch (error) {
        results.push({
          userId: userProfile.id,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Get algorithm performance metrics
   */
  getPerformanceMetrics() {
    const feedbackByType = this.userFeedback.reduce((acc, feedback) => {
      acc[feedback.type] = (acc[feedback.type] || 0) + 1;
      return acc;
    }, {});

    const avgMatchScores = this.userFeedback
      .filter(f => f.match !== undefined)
      .map(f => f.match);

    return {
      totalFeedback: this.userFeedback.length,
      feedbackBreakdown: feedbackByType,
      averageMatchScore: avgMatchScores.length > 0 ? 
        avgMatchScores.reduce((a, b) => a + b, 0) / avgMatchScores.length : 0,
      currentWeights: this.matcher.weights,
      vocabularySize: this.matcher.vocabulary.size,
      isInitialized: this.isInitialized
    };
  }
}

/**
 * Utility function to test the matching algorithm
 */
export async function testMatchingAlgorithm() {
  console.log('Testing Smart Matching Algorithm...');
  
  const matchingService = new EnhancedMatchingService();
  await matchingService.initialize();

  // Test user profile
  const testUser = {
    id: 'test-user-1',
    skills: ['React', 'JavaScript', 'Python', 'Machine Learning'],
    experience: [
      {
        title: 'Frontend Developer Intern',
        description: 'Built React applications with modern JavaScript'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'National University of Singapore'
      }
    ],
    location: 'Singapore',
    preferredCategories: ['technology', 'data'],
    experienceLevel: 'intermediate'
  };

  try {
    const recommendations = await matchingService.getPersonalizedRecommendations(testUser, {
      limit: 5,
      includeExplanations: true
    });

    console.log('Test Results:');
    console.log('- Generated', recommendations.data.length, 'recommendations');
    console.log('- Top match score:', recommendations.data[0]?.match);
    console.log('- Algorithm weights:', recommendations.metadata.weights);

    // Test explanation for top recommendation
    if (recommendations.data.length > 0) {
      const topMatch = recommendations.data[0];
      const explanation = matchingService.explainRecommendation(testUser, topMatch);
      console.log('- Top match explanation:', explanation.explanations);
    }

    return {
      success: true,
      recommendations: recommendations.data,
      metrics: matchingService.getPerformanceMetrics()
    };

  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Export the main service
=======
import SmartMatchingAlgorithm, { createSmartMatcher } from './smartMatchingAlgorithm.js';
import DataService from './dataService.js';

/**
 * Enhanced Matching Service
 * Integrates the smart matching algorithm with your existing data service
 */
class EnhancedMatchingService {
  constructor() {
    this.matcher = createSmartMatcher();
    this.isInitialized = false;
    this.userFeedback = [];
  }

  /**
   * Initialize the matching service with current data
   */
  async initialize() {
    try {
      console.log('Initializing Enhanced Matching Service...');
      
      // Get all available internships to build vocabulary
      const internshipsResponse = await DataService.getAllInternships();
      
      if (internshipsResponse.success) {
        // Build initial vocabulary
        this.matcher.buildVocabulary(internshipsResponse.data);
        this.isInitialized = true;
        
        console.log(`Matching service initialized with ${internshipsResponse.data.length} internships`);
        return { success: true, internshipsLoaded: internshipsResponse.data.length };
      }
      
      throw new Error('Failed to load internships data');
      
    } catch (error) {
      console.error('Failed to initialize matching service:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(userProfile, options = {}) {
    const {
      limit = 10,
      includeExplanations = false,
      filterByCategory = null,
      minMatchScore = 30
    } = options;

    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get all internships
      const internshipsResponse = await DataService.getAllInternships({
        category: filterByCategory
      });

      if (!internshipsResponse.success) {
        throw new Error('Failed to fetch internships');
      }

      // Use smart matching algorithm
      const result = this.matcher.getRecommendations(
        userProfile, 
        internshipsResponse.data, 
        limit * 2 // Get more to filter by min score
      );

      // Filter by minimum match score
      const filteredRecommendations = result.recommendations
        .filter(internship => internship.match >= minMatchScore)
        .slice(0, limit);

      // Add explanations if requested
      if (includeExplanations) {
        filteredRecommendations.forEach(internship => {
          internship.explanation = this.matcher.explainRecommendation(userProfile, internship);
        });
      }

      return {
        success: true,
        data: filteredRecommendations,
        metadata: {
          algorithm: result.algorithm,
          totalEvaluated: result.totalEvaluated,
          weights: result.weights,
          userProfile: result.userProfile,
          filters: {
            category: filterByCategory,
            minMatchScore: minMatchScore
          }
        },
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return {
        success: false,
        error: error.message,
        fallback: await this.getFallbackRecommendations(userProfile, limit)
      };
    }
  }

  /**
   * Fallback to simple matching if advanced algorithm fails
   */
  async getFallbackRecommendations(userProfile, limit) {
    try {
      return await DataService.getRecommendations(userProfile, limit);
    } catch (error) {
      console.error('Fallback recommendations also failed:', error);
      return { success: false, error: 'All recommendation systems failed' };
    }
  }

  /**
   * Explain why a specific internship was recommended
   */
  explainRecommendation(userProfile, internship) {
    try {
      return this.matcher.explainRecommendation(userProfile, internship);
    } catch (error) {
      console.error('Error explaining recommendation:', error);
      return {
        score: 0,
        breakdown: {},
        explanations: ['Unable to generate explanation'],
        recommendation: 'Error'
      };
    }
  }

  /**
   * Calculate match score for a specific internship
   */
  calculateMatchScore(userProfile, internship) {
    try {
      return this.matcher.calculateMatchScore(userProfile, internship);
    } catch (error) {
      console.error('Error calculating match score:', error);
      return { totalScore: 0, breakdown: {}, error: error.message };
    }
  }

  /**
   * Record user feedback to improve algorithm
   */
  recordUserFeedback(feedback) {
    const feedbackEntry = {
      ...feedback,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    this.userFeedback.push(feedbackEntry);
    
    // Update algorithm weights based on feedback
    this.matcher.updateWeights(feedbackEntry);

    console.log('Recorded user feedback:', feedbackEntry);
    return feedbackEntry;
  }

  /**
   * Batch process recommendations for multiple users
   */
  async batchProcessRecommendations(userProfiles, options = {}) {
    const results = [];
    
    for (const userProfile of userProfiles) {
      try {
        const recommendations = await this.getPersonalizedRecommendations(userProfile, options);
        results.push({
          userId: userProfile.id,
          recommendations: recommendations
        });
      } catch (error) {
        results.push({
          userId: userProfile.id,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Get algorithm performance metrics
   */
  getPerformanceMetrics() {
    const feedbackByType = this.userFeedback.reduce((acc, feedback) => {
      acc[feedback.type] = (acc[feedback.type] || 0) + 1;
      return acc;
    }, {});

    const avgMatchScores = this.userFeedback
      .filter(f => f.match !== undefined)
      .map(f => f.match);

    return {
      totalFeedback: this.userFeedback.length,
      feedbackBreakdown: feedbackByType,
      averageMatchScore: avgMatchScores.length > 0 ? 
        avgMatchScores.reduce((a, b) => a + b, 0) / avgMatchScores.length : 0,
      currentWeights: this.matcher.weights,
      vocabularySize: this.matcher.vocabulary.size,
      isInitialized: this.isInitialized
    };
  }
}

/**
 * Utility function to test the matching algorithm
 */
export async function testMatchingAlgorithm() {
  console.log('Testing Smart Matching Algorithm...');
  
  const matchingService = new EnhancedMatchingService();
  await matchingService.initialize();

  // Test user profile
  const testUser = {
    id: 'test-user-1',
    skills: ['React', 'JavaScript', 'Python', 'Machine Learning'],
    experience: [
      {
        title: 'Frontend Developer Intern',
        description: 'Built React applications with modern JavaScript'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'National University of Singapore'
      }
    ],
    location: 'Singapore',
    preferredCategories: ['technology', 'data'],
    experienceLevel: 'intermediate'
  };

  try {
    const recommendations = await matchingService.getPersonalizedRecommendations(testUser, {
      limit: 5,
      includeExplanations: true
    });

    console.log('Test Results:');
    console.log('- Generated', recommendations.data.length, 'recommendations');
    console.log('- Top match score:', recommendations.data[0]?.match);
    console.log('- Algorithm weights:', recommendations.metadata.weights);

    // Test explanation for top recommendation
    if (recommendations.data.length > 0) {
      const topMatch = recommendations.data[0];
      const explanation = matchingService.explainRecommendation(testUser, topMatch);
      console.log('- Top match explanation:', explanation.explanations);
    }

    return {
      success: true,
      recommendations: recommendations.data,
      metrics: matchingService.getPerformanceMetrics()
    };

  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Export the main service
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export default EnhancedMatchingService;