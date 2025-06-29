class SmartMatchingAlgorithm {
  constructor() {
    this.vocabulary = new Set();
    this.documents = [];
    this.tfidfMatrix = null;
    this.internshipVectors = new Map();
    this.weights = {
      skills: 0.40,
      experience: 0.25,
      education: 0.15,
      location: 0.10,
      preferences: 0.10
    };
  }

  /**
   * Preprocess text by cleaning and tokenizing
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
   * Extract features from internship listing
   */
  extractInternshipFeatures(internship) {
    const features = [];
    
    // Skills (highest weight)
    if (internship.skills) {
      features.push(...internship.skills.map(skill => skill.toLowerCase()));
    }
    
    // Job title and description
    features.push(...this.preprocessText(internship.title));
    features.push(...this.preprocessText(internship.description));
    
    // Requirements
    if (internship.requirements) {
      internship.requirements.forEach(req => {
        features.push(...this.preprocessText(req));
      });
    }
    
    // Company and industry
    features.push(...this.preprocessText(internship.company));
    features.push(...this.preprocessText(internship.industry));
    
    // Location and category
    features.push(internship.location?.toLowerCase());
    features.push(internship.category?.toLowerCase());
    
    return features.filter(Boolean);
  }

  /**
   * Extract features from user profile
   */
  extractUserFeatures(userProfile) {
    const features = [];
    
    // User skills (primary matching factor)
    if (userProfile.skills) {
      features.push(...userProfile.skills.map(skill => skill.toLowerCase()));
    }
    
    // Education and major
    if (userProfile.education) {
      userProfile.education.forEach(edu => {
        features.push(...this.preprocessText(edu.degree));
        features.push(...this.preprocessText(edu.institution));
      });
    }
    
    // Experience
    if (userProfile.experience) {
      userProfile.experience.forEach(exp => {
        features.push(...this.preprocessText(exp.title));
        features.push(...this.preprocessText(exp.description));
      });
    }
    
    // Preferred categories and location
    if (userProfile.preferredCategories) {
      features.push(...userProfile.preferredCategories.map(cat => cat.toLowerCase()));
    }
    
    if (userProfile.location) {
      features.push(userProfile.location.toLowerCase());
    }
    
    // Career interests
    if (userProfile.interests) {
      features.push(...userProfile.interests.map(interest => interest.toLowerCase()));
    }
    
    return features.filter(Boolean);
  }

  /**
   * Build vocabulary from all documents
   */
  buildVocabulary(internships, userProfiles = []) {
    this.vocabulary.clear();
    this.documents = [];
    
    // Add internship documents
    internships.forEach((internship, index) => {
      const features = this.extractInternshipFeatures(internship);
      this.documents.push({
        id: `internship_${internship.id}`,
        type: 'internship',
        features: features,
        data: internship
      });
      
      features.forEach(feature => this.vocabulary.add(feature));
    });
    
    // Add user profile documents
    userProfiles.forEach((profile, index) => {
      const features = this.extractUserFeatures(profile);
      this.documents.push({
        id: `user_${profile.id || index}`,
        type: 'user',
        features: features,
        data: profile
      });
      
      features.forEach(feature => this.vocabulary.add(feature));
    });
    
    console.log(`Built vocabulary with ${this.vocabulary.size} unique terms`);
  }

  /**
   * Calculate Term Frequency (TF)
   */
  calculateTF(features, term) {
    const termCount = features.filter(feature => feature === term).length;
    return termCount / Math.max(features.length, 1);
  }

  /**
   * Calculate Inverse Document Frequency (IDF)
   */
  calculateIDF(term) {
    const documentsWithTerm = this.documents.filter(doc => 
      doc.features.includes(term)
    ).length;
    
    if (documentsWithTerm === 0) return 0;
    
    return Math.log(this.documents.length / documentsWithTerm);
  }

  /**
   * Calculate TF-IDF vector for a document
   */
  calculateTFIDF(features) {
    const vocabularyArray = Array.from(this.vocabulary);
    const vector = vocabularyArray.map(term => {
      const tf = this.calculateTF(features, term);
      const idf = this.calculateIDF(term);
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
   * Advanced skill matching with synonyms and levels
   */
  calculateSkillSimilarity(userSkills, internshipSkills) {
    if (!userSkills || !internshipSkills) return 0;
    
    const skillSynonyms = {
      'javascript': ['js', 'ecmascript', 'node.js', 'nodejs'],
      'python': ['py', 'python3'],
      'machine learning': ['ml', 'ai', 'artificial intelligence'],
      'react': ['reactjs', 'react.js'],
      'sql': ['mysql', 'postgresql', 'database'],
      'ui/ux': ['user interface', 'user experience', 'design'],
      'html': ['html5', 'markup'],
      'css': ['css3', 'styling', 'sass', 'scss']
    };
    
    let matches = 0;
    let totalInternshipSkills = internshipSkills.length;
    
    internshipSkills.forEach(internshipSkill => {
      const internshipLower = internshipSkill.toLowerCase();
      let found = false;
      
      // Direct match
      if (userSkills.some(userSkill => 
        userSkill.toLowerCase() === internshipLower
      )) {
        matches++;
        found = true;
      }
      
      // Synonym match
      if (!found) {
        for (const [key, synonyms] of Object.entries(skillSynonyms)) {
          if ((key === internshipLower || synonyms.includes(internshipLower)) &&
              userSkills.some(userSkill => 
                userSkill.toLowerCase() === key || 
                synonyms.includes(userSkill.toLowerCase())
              )) {
            matches += 0.8; // Slightly lower score for synonym matches
            found = true;
            break;
          }
        }
      }
      
      // Partial match
      if (!found) {
        userSkills.forEach(userSkill => {
          if (userSkill.toLowerCase().includes(internshipLower) || 
              internshipLower.includes(userSkill.toLowerCase())) {
            matches += 0.5; // Lower score for partial matches
            found = true;
          }
        });
      }
    });
    
    return matches / Math.max(totalInternshipSkills, 1);
  }

  /**
   * Calculate experience relevance
   */
  calculateExperienceRelevance(userProfile, internship) {
    if (!userProfile.experience || userProfile.experience.length === 0) {
      // New graduates or no experience - check if internship is beginner-friendly
      const beginnerFriendly = internship.requirements?.some(req =>
        req.toLowerCase().includes('entry') ||
        req.toLowerCase().includes('beginner') ||
        req.toLowerCase().includes('student') ||
        req.toLowerCase().includes('no experience')
      );
      return beginnerFriendly ? 0.8 : 0.4;
    }
    
    let relevanceScore = 0;
    const totalExperience = userProfile.experience.length;
    
    userProfile.experience.forEach(exp => {
      // Check if experience title/description matches internship requirements
      const expText = `${exp.title} ${exp.description}`.toLowerCase();
      const internshipText = `${internship.title} ${internship.description}`.toLowerCase();
      
      // Calculate text similarity
      const expWords = this.preprocessText(expText);
      const internshipWords = this.preprocessText(internshipText);
      
      const commonWords = expWords.filter(word => internshipWords.includes(word));
      const similarity = commonWords.length / Math.max(internshipWords.length, 1);
      
      relevanceScore += similarity;
    });
    
    return Math.min(relevanceScore / totalExperience, 1);
  }

  /**
   * Calculate education relevance
   */
  calculateEducationRelevance(userProfile, internship) {
    if (!userProfile.education || userProfile.education.length === 0) {
      return 0.5; // Neutral score if no education info
    }
    
    let relevanceScore = 0;
    
    userProfile.education.forEach(edu => {
      const degree = edu.degree?.toLowerCase() || '';
      const major = edu.major?.toLowerCase() || '';
      const internshipReqs = internship.requirements?.join(' ').toLowerCase() || '';
      const internshipDesc = internship.description?.toLowerCase() || '';
      
      // Check for direct field matches
      const educationFields = {
        'computer science': ['software', 'programming', 'technology', 'it'],
        'business': ['marketing', 'management', 'finance', 'consulting'],
        'engineering': ['technical', 'development', 'systems'],
        'design': ['ui', 'ux', 'creative', 'visual'],
        'data science': ['analytics', 'machine learning', 'ai', 'statistics']
      };
      
      for (const [field, keywords] of Object.entries(educationFields)) {
        if (degree.includes(field) || major.includes(field)) {
          const matchCount = keywords.filter(keyword => 
            internshipReqs.includes(keyword) || internshipDesc.includes(keyword)
          ).length;
          relevanceScore += matchCount / keywords.length;
        }
      }
    });
    
    return Math.min(relevanceScore, 1);
  }

  /**
   * Calculate location preference score
   */
  calculateLocationScore(userProfile, internship) {
    if (!userProfile.location || !internship.location) return 0.5;
    
    const userLocation = userProfile.location.toLowerCase();
    const internshipLocation = internship.location.toLowerCase();
    
    // Exact match
    if (userLocation === internshipLocation) return 1.0;
    
    // Same city/region (basic implementation)
    if (userLocation.includes('singapore') && internshipLocation.includes('singapore')) {
      return 0.9;
    }
    
    // Remote work preference
    if (internshipLocation.includes('remote') && userProfile.preferences?.remote) {
      return 1.0;
    }
    
    return 0.3; // Different location penalty
  }

  /**
   * Main matching function - calculates comprehensive match score
   */
  calculateMatchScore(userProfile, internship) {
    try {
      // 1. TF-IDF based content similarity
      const userFeatures = this.extractUserFeatures(userProfile);
      const internshipFeatures = this.extractInternshipFeatures(internship);
      
      const userVector = this.calculateTFIDF(userFeatures);
      const internshipVector = this.calculateTFIDF(internshipFeatures);
      
      const contentSimilarity = this.calculateCosineSimilarity(userVector, internshipVector);
      
      // 2. Skill-specific matching
      const skillSimilarity = this.calculateSkillSimilarity(
        userProfile.skills, 
        internship.skills
      );
      
      // 3. Experience relevance
      const experienceRelevance = this.calculateExperienceRelevance(userProfile, internship);
      
      // 4. Education relevance
      const educationRelevance = this.calculateEducationRelevance(userProfile, internship);
      
      // 5. Location preference
      const locationScore = this.calculateLocationScore(userProfile, internship);
      
      // 6. Category preference
      let categoryScore = 0.5;
      if (userProfile.preferredCategories?.includes(internship.category)) {
        categoryScore = 1.0;
      }
      
      // 7. Experience level matching
      let experienceLevelScore = 0.7;
      if (userProfile.experienceLevel) {
        const level = userProfile.experienceLevel.toLowerCase();
        const requirements = internship.requirements?.join(' ').toLowerCase() || '';
        
        if (level === 'beginner' && 
            (requirements.includes('entry') || requirements.includes('student'))) {
          experienceLevelScore = 1.0;
        } else if (level === 'intermediate' && 
                   (requirements.includes('experience') && !requirements.includes('senior'))) {
          experienceLevelScore = 1.0;
        }
      }
      
      // Weighted combination of all factors
      const totalScore = 
        (contentSimilarity * 0.20) +
        (skillSimilarity * this.weights.skills) +
        (experienceRelevance * this.weights.experience) +
        (educationRelevance * this.weights.education) +
        (locationScore * this.weights.location) +
        (categoryScore * this.weights.preferences) +
        (experienceLevelScore * 0.10);
      
      // Convert to percentage and ensure it's between 0-100
      const finalScore = Math.min(Math.max(Math.round(totalScore * 100), 0), 100);
      
      return {
        totalScore: finalScore,
        breakdown: {
          contentSimilarity: Math.round(contentSimilarity * 100),
          skillMatch: Math.round(skillSimilarity * 100),
          experienceRelevance: Math.round(experienceRelevance * 100),
          educationRelevance: Math.round(educationRelevance * 100),
          locationScore: Math.round(locationScore * 100),
          categoryScore: Math.round(categoryScore * 100),
          experienceLevelScore: Math.round(experienceLevelScore * 100)
        }
      };
      
    } catch (error) {
      console.error('Error calculating match score:', error);
      return {
        totalScore: 0,
        breakdown: {},
        error: error.message
      };
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  getRecommendations(userProfile, internships, limit = 10) {
    // Build vocabulary with current data
    this.buildVocabulary(internships, [userProfile]);
    
    // Calculate match scores for all internships
    const scoredInternships = internships.map(internship => {
      const matchResult = this.calculateMatchScore(userProfile, internship);
      return {
        ...internship,
        match: matchResult.totalScore,
        matchBreakdown: matchResult.breakdown
      };
    });
    
    // Sort by match score and return top results
    const recommendations = scoredInternships
      .sort((a, b) => b.match - a.match)
      .slice(0, limit);
    
    return {
      recommendations,
      algorithm: 'TF-IDF + Cosine Similarity + Multi-factor Scoring',
      weights: this.weights,
      totalEvaluated: internships.length,
      userProfile: {
        skillsCount: userProfile.skills?.length || 0,
        experienceCount: userProfile.experience?.length || 0,
        educationCount: userProfile.education?.length || 0
      }
    };
  }

  /**
   * Explain why an internship was recommended
   */
  explainRecommendation(userProfile, internship) {
    const matchResult = this.calculateMatchScore(userProfile, internship);
    const breakdown = matchResult.breakdown;
    
    const explanations = [];
    
    if (breakdown.skillMatch > 70) {
      explanations.push(`Strong skill match (${breakdown.skillMatch}%) - your skills align well with requirements`);
    }
    
    if (breakdown.experienceRelevance > 60) {
      explanations.push(`Relevant experience (${breakdown.experienceRelevance}%) - your background fits this role`);
    }
    
    if (breakdown.locationScore > 80) {
      explanations.push(`Perfect location match (${breakdown.locationScore}%)`);
    }
    
    if (breakdown.categoryScore > 80) {
      explanations.push(`Matches your preferred category (${breakdown.categoryScore}%)`);
    }
    
    if (breakdown.educationRelevance > 70) {
      explanations.push(`Educational background aligns (${breakdown.educationRelevance}%)`);
    }
    
    return {
      score: matchResult.totalScore,
      breakdown: breakdown,
      explanations: explanations,
      recommendation: matchResult.totalScore > 70 ? 'Highly Recommended' :
                     matchResult.totalScore > 50 ? 'Good Match' :
                     matchResult.totalScore > 30 ? 'Consider' : 'Not Recommended'
    };
  }

  /**
   * Update algorithm weights based on user feedback
   */
  updateWeights(feedback) {
    // This would implement machine learning to improve recommendations
    // Based on user actions: apply, bookmark, skip, etc.
    console.log('Updating algorithm weights based on feedback:', feedback);
    
    // Simple implementation - could be enhanced with actual ML
    if (feedback.type === 'applied' && feedback.match > 80) {
      // User applied to high-match internship - good sign
      this.weights.skills = Math.min(this.weights.skills + 0.01, 0.5);
    }
    
    if (feedback.type === 'skipped' && feedback.location_mismatch) {
      // User skipped due to location - increase location weight
      this.weights.location = Math.min(this.weights.location + 0.01, 0.2);
    }
  }
}

// Export the algorithm class
export default SmartMatchingAlgorithm;

// Utility function to create a new matcher instance
export function createSmartMatcher() {
  return new SmartMatchingAlgorithm();
}