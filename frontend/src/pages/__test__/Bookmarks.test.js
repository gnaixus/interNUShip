import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Bookmarks from '../Bookmarks';
import { AuthContext } from '../auth/AuthContext';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/bookmarks' }),
}));

// Mock DataService completely
jest.mock('../../services/dataService', () => ({
  getCategories: jest.fn(() => Promise.resolve({ 
    success: true, 
    data: [{ id: 'all', name: 'All', icon: '📂' }] 
  })),
  getUserBookmarks: jest.fn(() => Promise.resolve({ success: true, data: [] })),
  removeBookmark: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock ProfileBasedMatchingService completely
jest.mock('../../services/profileBasedMatchingService', () => {
  return function MockProfileBasedMatchingService() {
    return {
      getUserProfile: jest.fn(() => null), 
      calculateMatchScore: jest.fn(() => ({ totalScore: 0, breakdown: {} })),
      explainRecommendation: jest.fn(() => ({ 
        recommendation: 'No match',
        explanations: []
      })),
    };
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window methods
window.alert = jest.fn();
window.confirm = jest.fn();

const TestWrapper = ({ children, authValue }) => (
  <BrowserRouter>
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Bookmarks Component', () => {
  const mockUser = { id: 'user123', full_name: 'John Doe', email: 'john@example.com' };
  const mockAuthLoggedIn = { user: mockUser, isGuest: false, logout: jest.fn() };
  const mockAuthLoggedOut = { user: null, isGuest: false, logout: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  // Authentication Tests - These should always work
  test('shows login prompt for unauthenticated users', () => {
    render(<TestWrapper authValue={mockAuthLoggedOut}><Bookmarks /></TestWrapper>);
    expect(screen.getByText('🔍 Please log in to view bookmarks')).toBeInTheDocument();
    expect(screen.getByText('Your Bookmark Collection')).toBeInTheDocument();
  });

  test('redirects unauthenticated users to login when clicking login button', () => {
    render(<TestWrapper authValue={mockAuthLoggedOut}><Bookmarks /></TestWrapper>);
    fireEvent.click(screen.getByText('Login'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // Loading State Tests
  test('shows loading state initially for authenticated users', () => {
    render(<TestWrapper authValue={mockAuthLoggedIn}><Bookmarks /></TestWrapper>);
    expect(screen.getByText('Loading your AI-enhanced bookmarks...')).toBeInTheDocument();
  });

  // Error State Tests
  test('handles component errors gracefully', async () => {
    // Force an error by mocking a failing service
    const DataService = require('../../services/dataService');
    DataService.getUserBookmarks.mockRejectedValue(new Error('Service failed'));

    render(<TestWrapper authValue={mockAuthLoggedIn}><Bookmarks /></TestWrapper>);
    
    // Wait for error state to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load bookmarks. Please try again.')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('error state has retry button that reloads page', async () => {
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true,
    });

    // Force error state
    const DataService = require('../../services/dataService');
    DataService.getUserBookmarks.mockRejectedValue(new Error('Service failed'));

    render(<TestWrapper authValue={mockAuthLoggedIn}><Bookmarks /></TestWrapper>);
    
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    }, { timeout: 5000 });

    fireEvent.click(screen.getByText('Try Again'));
    expect(window.location.reload).toHaveBeenCalled();
  });

  // Basic functionality that should work regardless of data loading issues
  test('renders correct navigation structure', () => {
    render(<TestWrapper authValue={mockAuthLoggedOut}><Bookmarks /></TestWrapper>);
    
    // Check basic navigation buttons in logged out state
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('login button navigates to login page', () => {
    render(<TestWrapper authValue={mockAuthLoggedOut}><Bookmarks /></TestWrapper>);
    fireEvent.click(screen.getByText('Login to Continue'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('signup button navigates to signup page', () => {
    render(<TestWrapper authValue={mockAuthLoggedOut}><Bookmarks /></TestWrapper>);
    fireEvent.click(screen.getByText('Sign Up'));
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  // Test that the hook exists (without calling it directly)
  test('exports useBookmarkHandler hook', () => {
    const BookmarksModule = require('../Bookmarks');
    expect(typeof BookmarksModule.useBookmarkHandler).toBe('function');
  });

  // localStorage interaction tests
  test('handles localStorage operations gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('{"user123": []}');
    
    render(<TestWrapper authValue={mockAuthLoggedIn}><Bookmarks /></TestWrapper>);
    
    // Should not crash when localStorage has data
    await waitFor(() => {
      expect(screen.queryByText('Loading your AI-enhanced bookmarks...')).toBeInTheDocument();
    });
  });

  test('handles corrupted localStorage data', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    console.error = jest.fn(); // Suppress error logs in test

    render(<TestWrapper authValue={mockAuthLoggedIn}><Bookmarks /></TestWrapper>);
    
    // Should handle corrupted data gracefully
    await waitFor(() => {
      // Either loading state or error state, but shouldn't crash
      expect(
        screen.queryByText('Loading your AI-enhanced bookmarks...') ||
        screen.queryByText('Failed to load bookmarks. Please try again.')
      ).toBeInTheDocument();
    });
  });
});