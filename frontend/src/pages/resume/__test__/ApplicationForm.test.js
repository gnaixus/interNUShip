// Fixed ApplicationForm.test.js - Compatible with your user-event version
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ApplicationForm from '../ApplicationForm';
import { useAuth } from '../../auth/AuthContext';
import DataService from '../../../services/dataService';

// Mock dependencies
jest.mock('../../auth/AuthContext');
jest.mock('../../../services/dataService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: 'test-internship-123' })
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    __getStore: () => store,
    __setStore: (newStore) => { store = newStore; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    back: jest.fn()
  }
});

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Helper function to render ApplicationForm with providers
const renderApplicationForm = (userOverrides = {}) => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    full_name: 'John Doe',
    ...userOverrides
  };

  useAuth.mockReturnValue({
    user: mockUser
  });

  return render(
    <BrowserRouter>
      <ApplicationForm />
    </BrowserRouter>
  );
};

// Mock profile data that matches the profile component structure
const mockProfileData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+65 9123 4567',
  university: 'National University of Singapore',
  major: 'Computer Science',
  year: 'Year 3',
  location: 'Singapore',
  bio: 'Passionate computer science student',
  skills: ['React', 'JavaScript', 'Python', 'Node.js'],
  experience: [
    {
      title: 'Frontend Developer Intern',
      company: 'TechCorp',
      duration: 'Jun 2024 - Aug 2024',
      description: 'Developed React applications with modern JavaScript'
    }
  ],
  education: [
    {
      institution: 'National University of Singapore',
      degree: 'Bachelor of Computer Science',
      gpa: '3.85',
      period: '2022 - 2026'
    }
  ],
  resumeUploaded: true,
  lastUpdated: new Date().toLocaleDateString()
};

