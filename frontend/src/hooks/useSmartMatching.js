import { useState, useCallback } from 'react';
import EnhancedMatchingService from '../services/matchingIntegration';

let matchingServiceInstance = null;

export function useSmartMatching() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!matchingServiceInstance) {
    matchingServiceInstance = new EnhancedMatchingService();
  }

  const getRecommendations = useCallback(async (userProfile, options) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await matchingServiceInstance.getPersonalizedRecommendations(userProfile, options);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const explainRecommendation = useCallback((userProfile, internship) => {
    return matchingServiceInstance.explainRecommendation(userProfile, internship);
  }, []);

  const recordFeedback = useCallback((feedback) => {
    return matchingServiceInstance.recordUserFeedback(feedback);
  }, []);

  const getMetrics = useCallback(() => {
    return matchingServiceInstance.getPerformanceMetrics();
  }, []);

  return {
    getRecommendations,
    explainRecommendation,
    recordFeedback,
    getMetrics,
    isLoading,
    error
  };
}

//ms2 final