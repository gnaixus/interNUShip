import { useState, useCallback } from 'react';
import EnhancedMatchingService from '../services/matchingIntegration';

let matchingServiceInstance = null;

export function useSmartMatching() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Singleton pattern to ensure one instance
  if (!matchingServiceInstance) {
    matchingServiceInstance = new EnhancedMatchingService();
  }

  const getRecommendations = useCallback(async (userProfile, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await matchingServiceInstance.getPersonalizedRecommendations(userProfile, options);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get recommendations');
      }
      
      return result;
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const explainRecommendation = useCallback((userProfile, internship) => {
    try {
      return matchingServiceInstance.explainRecommendation(userProfile, internship);
    } catch (err) {
      console.error('Error explaining recommendation:', err);
      setError(err.message);
      return { explanation: 'Unable to explain recommendation', confidence: 0 };
    }
  }, []);

  const recordFeedback = useCallback((feedback) => {
    try {
      return matchingServiceInstance.recordUserFeedback(feedback);
    } catch (err) {
      console.error('Error recording feedback:', err);
      setError(err.message);
      return false;
    }
  }, []);

  const getMetrics = useCallback(() => {
    try {
      return matchingServiceInstance.getPerformanceMetrics();
    } catch (err) {
      console.error('Error getting metrics:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    getRecommendations,
    explainRecommendation,
    recordFeedback,
    getMetrics,
    clearError,
    isLoading,
    error
  };
}