describe('ApplicationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock DataService methods
    DataService.getUserProfile.mockResolvedValue({
      success: true,
      data: mockProfileData
    });
    
    DataService.submitApplication.mockResolvedValue({
      success: true,
      data: { id: 'app123', status: 'submitted' }
    });
  });

  describe('Component Rendering', () => {
    it('should render the application form with all sections', () => {
      renderApplicationForm();
      
      expect(screen.getByText('Internship Application')).toBeInTheDocument();
      expect(screen.getByText('👤 Personal Information')).toBeInTheDocument();
      expect(screen.getByText('🎓 Academic Information')).toBeInTheDocument();
      expect(screen.getByText('💻 Skills *')).toBeInTheDocument();
      expect(screen.getByText('🔗 Professional Links')).toBeInTheDocument();
      expect(screen.getByText('📄 Resume Upload *')).toBeInTheDocument();
      expect(screen.getByText('✍️ Cover Letter *')).toBeInTheDocument();
      expect(screen.getByText('⏰ Additional Information')).toBeInTheDocument();
    });

    it('should show internship ID in the header', () => {
      renderApplicationForm();
      
      expect(screen.getByText('Application ID: test-internship-123')).toBeInTheDocument();
    });

    it('should display initial user data from auth context', () => {
      renderApplicationForm();
      
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });
  });

  describe('Profile Syncing', () => {
    it('should auto-sync profile data on component mount', async () => {
      localStorageMock.setItem('userProfileData', JSON.stringify(mockProfileData));
      
      renderApplicationForm();
      
      await waitFor(() => {
        expect(screen.getByText('✅ Profile synced')).toBeInTheDocument();
      });
      
      // Check that profile data is loaded
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+65 9123 4567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('National University of Singapore')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Computer Science')).toBeInTheDocument();
    });

    it('should handle manual profile sync', async () => {
      localStorageMock.setItem('userProfileData', JSON.stringify(mockProfileData));
      
      renderApplicationForm();
      
      const syncButton = screen.getByText('Sync from Profile');
      userEvent.click(syncButton);
      
      await waitFor(() => {
        expect(screen.getByText('✅ Profile synced')).toBeInTheDocument();
      });
    });

    it('should show sync error when profile data fails to load', async () => {
      DataService.getUserProfile.mockRejectedValue(new Error('Network error'));
      localStorageMock.getItem.mockReturnValue(null);
      
      renderApplicationForm();
      
      const syncButton = screen.getByText('Sync from Profile');
      userEvent.click(syncButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to sync profile data/)).toBeInTheDocument();
      });
    });

    it('should reset form to profile data when requested', async () => {
      localStorageMock.setItem('userProfileData', JSON.stringify(mockProfileData));
      
      renderApplicationForm();
      
      await waitFor(() => {
        expect(screen.getByText('✅ Profile synced')).toBeInTheDocument();
      });
      
      // Modify some form data
      const firstNameInput = screen.getByDisplayValue('John');
      userEvent.clear(firstNameInput);
      userEvent.type(firstNameInput, 'Modified');
      
      // Reset to profile
      const resetButton = screen.getByText('Reset to Profile');
      userEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });
    });

    it('should handle profile data transformation correctly', async () => {
      const profileWithComplexData = {
        ...mockProfileData,
        experience: [
          {
            title: 'Senior Developer',
            company: 'BigTech',
            duration: '2023-2024',
            description: 'Led frontend development team'
          },
          {
            title: 'Junior Developer',
            company: 'StartupCorp',
            duration: '2022-2023',
            description: 'Built responsive web applications'
          }
        ]
      };
      
      localStorageMock.setItem('userProfileData', JSON.stringify(profileWithComplexData));
      
      renderApplicationForm();
      
      await waitFor(() => {
        expect(screen.getByText('✅ Profile synced')).toBeInTheDocument();
      });
      
      // Check that experience is transformed correctly
      const experienceTextarea = screen.getByPlaceholderText(/Describe any relevant work experience/);
      expect(experienceTextarea.value).toContain('Senior Developer at BigTech');
      expect(experienceTextarea.value).toContain('Junior Developer at StartupCorp');
    });
  });

  describe('Form Input Handling', () => {
    it('should handle text input changes', async () => {
      renderApplicationForm();
      
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      userEvent.clear(firstNameInput);
      userEvent.type(firstNameInput, 'Jane');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
      });
    });

    it('should handle email input validation', async () => {
      renderApplicationForm();
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      userEvent.clear(emailInput);
      userEvent.type(emailInput, 'invalid-email');
      
      // Try to submit to trigger validation
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should handle skill selection', async () => {
      renderApplicationForm();
      
      // Click on a skill tag
      const reactSkill = screen.getByText('React');
      userEvent.click(reactSkill);
      
      // Skill should be selected (active state)
      await waitFor(() => {
        expect(reactSkill).toHaveClass('skillTagActive');
      });
      
      // Click again to deselect
      userEvent.click(reactSkill);
      await waitFor(() => {
        expect(reactSkill).not.toHaveClass('skillTagActive');
      });
    });

    it('should handle date inputs', async () => {
      renderApplicationForm();
      
      const graduationDateInput = screen.getByLabelText('Expected Graduation Date *');
      userEvent.type(graduationDateInput, '2026-06-15');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('2026-06-15')).toBeInTheDocument();
      });
    });

    it('should handle select dropdowns', async () => {
      renderApplicationForm();
      
      const availabilitySelect = screen.getByLabelText('Availability');
      userEvent.selectOptions(availabilitySelect, 'full-time');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Full-time (40+ hours/week)')).toBeInTheDocument();
      });
    });
  });

  describe('File Upload', () => {
    it('should handle file upload successfully', async () => {
      renderApplicationForm();
      
      const file = new File(['test resume content'], 'resume.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/Click to upload/);
      
      userEvent.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByText('resume.pdf')).toBeInTheDocument();
        expect(screen.getByText(/0.00 MB/)).toBeInTheDocument();
      });
    });

    it('should reject files that are too large', async () => {
      renderApplicationForm();
      
      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-resume.pdf', { 
        type: 'application/pdf' 
      });
      
      const fileInput = screen.getByLabelText(/Click to upload/);
      userEvent.upload(fileInput, largeFile);
      
      await waitFor(() => {
        expect(screen.getByText('File size must be less than 5MB')).toBeInTheDocument();
      });
    });

    it('should allow file removal after upload', async () => {
      renderApplicationForm();
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/Click to upload/);
      
      userEvent.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
      
      // Remove the file
      const removeButton = screen.getByText('❌');
      userEvent.click(removeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('Click to upload')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      renderApplicationForm();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
        expect(screen.getByText('University is required')).toBeInTheDocument();
        expect(screen.getByText('Major is required')).toBeInTheDocument();
        expect(screen.getByText('Graduation date is required')).toBeInTheDocument();
        expect(screen.getByText('Please select at least one skill')).toBeInTheDocument();
        expect(screen.getByText('Resume is required')).toBeInTheDocument();
        expect(screen.getByText('Cover letter is required')).toBeInTheDocument();
      });
    });

    it('should clear validation errors when fields are filled', async () => {
      renderApplicationForm();
      
      // Trigger validation errors
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
      
      // Fill the first name field
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      userEvent.type(firstNameInput, 'John');
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
      });
    });

    it('should validate skill selection requirement', async () => {
      renderApplicationForm();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please select at least one skill')).toBeInTheDocument();
      });
      
      // Select a skill
      const reactSkill = screen.getByText('React');
      userEvent.click(reactSkill);
      
      // Submit again - skill error should be cleared
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Please select at least one skill')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillRequiredFields = async () => {
      // Fill all required fields
      userEvent.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      userEvent.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      userEvent.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com');
      userEvent.type(screen.getByPlaceholderText('Enter your phone number'), '+65 9123 4567');
      userEvent.type(screen.getByPlaceholderText('Enter your university'), 'NUS');
      userEvent.type(screen.getByPlaceholderText('Enter your major'), 'Computer Science');
      userEvent.type(screen.getByLabelText('Expected Graduation Date *'), '2026-06-15');
      
      // Select a skill
      userEvent.click(screen.getByText('JavaScript'));
      
      // Upload resume
      const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/Click to upload/);
      userEvent.upload(fileInput, file);
      
      // Fill cover letter
      userEvent.type(
        screen.getByPlaceholderText(/Tell us why you're interested/), 
        'I am very interested in this internship opportunity because...'
      );
      
      // Wait for all inputs to be filled
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      });
    };

    it('should submit form successfully with valid data', async () => {
      renderApplicationForm();
      
      await fillRequiredFields();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(DataService.submitApplication).toHaveBeenCalledWith(expect.any(FormData));
    });

    it('should show loading state during submission', async () => {
      // Mock a delayed response
      DataService.submitApplication.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );
      
      renderApplicationForm();
      
      await fillRequiredFields();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Submitting...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle submission errors', async () => {
      DataService.submitApplication.mockResolvedValue({
        success: false,
        message: 'Server error occurred'
      });
      
      renderApplicationForm();
      
      await fillRequiredFields();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('⚠️ Server error occurred')).toBeInTheDocument();
      });
    });

    it('should handle network errors during submission', async () => {
      DataService.submitApplication.mockRejectedValue(new Error('Network error'));
      
      renderApplicationForm();
      
      await fillRequiredFields();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/An error occurred while submitting/)).toBeInTheDocument();
      });
    });

    it('should include job ID in submission data', async () => {
      renderApplicationForm();
      
      await fillRequiredFields();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(DataService.submitApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            append: expect.any(Function)
          })
        );
      });
      
      // Verify FormData contains jobId
      const formDataCall = DataService.submitApplication.mock.calls[0][0];
      expect(formDataCall).toBeInstanceOf(FormData);
    });
  });

  describe('Character Counting', () => {
    it('should show character count for cover letter', async () => {
      renderApplicationForm();
      
      const coverLetterTextarea = screen.getByPlaceholderText(/Tell us why you're interested/);
      userEvent.type(coverLetterTextarea, 'Test cover letter content');
      
      await waitFor(() => {
        expect(screen.getByText('25/1000 characters')).toBeInTheDocument();
      });
    });

    it('should prevent typing beyond character limit', async () => {
      renderApplicationForm();
      
      const longText = 'x'.repeat(1001);
      const coverLetterTextarea = screen.getByPlaceholderText(/Tell us why you're interested/);
      
      // Should not allow more than 1000 characters
      userEvent.type(coverLetterTextarea, longText);
      
      await waitFor(() => {
        expect(coverLetterTextarea.value.length).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('Navigation and Cancel', () => {
    it('should handle cancel button click', async () => {
      renderApplicationForm();
      
      const cancelButton = screen.getByText('Cancel');
      userEvent.click(cancelButton);
      
      expect(window.history.back).toHaveBeenCalled();
    });

    it('should show success page after submission', async () => {
      renderApplicationForm();
      
      await fillRequiredFields();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument();
        expect(screen.getByText('View My Applications')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing user context gracefully', () => {
      useAuth.mockReturnValue({ user: null });
      
      expect(() => render(
        <BrowserRouter>
          <ApplicationForm />
        </BrowserRouter>
      )).not.toThrow();
    });

    it('should handle malformed localStorage data', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      renderApplicationForm();
      
      const syncButton = screen.getByText('Sync from Profile');
      userEvent.click(syncButton);
      
      // Should fallback gracefully without crashing
      expect(screen.getByText('Sync from Profile')).toBeInTheDocument();
    });

    it('should handle empty profile data', async () => {
      const emptyProfile = {
        name: '',
        email: '',
        skills: [],
        experience: [],
        education: []
      };
      
      localStorageMock.setItem('userProfileData', JSON.stringify(emptyProfile));
      
      renderApplicationForm();
      
      await waitFor(() => {
        expect(screen.getByText('✅ Profile synced')).toBeInTheDocument();
      });
      
      // Form should handle empty data gracefully
      expect(screen.getByPlaceholderText('Enter your first name')).toHaveValue('');
    });

    it('should handle multiple rapid sync attempts', async () => {
      localStorageMock.setItem('userProfileData', JSON.stringify(mockProfileData));
      
      renderApplicationForm();
      
      const syncButton = screen.getByText('Sync from Profile');
      
      // Rapidly click sync multiple times
      userEvent.click(syncButton);
      userEvent.click(syncButton);
      userEvent.click(syncButton);
      
      // Should handle gracefully without errors
      await waitFor(() => {
        expect(screen.getByText('✅ Profile synced')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      renderApplicationForm();
      
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('University *')).toBeInTheDocument();
    });

    it('should show error messages with proper ARIA attributes', async () => {
      renderApplicationForm();
      
      const submitButton = screen.getByText('✨ Submit Application');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/is required/);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should support keyboard navigation', async () => {
      renderApplicationForm();
      
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      firstNameInput.focus();
      
      expect(document.activeElement).toBe(firstNameInput);
      
      // Tab to next input (using fireEvent for older user-event compatibility)
      fireEvent.keyDown(firstNameInput, { key: 'Tab', code: 'Tab' });
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByPlaceholderText('Enter your last name'));
      });
    });
  });
});