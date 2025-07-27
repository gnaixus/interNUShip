import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Applications from '../Applications';
import { AuthContext } from '../auth/AuthContext';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/applications' }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window methods
window.alert = jest.fn();
window.confirm = jest.fn();
window.prompt = jest.fn();

// Test wrapper
const TestWrapper = ({ children, authValue }) => (
  <BrowserRouter>
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Applications Component', () => {
  const mockUser = { id: 'user123', full_name: 'John Doe', email: 'john@example.com' };
  const mockAuthLoggedIn = { user: mockUser, isGuest: false, logout: jest.fn() };
  const mockAuthLoggedOut = { user: null, isGuest: false, logout: jest.fn() };

  const sampleApplication = {
    id: 1,
    status: 'pending',
    submittedAt: '2025-07-15T10:30:00Z',
    internship: {
      title: 'Software Engineering Intern',
      company: 'Tech Corp Singapore',
      location: 'Singapore',
      deadline: '31/08/2025',
    },
    notes: 'Applied through university portal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  // Authentication Tests
  test('redirects unauthenticated users to login', () => {
    render(<TestWrapper authValue={mockAuthLoggedOut}><Applications /></TestWrapper>);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows login prompt for unauthenticated users', () => {
    render(<TestWrapper authValue={mockAuthLoggedOut}><Applications /></TestWrapper>);
    expect(screen.getByText('🔍 Please log in to view applications')).toBeInTheDocument();
  });

  // Core Functionality Tests
  test('displays applications page for authenticated users', async () => {
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      expect(screen.getByText('Your Application Journey')).toBeInTheDocument();
    });
  });

  test('shows empty state when no applications exist', async () => {
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      expect(screen.getByText('No applications found')).toBeInTheDocument();
    });
  });

  test('displays applications when they exist', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([sampleApplication]));
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineering Intern')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp Singapore')).toBeInTheDocument();
    });
  });

  // Statistics Tests
  test('calculates statistics correctly', async () => {
    const multipleApplications = [
      { ...sampleApplication, id: 1, status: 'pending' },
      { ...sampleApplication, id: 2, status: 'interview' },
      { ...sampleApplication, id: 3, status: 'accepted' },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(multipleApplications));
    
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      expect(screen.getByText('Total Applied')).toBeInTheDocument();
      expect(screen.getByText('33%')).toBeInTheDocument(); // 1/3 = 33%
    });
  });

  // User Action Tests
  test('handles logout', async () => {
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Logout'));
    });
    expect(mockAuthLoggedIn.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles add test application', async () => {
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      fireEvent.click(screen.getByText('+ Add Test Application'));
    });
    expect(window.alert).toHaveBeenCalledWith('Test application added!');
  });

  test('handles edit notes', async () => {
    window.prompt.mockReturnValue('Updated notes');
    localStorageMock.getItem.mockReturnValue(JSON.stringify([sampleApplication]));
    
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Notes'));
    });
    expect(window.prompt).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Notes updated!');
  });

  // Filtering Tests
  test('filters applications by status', async () => {
    const apps = [
      { ...sampleApplication, id: 1, status: 'pending', internship: { ...sampleApplication.internship, title: 'Pending Job' } },
      { ...sampleApplication, id: 2, status: 'interview', internship: { ...sampleApplication.internship, title: 'Interview Job' } },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(apps));
    
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      expect(screen.getByText('Pending Job')).toBeInTheDocument();
      expect(screen.getByText('Interview Job')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Under Review'));
    await waitFor(() => {
      expect(screen.getByText('Pending Job')).toBeInTheDocument();
      expect(screen.queryByText('Interview Job')).not.toBeInTheDocument();
    });
  });

  // Navigation Tests
  test('navigates to internships page', async () => {
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Browse Internships'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/internships');
  });

  // Global Function Tests
  test('sets up global application handler', async () => {
    render(<TestWrapper authValue={mockAuthLoggedIn}><Applications /></TestWrapper>);
    await waitFor(() => {
      expect(window.addApplicationToTracker).toBeDefined();
    });
  });
});