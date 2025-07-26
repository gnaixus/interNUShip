import { createUnifiedBookmarkHandler } from '../bookmarkHandler';
import DataService from '../../../services/dataService';

// Mock DataService
jest.mock('../../../services/dataService');

// Mock window methods
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/test'
  },
  writable: true
});

Object.defineProperty(window, 'alert', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(window, 'confirm', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(window, 'prompt', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(window.location, 'reload', {
  value: jest.fn(),
  writable: true
});

describe('bookmarkHandler', () => {
  let mockUser;
  let mockNavigate;
  let mockInternship;
  let mockSetIsBookmarked;
  let bookmarkHandler;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock user object
    mockUser = {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    };

    // Mock navigate function
    mockNavigate = jest.fn();

    // Mock internship object
    mockInternship = {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'TechFlow Solutions',
      location: 'San Francisco, CA',
      description: 'Join our dynamic frontend team',
      requirements: 'React, JavaScript, HTML/CSS',
      benefits: 'Competitive salary, flexible hours',
      skills: ['React', 'JavaScript'],
      category: 'Technology',
      type: 'Remote',
      duration: '12 weeks',
      stipend: '$25/hour',
      applicationDeadline: '2025-08-01',
      startDate: '2025-09-01',
      published: '2025-07-01'
    };

    // Mock setIsBookmarked function
    mockSetIsBookmarked = jest.fn();

    // Create bookmark handler instance
    bookmarkHandler = createUnifiedBookmarkHandler(mockUser, mockNavigate);
  });

  describe('createUnifiedBookmarkHandler', () => {
    it('should return a function when called with user and navigate', () => {
      expect(typeof bookmarkHandler).toBe('function');
    });

    it('should redirect to signup when user is null', async () => {
      const handlerWithoutUser = createUnifiedBookmarkHandler(null, mockNavigate);
      
      await handlerWithoutUser(mockInternship);
      
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('should redirect to signup when user is undefined', async () => {
      const handlerWithoutUser = createUnifiedBookmarkHandler(undefined, mockNavigate);
      
      await handlerWithoutUser(mockInternship);
      
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
  });

  describe('removing bookmarks', () => {
    beforeEach(() => {
      DataService.removeBookmark.mockResolvedValue({ success: true });
    });

    it('should remove bookmark when isBookmarked is true', async () => {
      await bookmarkHandler(mockInternship, true, mockSetIsBookmarked);

      expect(DataService.removeBookmark).toHaveBeenCalledWith(mockUser.id, mockInternship.id);
      expect(mockSetIsBookmarked).toHaveBeenCalledWith(false);
      expect(window.alert).toHaveBeenCalledWith('✅ Removed "Frontend Developer Intern" from your bookmarks!');
    });

    it('should reload page when removing bookmark from bookmarks page', async () => {
      window.location.pathname = '/bookmarks';
      
      await bookmarkHandler(mockInternship, true, mockSetIsBookmarked);

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should handle remove bookmark failure', async () => {
      DataService.removeBookmark.mockResolvedValue({ 
        success: false, 
        error: 'Database error' 
      });

      await bookmarkHandler(mockInternship, true, mockSetIsBookmarked);

      expect(window.alert).toHaveBeenCalledWith('❌ Database error');
      expect(mockSetIsBookmarked).not.toHaveBeenCalled();
    });

    it('should handle remove bookmark failure without error message', async () => {
      DataService.removeBookmark.mockResolvedValue({ success: false });

      await bookmarkHandler(mockInternship, true, mockSetIsBookmarked);

      expect(window.alert).toHaveBeenCalledWith('❌ Failed to remove bookmark');
    });
  });

  describe('checking existing bookmarks', () => {
    it('should prompt to remove when internship is already bookmarked', async () => {
      DataService.isBookmarked.mockResolvedValue({ isBookmarked: true });
      DataService.removeBookmark.mockResolvedValue({ success: true });
      window.confirm.mockReturnValue(true);

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.isBookmarked).toHaveBeenCalledWith(mockUser.id, mockInternship.id);
      expect(window.confirm).toHaveBeenCalledWith(
        '"Frontend Developer Intern" is already in your bookmarks!\n\nClick OK to remove it, or Cancel to do nothing.'
      );
      expect(DataService.removeBookmark).toHaveBeenCalledWith(mockUser.id, mockInternship.id);
      expect(mockSetIsBookmarked).toHaveBeenCalledWith(false);
    });

    it('should not remove when user cancels confirmation for existing bookmark', async () => {
      DataService.isBookmarked.mockResolvedValue({ isBookmarked: true });
      window.confirm.mockReturnValue(false);

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.removeBookmark).not.toHaveBeenCalled();
      expect(mockSetIsBookmarked).not.toHaveBeenCalled();
    });
  });

  describe('adding new bookmarks', () => {
    beforeEach(() => {
      DataService.isBookmarked.mockResolvedValue({ isBookmarked: false });
      DataService.bookmarkInternship.mockResolvedValue({ 
        success: true, 
        data: { id: 1, priority: 'medium' } 
      });
    });

    it('should add bookmark with user prompts', async () => {
      window.prompt
        .mockReturnValueOnce('high') // priority
        .mockReturnValueOnce('Perfect match for my skills!'); // notes

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.bookmarkInternship).toHaveBeenCalledWith(
        mockUser.id,
        mockInternship.id,
        'Perfect match for my skills!',
        'high'
      );
      expect(mockSetIsBookmarked).toHaveBeenCalledWith(true);
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('✅ Successfully bookmarked!')
      );
      expect(result.success).toBe(true);
    });

    it('should use default priority when invalid priority provided', async () => {
      window.prompt
        .mockReturnValueOnce('invalid') // invalid priority
        .mockReturnValueOnce('Test notes');

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.bookmarkInternship).toHaveBeenCalledWith(
        mockUser.id,
        mockInternship.id,
        'Test notes',
        'medium' // default priority
      );
    });

    it('should handle valid priority options (high, medium, low)', async () => {
      const validPriorities = ['high', 'medium', 'low'];
      
      for (const priority of validPriorities) {
        jest.clearAllMocks();
        DataService.isBookmarked.mockResolvedValue({ isBookmarked: false });
        DataService.bookmarkInternship.mockResolvedValue({ success: true, data: {} });
        
        window.prompt
          .mockReturnValueOnce(priority)
          .mockReturnValueOnce('Test notes');

        await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

        expect(DataService.bookmarkInternship).toHaveBeenCalledWith(
          mockUser.id,
          mockInternship.id,
          'Test notes',
          priority
        );
      }
    });

    it('should handle case-insensitive priority input', async () => {
      window.prompt
        .mockReturnValueOnce('HIGH') // uppercase
        .mockReturnValueOnce('Test notes');

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.bookmarkInternship).toHaveBeenCalledWith(
        mockUser.id,
        mockInternship.id,
        'Test notes',
        'high' // converted to lowercase
      );
    });

    it('should return early when user cancels priority prompt', async () => {
      window.prompt.mockReturnValueOnce(null); // user cancels

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.bookmarkInternship).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return early when user cancels notes prompt', async () => {
      window.prompt
        .mockReturnValueOnce('medium')
        .mockReturnValueOnce(null); // user cancels notes

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.bookmarkInternship).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should use default notes when empty notes provided', async () => {
      window.prompt
        .mockReturnValueOnce('medium')
        .mockReturnValueOnce(''); // empty notes

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.bookmarkInternship).toHaveBeenCalledWith(
        mockUser.id,
        mockInternship.id,
        'Interested in this Frontend Developer Intern role at TechFlow Solutions',
        'medium'
      );
    });

    it('should trim whitespace from notes', async () => {
      window.prompt
        .mockReturnValueOnce('medium')
        .mockReturnValueOnce('  Test notes with whitespace  ');

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(DataService.bookmarkInternship).toHaveBeenCalledWith(
        mockUser.id,
        mockInternship.id,
        'Test notes with whitespace',
        'medium'
      );
    });
  });

  describe('options parameter', () => {
    beforeEach(() => {
      DataService.isBookmarked.mockResolvedValue({ isBookmarked: false });
      DataService.bookmarkInternship.mockResolvedValue({ success: true, data: {} });
    });

    it('should skip prompts when skipPrompts option is true', async () => {
      const options = { 
        skipPrompts: true, 
        priority: 'high', 
        notes: 'Auto bookmark' 
      };

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      expect(window.prompt).not.toHaveBeenCalled();
      expect(DataService.bookmarkInternship).toHaveBeenCalledWith(
        mockUser.id,
        mockInternship.id,
        'Auto bookmark',
        'high'
      );
    });

    it('should use default values from options', async () => {
      const options = { 
        priority: 'low', 
        notes: 'Custom default note' 
      };
      
      window.prompt
        .mockReturnValueOnce('low') // use option default
        .mockReturnValueOnce('Custom default note'); // use option default

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      expect(DataService.bookmarkInternship).toHaveBeenCalledWith(
        mockUser.id,
        mockInternship.id,
        'Custom default note',
        'low'
      );
    });

    it('should not show alert when silent option is true', async () => {
      const options = { 
        skipPrompts: true, 
        silent: true, 
        priority: 'medium', 
        notes: 'Silent bookmark' 
      };

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      DataService.isBookmarked.mockResolvedValue({ isBookmarked: false });
    });

    it('should handle DataService.bookmarkInternship failure', async () => {
      DataService.bookmarkInternship.mockResolvedValue({ 
        success: false, 
        error: 'Network error' 
      });
      
      window.prompt
        .mockReturnValueOnce('medium')
        .mockReturnValueOnce('Test notes');

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(window.alert).toHaveBeenCalledWith('❌ Network error');
      expect(mockSetIsBookmarked).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle DataService.bookmarkInternship failure without error message', async () => {
      DataService.bookmarkInternship.mockResolvedValue({ success: false });
      
      window.prompt
        .mockReturnValueOnce('medium')
        .mockReturnValueOnce('Test notes');

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(window.alert).toHaveBeenCalledWith('❌ Failed to bookmark internship');
      expect(result.error).toBeUndefined();
    });

    it('should handle unexpected errors', async () => {
      DataService.isBookmarked.mockRejectedValue(new Error('Unexpected error'));

      window.prompt
        .mockReturnValueOnce('medium')
        .mockReturnValueOnce('Test notes');

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked);

      expect(window.alert).toHaveBeenCalledWith('❌ Failed to bookmark internship. Please try again.');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected error');
    });

    it('should not show alert for errors when silent option is true', async () => {
      DataService.bookmarkInternship.mockResolvedValue({ 
        success: false, 
        error: 'Network error' 
      });
      
      const options = { 
        skipPrompts: true, 
        silent: true, 
        priority: 'medium', 
        notes: 'Test notes' 
      };

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('bookmark data structure', () => {
    beforeEach(() => {
      DataService.isBookmarked.mockResolvedValue({ isBookmarked: false });
      DataService.bookmarkInternship.mockResolvedValue({ success: true, data: {} });
    });

    it('should create complete bookmark data structure', async () => {
      const options = { 
        skipPrompts: true, 
        priority: 'high', 
        notes: 'Complete test' 
      };

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      expect(result.bookmarkData).toEqual({
        userId: mockUser.id,
        internshipId: mockInternship.id,
        notes: 'Complete test',
        priority: 'high',
        internship: mockInternship,
        bookmarkedAt: expect.any(String),
        bookmarkedDate: expect.any(String)
      });
    });

    it('should format bookmarkedDate correctly', async () => {
      const options = { 
        skipPrompts: true, 
        priority: 'medium', 
        notes: 'Date test' 
      };

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format

      expect(result.bookmarkData.bookmarkedDate).toMatch(dateRegex);
    });

    it('should format bookmarkedAt correctly', async () => {
      const options = { 
        skipPrompts: true, 
        priority: 'medium', 
        notes: 'DateTime test' 
      };

      const result = await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);
      
      expect(result.bookmarkData.bookmarkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('success message formatting', () => {
    beforeEach(() => {
      DataService.isBookmarked.mockResolvedValue({ isBookmarked: false });
      DataService.bookmarkInternship.mockResolvedValue({ success: true, data: {} });
    });

    it('should show correct success message for high priority', async () => {
      const options = { 
        skipPrompts: true, 
        priority: 'high', 
        notes: 'High priority test' 
      };

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('🔴 HIGH Priority')
      );
    });

    it('should show correct success message for medium priority', async () => {
      const options = { 
        skipPrompts: true, 
        priority: 'medium', 
        notes: 'Medium priority test' 
      };

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('🟡 MEDIUM Priority')
      );
    });

    it('should show correct success message for low priority', async () => {
      const options = { 
        skipPrompts: true, 
        priority: 'low', 
        notes: 'Low priority test' 
      };

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('🟢 LOW Priority')
      );
    });

    it('should include internship details in success message', async () => {
      const options = { 
        skipPrompts: true, 
        priority: 'medium', 
        notes: 'Success message test' 
      };

      await bookmarkHandler(mockInternship, false, mockSetIsBookmarked, options);

      const expectedMessage = expect.stringMatching(
        /✅ Successfully bookmarked![\s\S]*📋 Frontend Developer Intern[\s\S]*🏢 TechFlow Solutions/
      );
      
      expect(window.alert).toHaveBeenCalledWith(expectedMessage);
    });
  });
});