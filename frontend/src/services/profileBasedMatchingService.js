import DataService from './dataService.js';

class ProfileBasedMatchingService {
  constructor() {
    // Updated weights based on the Formula 
    this.weights = {
      contentSimilarity: 0.20,  // TF-IDF Content Similarity (20% weight)
      skillMatch: 0.40,         // Skill Matching (40% weight)
      experienceRelevance: 0.25, // Experience Relevance (25% weight)
      educationRelevance: 0.15,  // Education Relevance (15% weight) 
      locationScore: 0.10,       // Location Score (10% weight)
      categoryScore: 0.10,       // Category Score (10% weight)
      experienceLevelScore: 0.10 // Experience Level Score (10% weight)
    };
    this.userFeedback = [];
    this.vocabulary = new Set();
  }

  /**
   * Extract meaningful data from your profile structure
   */
  extractProfileData(profileData) {
    const extracted = {
      skills: profileData.skills || [],
      major: profileData.major || '',
      university: profileData.university || '',
      location: profileData.location || '',
      experience: profileData.experience || [],
      education: profileData.education || [],
      bio: profileData.bio || '',
      year: profileData.year || ''
    };

    console.log('Extracted profile data:', extracted);
    return extracted;
  }

  /**
   * Get user profile from localStorage or context
   */
  getUserProfile() {
    try {
      // Try to get from localStorage first (where Profile.js saves it)
      const savedProfile = localStorage.getItem('userProfileData');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        console.log('Found profile in localStorage:', profileData);
        return this.extractProfileData(profileData);
      }

      // Fallback to default profile structure
      return {
        skills: ['React', 'JavaScript', 'Python', 'Node.js'],
        major: 'Computer Science',
        university: 'National University of Singapore',
        location: 'Singapore',
        experience: [],
        education: [],
        bio: '',
        year: 'Year 3'
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Preprocess text for TF-IDF calculation
   */
  preprocessText(text) {
    if (!text) return [];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
  }

  /**
   * Simple stop words filter
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall'
    ]);
    return stopWords.has(word);
  }

  /**
   * Build vocabulary from user and internship texts
   */
  buildVocabulary(userProfile, internships) {
    this.vocabulary.clear();
    
    // Add user profile terms
    const userTerms = [
      ...userProfile.skills.map(s => s.toLowerCase()),
      ...this.preprocessText(userProfile.major),
      ...this.preprocessText(userProfile.bio),
      ...userProfile.experience.flatMap(exp => this.preprocessText(`${exp.title} ${exp.description || ''}`))
    ];
    
    userTerms.forEach(term => this.vocabulary.add(term));
    
    // Add internship terms
    internships.forEach(internship => {
      const internshipTerms = [
        ...internship.skills?.map(s => s.toLowerCase()) || [],
        ...this.preprocessText(internship.title),
        ...this.preprocessText(internship.description),
        ...this.preprocessText(internship.category),
        ...internship.requirements?.flatMap(req => this.preprocessText(req)) || []
      ];
      
      internshipTerms.forEach(term => this.vocabulary.add(term));
    });
  }

  /**
   * Calculate Term Frequency (TF)
   */
  calculateTF(terms, term) {
    const termCount = terms.filter(t => t === term).length;
    return termCount / Math.max(terms.length, 1);
  }

  /**
   * Calculate Inverse Document Frequency (IDF)
   */
  calculateIDF(term, allDocuments) {
    const documentsWithTerm = allDocuments.filter(doc => 
      doc.includes(term)
    ).length;
    
    if (documentsWithTerm === 0) return 0;
    
    return Math.log(allDocuments.length / documentsWithTerm);
  }

  /**
   * Calculate TF-IDF vector for a document
   */
  calculateTFIDF(terms, allDocuments) {
    const vocabularyArray = Array.from(this.vocabulary);
    const vector = vocabularyArray.map(term => {
      const tf = this.calculateTF(terms, term);
      const idf = this.calculateIDF(term, allDocuments);
      return tf * idf;
    });
    
    return vector;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  calculateCosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) return 0;
    
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Calculate TF-IDF Content Similarity (20% weight)
   */
  calculateContentSimilarity(userProfile, internship, allInternships) {
    try {
      // Extract terms from user profile
      const userTerms = [
        ...userProfile.skills.map(s => s.toLowerCase()),
        ...this.preprocessText(userProfile.major),
        ...this.preprocessText(userProfile.bio),
        ...userProfile.experience.flatMap(exp => this.preprocessText(`${exp.title} ${exp.description || ''}`))
      ];

      // Extract terms from internship
      const internshipTerms = [
        ...internship.skills?.map(s => s.toLowerCase()) || [],
        ...this.preprocessText(internship.title),
        ...this.preprocessText(internship.description),
        ...this.preprocessText(internship.category),
        ...internship.requirements?.flatMap(req => this.preprocessText(req)) || []
      ];

      // Create all documents for IDF calculation
      const allDocuments = [
        userTerms,
        ...allInternships.map(intern => [
          ...intern.skills?.map(s => s.toLowerCase()) || [],
          ...this.preprocessText(intern.title),
          ...this.preprocessText(intern.description)
        ])
      ];

      // Calculate TF-IDF vectors
      const userVector = this.calculateTFIDF(userTerms, allDocuments);
      const internshipVector = this.calculateTFIDF(internshipTerms, allDocuments);

      // Calculate cosine similarity
      return this.calculateCosineSimilarity(userVector, internshipVector);
    } catch (error) {
      console.error('Error calculating content similarity:', error);
      return 0;
    }
  }

  /**
   * Calculate Skill Match (40% weight) - as per readme specification
   */
  calculateSkillMatch(userSkills, internshipSkills) {
    if (!userSkills?.length || !internshipSkills?.length) return 0;

    // Skill synonyms for better matching
    const skillSynonyms = {
      'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
      'python': ['django', 'flask', 'machine learning', 'data science', 'ai'],
      'java': ['spring', 'android', 'backend'],
      'react': ['frontend', 'ui', 'javascript'],
      'machine learning': ['ml', 'ai', 'data science', 'python'],
      'web development': ['html', 'css', 'javascript', 'frontend'],
      'data analysis': ['sql', 'python', 'statistics', 'excel'],
      'mobile development': ['android', 'ios', 'react native', 'flutter']
    };

    let totalPoints = 0;
    const totalInternshipSkills = internshipSkills.length;

    internshipSkills.forEach(internshipSkill => {
      const skillLower = internshipSkill.toLowerCase();
      let skillMatched = false;

      // Direct match: +1.0 points (100% credit)
      if (userSkills.some(userSkill => userSkill.toLowerCase() === skillLower)) {
        totalPoints += 1.0;
        skillMatched = true;
      }

      // Synonym match: +0.8 points (80% credit)
      if (!skillMatched) {
        for (const [mainSkill, synonyms] of Object.entries(skillSynonyms)) {
          if (skillLower === mainSkill || synonyms.includes(skillLower)) {
            const hasMainSkill = userSkills.some(userSkill => 
              userSkill.toLowerCase() === mainSkill || 
              synonyms.includes(userSkill.toLowerCase())
            );
            if (hasMainSkill) {
              totalPoints += 0.8;
              skillMatched = true;
              break;
            }
          }
        }
      }

      // Partial match: +0.5 points (50% credit)
      if (!skillMatched) {
        userSkills.forEach(userSkill => {
          if (userSkill.toLowerCase().includes(skillLower) || 
              skillLower.includes(userSkill.toLowerCase())) {
            totalPoints += 0.5;
            skillMatched = true;
          }
        });
      }
      // else: +0.0 points (no credit)
    });

    // Final Score = Total Points / Number of Internship Skills
    return totalPoints / totalInternshipSkills;
  }

  /**
   * Calculate Experience Relevance (25% weight)
   */
  calculateExperienceRelevance(userProfile, internship) {
    if (!userProfile.experience || userProfile.experience.length === 0) {
      // For students with no experience, check if internship is beginner-friendly
      const requirements = internship.requirements?.join(' ').toLowerCase() || '';
      const description = internship.description?.toLowerCase() || '';
      
      const beginnerKeywords = ['student', 'entry', 'beginner', 'no experience', 'fresh', 'graduate'];
      const isBeginnerFriendly = beginnerKeywords.some(keyword => 
        requirements.includes(keyword) || description.includes(keyword)
      );
      
      return isBeginnerFriendly ? 0.8 : 0.4;
    }

    let relevanceScore = 0;
    
    userProfile.experience.forEach(exp => {
      // Common words between user experience and internship listing
      const expWords = this.preprocessText(`${exp.title} ${exp.description || ''}`);
      const internshipWords = this.preprocessText(`${internship.title} ${internship.description} ${internship.requirements?.join(' ') || ''}`);
      
      // Find common words
      const commonWords = expWords.filter(word => internshipWords.includes(word));
      
      // Calculate similarity percentage
      const similarity = commonWords.length / Math.max(internshipWords.length, 1);
      relevanceScore += similarity;
    });

    // Average score across all experiences, capped at 100%
    return Math.min(relevanceScore / userProfile.experience.length, 1);
  }

  /**
   * Calculate Education Relevance (15% weight) - corrected from readme
   */
  calculateEducationRelevance(userProfile, internship) {
    if (!userProfile.major && (!userProfile.education || userProfile.education.length === 0)) {
      return 0.5; // Neutral score if no education info
    }

    let relevanceScore = 0;
    const major = userProfile.major?.toLowerCase() || '';
    const internshipReqs = internship.requirements?.join(' ').toLowerCase() || '';
    const internshipDesc = internship.description?.toLowerCase() || '';

    // Education field mappings
    const educationFields = {
      'computer science': ['software', 'programming', 'technology', 'it'],
      'business': ['marketing', 'management', 'finance', 'consulting'],
      'engineering': ['technical', 'development', 'systems'],
      'design': ['ui', 'ux', 'creative', 'visual'],
      'data science': ['analytics', 'machine learning', 'ai', 'statistics']
    };

    // Check if user's degree matches any field, then add matchCount to relevanceScore
    for (const [field, keywords] of Object.entries(educationFields)) {
      if (major.includes(field)) {
        const matchCount = keywords.filter(keyword => 
          internshipReqs.includes(keyword) || internshipDesc.includes(keyword)
        ).length;
        relevanceScore += matchCount / keywords.length;
      }
    }

    return Math.min(relevanceScore, 1);
  }

  /**
   * Calculate Location Score (10% weight)
   */
  calculateLocationScore(userProfile, internship) {
    if (!userProfile.location || !internship.location) return 0.5;

    const userLocation = userProfile.location.toLowerCase();
    const internshipLocation = internship.location.toLowerCase();

    // Same location scores 100%
    if (userLocation === internshipLocation) return 1.0;

    // Same city/region scores 90%
    if (userLocation.includes('singapore') && internshipLocation.includes('singapore')) {
      return 0.9;
    }

    // Remote work preference scores 100% since work can be done anywhere
    if (internshipLocation.includes('remote')) {
      return 1.0;
    }

    // Different location scores 30%
    return 0.3;
  }

  /**
   * Calculate Category Score (10% weight)
   */
  calculateCategoryScore(userProfile, internship) {
    // Default category preference logic
    const userPreferredCategories = userProfile.preferredCategories || [];
    
    // If user hasn't specified preferences, infer from major
    if (userPreferredCategories.length === 0) {
      const major = userProfile.major?.toLowerCase() || '';
      if (major.includes('computer science') && internship.category === 'technology') {
        return 1.0; // Preferred category scores 100%
      }
      if (major.includes('business') && internship.category === 'business') {
        return 1.0;
      }
      if (major.includes('design') && internship.category === 'design') {
        return 1.0;
      }
      if (major.includes('data') && internship.category === 'data') {
        return 1.0;
      }
    } else {
      // Check if internship category is in user's preferred categories
      if (userPreferredCategories.includes(internship.category)) {
        return 1.0; // Preferred category scores 100%
      }
    }

    return 0.5; // Not preferred category scores 50%
  }

  /**
   * Calculate Experience Level Score (10% weight)
   */
  calculateExperienceLevelScore(userProfile, internship) {
    let experienceLevelScore = 0.7; // Default score is 70%

    const userLevel = userProfile.experienceLevel?.toLowerCase() || 'beginner';
    const requirements = internship.requirements?.join(' ').toLowerCase() || '';

    // If user level is beginner and internship requirements include "entry" or "student", perfect match = 100%
    if (userLevel === 'beginner' && 
        (requirements.includes('entry') || requirements.includes('student'))) {
      experienceLevelScore = 1.0;
    }
    // If user level is intermediate and internship requirements include "experience" but not "senior", perfect match = 100%
    else if (userLevel === 'intermediate' && 
             requirements.includes('experience') && !requirements.includes('senior')) {
      experienceLevelScore = 1.0;
    }

    return experienceLevelScore;
  }

  /**
   * Main matching function implementing the Master Formula from readme
   */
  calculateMatchScore(userProfile, internship, allInternships = []) {
    try {
      // Build vocabulary if not already built
      if (this.vocabulary.size === 0 && allInternships.length > 0) {
        this.buildVocabulary(userProfile, allInternships);
      }

      // Calculate all components as per the Master Formula
      const contentSimilarity = this.calculateContentSimilarity(userProfile, internship, allInternships);
      const skillMatch = this.calculateSkillMatch(userProfile.skills, internship.skills);
      const experienceRelevance = this.calculateExperienceRelevance(userProfile, internship);
      const educationRelevance = this.calculateEducationRelevance(userProfile, internship);
      const locationScore = this.calculateLocationScore(userProfile, internship);
      const categoryScore = this.calculateCategoryScore(userProfile, internship);
      const experienceLevelScore = this.calculateExperienceLevelScore(userProfile, internship);

      // Apply the Master Formula weights
      const totalScore = 
        (contentSimilarity * this.weights.contentSimilarity) +
        (skillMatch * this.weights.skillMatch) +
        (experienceRelevance * this.weights.experienceRelevance) +
        (educationRelevance * this.weights.educationRelevance) +
        (locationScore * this.weights.locationScore) +
        (categoryScore * this.weights.categoryScore) +
        (experienceLevelScore * this.weights.experienceLevelScore);

      // Convert to percentage and ensure it's between 0-100
      const finalScore = Math.min(Math.max(Math.round(totalScore * 100), 0), 100);

      return {
        totalScore: finalScore,
        breakdown: {
          contentSimilarity: Math.round(contentSimilarity * 100),
          skillMatch: Math.round(skillMatch * 100),
          experienceRelevance: Math.round(experienceRelevance * 100),
          educationRelevance: Math.round(educationRelevance * 100),
          locationScore: Math.round(locationScore * 100),
          categoryScore: Math.round(categoryScore * 100),
          experienceLevelScore: Math.round(experienceLevelScore * 100)
        }
      };

    } catch (error) {
      console.error('Error calculating match score:', error);
      return { totalScore: 0, breakdown: {} };
    }
  }

  /**
   * Get personalised recommendations using the updated algorithm
   */
  async getPersonalisedRecommendations(options = {}) {
    const { limit = 10, minMatchScore = 30 } = options;

    try {
      // Get user profile
      const userProfile = this.getUserProfile();
      if (!userProfile) {
        throw new Error('No user profile found');
      }

      console.log('Using profile for matching:', userProfile);

      // Get all internships
      const internshipsResponse = await DataService.getAllInternships();
      if (!internshipsResponse.success) {
        throw new Error('Failed to fetch internships');
      }

      const allInternships = internshipsResponse.data;

      // Build vocabulary for TF-IDF
      this.buildVocabulary(userProfile, allInternships);

      // Calculate match scores using the Master Formula
      const scoredInternships = allInternships.map(internship => {
        const matchResult = this.calculateMatchScore(userProfile, internship, allInternships);
        return {
          ...internship,
          match: matchResult.totalScore,
          matchBreakdown: matchResult.breakdown
        };
      });

      // Filter and sort
      const filteredInternships = scoredInternships
        .filter(internship => internship.match >= minMatchScore)
        .sort((a, b) => b.match - a.match)
        .slice(0, limit);

      console.log('Generated recommendations using Master Formula:', filteredInternships.map(i => ({
        title: i.title,
        company: i.company,
        match: i.match,
        breakdown: i.matchBreakdown
      })));

      return {
        success: true,
        data: filteredInternships,
        metadata: {
          algorithm: 'TF-IDF + Cosine Similarity + Multi-factor Scoring (Master Formula)',
          weights: this.weights,
          userProfile: userProfile,
          totalEvaluated: allInternships.length,
          filtered: filteredInternships.length,
          vocabularySize: this.vocabulary.size
        }
      };

    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Explain why an internship was recommended
   */
  explainRecommendation(userProfile, internship) {
    const matchResult = this.calculateMatchScore(userProfile, internship);
    const breakdown = matchResult.breakdown;
    const explanations = [];

    if (breakdown.skillMatch > 70) {
      explanations.push(`🎯 Strong skill match (${breakdown.skillMatch}%) - Your skills align well with requirements`);
    } else if (breakdown.skillMatch > 40) {
      explanations.push(`✅ Good skill overlap (${breakdown.skillMatch}%)`);
    }

    if (breakdown.contentSimilarity > 60) {
      explanations.push(`📄 High content similarity (${breakdown.contentSimilarity}%) - Your profile closely matches this role`);
    }

    if (breakdown.experienceRelevance > 60) {
      explanations.push(`💼 Your experience is relevant (${breakdown.experienceRelevance}%)`);
    }

    if (breakdown.educationRelevance > 70) {
      explanations.push(`🎓 Perfect field match (${breakdown.educationRelevance}%) - Your ${userProfile.major} major is highly relevant`);
    }

    if (breakdown.locationScore > 80) {
      explanations.push(`📍 Great location match (${breakdown.locationScore}%)`);
    }

    if (breakdown.categoryScore > 80) {
      explanations.push(`📂 Matches your preferred category (${breakdown.categoryScore}%)`);
    }

    if (breakdown.experienceLevelScore > 80) {
      explanations.push(`⭐ Perfect experience level match (${breakdown.experienceLevelScore}%)`);
    }

    if (explanations.length === 0) {
      explanations.push('📈 This internship could help you develop new skills and experience');
    }

    return {
      score: matchResult.totalScore,
      breakdown: breakdown,
      explanations: explanations,
      recommendation: matchResult.totalScore > 75 ? 'Highly Recommended' :
                     matchResult.totalScore > 55 ? 'Good Match' :
                     matchResult.totalScore > 35 ? 'Worth Considering' : 'Limited Match'
    };
  }

  /**
   * Record user feedback to improve matching
   */
  recordFeedback(feedback) {
    const feedbackEntry = {
      ...feedback,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    this.userFeedback.push(feedbackEntry);
    console.log('Recorded feedback:', feedbackEntry);

    // Simple weight adjustment based on feedback
    if (feedback.type === 'applied' && feedback.match > 70) {
      // User applied to high-match - increase skill matching importance
      this.weights.skillMatch = Math.min(this.weights.skillMatch + 0.01, 0.45);
    }

    if (feedback.type === 'bookmarked' && feedback.category) {
      // User bookmarked - indicates category interest
      this.weights.categoryScore = Math.min(this.weights.categoryScore + 0.005, 0.15);
    }

    return feedbackEntry;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const feedbackByType = this.userFeedback.reduce((acc, feedback) => {
      acc[feedback.type] = (acc[feedback.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalFeedback: this.userFeedback.length,
      feedbackBreakdown: feedbackByType,
      currentWeights: this.weights,
      vocabularySize: this.vocabulary.size,
      lastUpdated: new Date().toISOString(),
      algorithm: 'Master Formula: TF-IDF + Multi-factor Scoring'
    };
  }
}

export default ProfileBasedMatchingService;

// ms2 final