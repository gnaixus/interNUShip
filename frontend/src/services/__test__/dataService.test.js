// dataService.test.js
import DataService from '../dataService.js';

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
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console methods to avoid test noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

describe('DataService', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Reset timers
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getAllInternships', () => {
    it('should return all internships successfully', async () => {
      const promise = DataService.getAllInternships();
      
      // Fast-forward time to resolve setTimeout
      jest.advanceTimersByTime(800);
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBe(result.data.length);
    });

    it('should return internships with required properties', async () => {
      const promise = DataService.getAllInternships();
      jest.advanceTimersByTime(800);
      const result = await promise;
      
      const internship = result.data[0];
      expect(internship).toHaveProperty('id');
      expect(internship).toHaveProperty('title');
      expect(internship).toHaveProperty('company');
      expect(internship).toHaveProperty('location');
      expect(internship).toHaveProperty('description');
    });
  });

  describe('getInternshipById', () => {
    it('should return specific internship when found', async () => {
      const promise = DataService.getInternshipById(1);
      jest.advanceTimersByTime(500);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(1);
    });

    it('should return error when internship not found', async () => {
      const promise = DataService.getInternshipById(999999);
      jest.advanceTimersByTime(500);
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Internship not found');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      const userId = 'user123';
      const promise = DataService.getUserProfile(userId);
      jest.advanceTimersByTime(600);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(userId);
      expect(result.data).toHaveProperty('firstName');
      expect(result.data).toHaveProperty('lastName');
      expect(result.data).toHaveProperty('email');
      expect(result.message).toBe('Profile retrieved successfully');
    });
  });

  describe('submitApplication', () => {
    it('should submit application successfully', async () => {
      const applicationData = {
        internshipId: 1,
        userId: 'user123',
        coverLetter: 'I am interested in this position'
      };
      
      const promise = DataService.submitApplication(applicationData);
      jest.advanceTimersByTime(1000);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.status).toBe('pending');
      expect(result.data.submittedAt).toBeDefined();
      expect(result.data.lastUpdated).toBeDefined();
      expect(result.message).toBe('Application submitted successfully');
    });

    it('should include all application data in response', async () => {
      const applicationData = {
        internshipId: 1,
        userId: 'user123',
        coverLetter: 'Test cover letter'
      };
      
      const promise = DataService.submitApplication(applicationData);
      jest.advanceTimersByTime(1000);
      const result = await promise;
      
      expect(result.data.internshipId).toBe(applicationData.internshipId);
      expect(result.data.userId).toBe(applicationData.userId);
      expect(result.data.coverLetter).toBe(applicationData.coverLetter);
    });
  });

  describe('getUserApplications', () => {
    it('should return user applications successfully', async () => {
      const userId = 'user123';
      const promise = DataService.getUserApplications(userId);
      jest.advanceTimersByTime(500);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should return applications with required properties', async () => {
      const userId = 'user123';
      const promise = DataService.getUserApplications(userId);
      jest.advanceTimersByTime(500);
      const result = await promise;
      
      const application = result.data[0];
      expect(application).toHaveProperty('id');
      expect(application).toHaveProperty('internshipId');
      expect(application).toHaveProperty('userId');
      expect(application).toHaveProperty('status');
      expect(application).toHaveProperty('submittedAt');
      expect(application).toHaveProperty('internship');
      expect(application.userId).toBe(userId);
    });
  });

  describe('getCategories', () => {
    it('should return categories successfully', async () => {
      const promise = DataService.getCategories();
      jest.advanceTimersByTime(100);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe('Bookmark System', () => {
    const userId = 'user123';
    const internshipId = 1;

    describe('getBookmarkKey', () => {
      it('should generate correct bookmark key', () => {
        const key = DataService.getBookmarkKey(userId);
        expect(key).toBe(`userBookmarks_${userId}`);
      });
    });

    describe('isBookmarked', () => {
      it('should return false when internship is not bookmarked', async () => {
        const result = await DataService.isBookmarked(userId, internshipId);
        
        expect(result.success).toBe(true);
        expect(result.isBookmarked).toBe(false);
      });

      it('should return true when internship is bookmarked', async () => {
        // First, add a bookmark to localStorage
        const bookmarks = [{
          internshipId: internshipId,
          userId: userId,
          bookmarkedAt: new Date().toISOString()
        }];
        localStorageMock.setItem(`userBookmarks_${userId}`, JSON.stringify(bookmarks));
        
        const result = await DataService.isBookmarked(userId, internshipId);
        
        expect(result.success).toBe(true);
        expect(result.isBookmarked).toBe(true);
      });

      it('should handle localStorage parsing errors', async () => {
        // Mock localStorage to return invalid JSON
        localStorageMock.getItem.mockReturnValueOnce('invalid json');
        
        const result = await DataService.isBookmarked(userId, internshipId);
        
        expect(result.success).toBe(false);
        expect(result.isBookmarked).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('bookmarkInternship', () => {
      it('should bookmark internship successfully', async () => {
        // Mock getting internship data
        jest.spyOn(DataService, 'getInternshipById').mockResolvedValueOnce({
          success: true,
          data: {
            id: internshipId,
            title: 'Test Internship',
            company: 'Test Company'
          }
        });

        const promise = DataService.bookmarkInternship(userId, internshipId, 'Test notes', 'high');
        jest.advanceTimersByTime(300);
        const result = await promise;
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.userId).toBe(userId);
        expect(result.data.internshipId).toBe(internshipId);
        expect(result.data.notes).toBe('Test notes');
        expect(result.data.priority).toBe('high');
        expect(result.message).toBe('Internship bookmarked successfully');
      });

      it('should handle internship not found', async () => {
        // Mock getInternshipById to return not found
        jest.spyOn(DataService, 'getInternshipById').mockResolvedValueOnce({
          success: false,
          error: 'Internship not found'
        });

        const promise = DataService.bookmarkInternship(userId, 999999);
        jest.advanceTimersByTime(300);
        const result = await promise;
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Internship not found');
      });

      it('should prevent duplicate bookmarks', async () => {
        // Mock existing bookmark
        const existingBookmarks = [{
          internshipId: internshipId,
          userId: userId
        }];
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingBookmarks));

        const promise = DataService.bookmarkInternship(userId, internshipId);
        jest.advanceTimersByTime(300);
        const result = await promise;
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Internship already bookmarked');
      });
    });

    describe('removeBookmark', () => {
      it('should remove bookmark successfully', async () => {
        // Setup existing bookmark
        const existingBookmarks = [{
          internshipId: internshipId,
          userId: userId,
          id: 1
        }];
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingBookmarks));

        const promise = DataService.removeBookmark(userId, internshipId);
        jest.advanceTimersByTime(200);
        const result = await promise;
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Bookmark removed successfully');
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });

      it('should handle bookmark not found', async () => {
        // Setup localStorage with no matching bookmark
        localStorageMock.getItem.mockReturnValueOnce('[]');

        const promise = DataService.removeBookmark(userId, 999999);
        jest.advanceTimersByTime(200);
        const result = await promise;
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Bookmark not found');
      });
    });

    describe('getUserBookmarks', () => {
      it('should return user bookmarks successfully', async () => {
        const promise = DataService.getUserBookmarks(userId);
        jest.advanceTimersByTime(400);
        const result = await promise;
        
        expect(result.success).toBe(true);
        expect(result.data).toBeInstanceOf(Array);
        expect(result.total).toBe(result.data.length);
      });

      it('should return bookmarks with correct properties', async () => {
        const promise = DataService.getUserBookmarks(userId);
        jest.advanceTimersByTime(400);
        const result = await promise;
        
        if (result.data.length > 0) {
          const bookmark = result.data[0];
          expect(bookmark).toHaveProperty('bookmarkedDate');
          expect(bookmark).toHaveProperty('notes');
          expect(bookmark).toHaveProperty('priority');
          expect(bookmark).toHaveProperty('status');
        }
      });
    });

    describe('updateBookmark', () => {
      it('should update bookmark successfully', async () => {
        // Setup existing bookmark
        const existingBookmarks = [{
          internshipId: internshipId,
          userId: userId,
          id: 1,
          priority: 'medium',
          notes: 'Old notes'
        }];
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingBookmarks));

        const updates = {
          priority: 'high',
          notes: 'Updated notes'
        };

        const result = await DataService.updateBookmark(userId, internshipId, updates);
        
        expect(result.success).toBe(true);
        expect(result.data.priority).toBe('high');
        expect(result.data.notes).toBe('Updated notes');
        expect(result.message).toBe('Bookmark updated successfully');
      });

      it('should handle bookmark not found for update', async () => {
        localStorageMock.getItem.mockReturnValueOnce('[]');

        const result = await DataService.updateBookmark(userId, 999999, { priority: 'high' });
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Bookmark not found');
      });
    });

    describe('getBookmarkStats', () => {
      it('should return bookmark statistics', async () => {
        const promise = DataService.getBookmarkStats(userId);
        jest.advanceTimersByTime(200);
        const result = await promise;
        
        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('total');
        expect(result.data).toHaveProperty('byStatus');
        expect(result.data).toHaveProperty('byPriority');
        expect(result.data).toHaveProperty('recentlyAdded');
      });

      it('should calculate correct statistics', async () => {
        // Setup test bookmarks
        const testBookmarks = [
          {
            internshipId: 1,
            priority: 'high',
            status: 'not-applied',
            bookmarkedAt: new Date().toISOString(),
            title: 'Test Job 1',
            company: 'Company 1'
          },
          {
            internshipId: 2,
            priority: 'medium',
            status: 'applied',
            bookmarkedAt: new Date().toISOString(),
            title: 'Test Job 2',
            company: 'Company 2'
          }
        ];
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(testBookmarks));

        const promise = DataService.getBookmarkStats(userId);
        jest.advanceTimersByTime(200);
        const result = await promise;
        
        expect(result.data.total).toBe(2);
        expect(result.data.byPriority.high).toBe(1);
        expect(result.data.byPriority.medium).toBe(1);
        expect(result.data.byStatus['not-applied']).toBe(1);
        expect(result.data.byStatus.applied).toBe(1);
      });
    });
  });

  describe('Platform-specific methods', () => {
    describe('getInternshipsByPlatform', () => {
      it('should return platform-specific internships', async () => {
        const platform = 'linkedin';
        const promise = DataService.getInternshipsByPlatform(platform);
        jest.advanceTimersByTime(800);
        const result = await promise;
        
        expect(result).toBeDefined();
        // The actual structure depends on your simulateAPIResponse implementation
      });
    });

    describe('performWebScraping', () => {
      it('should perform web scraping and return results', async () => {
        const promise = DataService.performWebScraping();
        jest.advanceTimersByTime(2000);
        const result = await promise;
        
        expect(result).toBeDefined();
        // The actual structure depends on your simulateWebScrapingResults implementation
      });
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw an error
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      const result = await DataService.isBookmarked(userId, internshipId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle JSON parsing errors', async () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json string');

      const result = await DataService.getBookmarkStats(userId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty localStorage gracefully', async () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = await DataService.getUserBookmarks(userId);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });

    it('should handle undefined userId', async () => {
      const result = await DataService.isBookmarked(undefined, internshipId);
      
      expect(result.success).toBe(false);
    });

    it('should handle undefined internshipId', async () => {
      const result = await DataService.isBookmarked(userId, undefined);
      
      expect(result.success).toBe(false);
    });
  });
});