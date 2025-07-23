import DataService from '../../services/dataService';

export const createUnifiedBookmarkHandler = (user, navigate) => {
  return async (internship, isBookmarked = false, setIsBookmarked = null, options = {}) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    try {
      // If removing bookmark
      if (isBookmarked && setIsBookmarked) {
        console.log('🗑️ Removing bookmark for:', internship.title);
        const response = await DataService.removeBookmark(user.id, internship.id);
        
        if (response.success) {
          setIsBookmarked(false);
          
          // Force refresh bookmarks page if currently viewing it
          if (window.location.pathname === '/bookmarks') {
            window.location.reload();
          }
          
          alert(`✅ Removed "${internship.title}" from your bookmarks!`);
        } else {
          alert(`❌ ${response.error || 'Failed to remove bookmark'}`);
        }
        return;
      }

      // Check if already bookmarked
      console.log('🔍 Checking if already bookmarked...');
      const bookmarkCheck = await DataService.isBookmarked(user.id, internship.id);
      console.log('📋 Bookmark check result:', bookmarkCheck);
      
      if (bookmarkCheck.isBookmarked) {
        const removeMessage = `"${internship.title}" is already in your bookmarks!\n\nClick OK to remove it, or Cancel to do nothing.`;
        const removeConfirm = window.confirm(removeMessage);
        
        if (removeConfirm) {
          const response = await DataService.removeBookmark(user.id, internship.id);
          if (response.success) {
            if (setIsBookmarked) setIsBookmarked(false);
            alert(`✅ Removed "${internship.title}" from your bookmarks!`);
          }
        }
        return;
      }

      // Priority selection with default from options
      const defaultPriority = options.priority || 'medium';
      const priorityMessage = `Choose priority for "${internship.title}":

🔴 HIGH - Must apply! Dream internship, perfect match
🟡 MEDIUM - Good option, worth considering 
🟢 LOW - Maybe later, exploratory save

Type: high, medium, or low`;

      const priorityChoice = options.skipPrompts 
        ? defaultPriority 
        : window.prompt(priorityMessage, defaultPriority);

      if (priorityChoice === null && !options.skipPrompts) {
        return; // User cancelled
      }

      const validPriorities = ['high', 'medium', 'low'];
      const selectedPriority = validPriorities.includes(priorityChoice?.toLowerCase()) 
        ? priorityChoice.toLowerCase() 
        : defaultPriority;

      // Notes with default from options
      const defaultNotes = options.notes || `Interested in this ${internship.title} role at ${internship.company}`;
      const notesMessage = `Add a personal note for "${internship.title}" (optional):

Examples:
• "Perfect match for my React skills!"
• "Great company culture, need to research more"
• "Good backup option for summer internship"`;

      const notes = options.skipPrompts 
        ? defaultNotes 
        : window.prompt(notesMessage, defaultNotes);

      if (notes === null && !options.skipPrompts) {
        return; // User cancelled
      }

      // Ensure we have all required data for the bookmark
      const bookmarkData = {
        userId: user.id,
        internshipId: internship.id,
        notes: notes?.trim() || defaultNotes,
        priority: selectedPriority,
        // Include all internship data needed for bookmarks page
        internship: {
          id: internship.id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          description: internship.description,
          requirements: internship.requirements,
          benefits: internship.benefits,
          skills: internship.skills,
          category: internship.category,
          type: internship.type,
          duration: internship.duration,
          stipend: internship.stipend,
          applicationDeadline: internship.applicationDeadline,
          startDate: internship.startDate,
          published: internship.published
        },
        bookmarkedAt: new Date().toISOString(),
        bookmarkedDate: new Date().toISOString().split('T')[0]
      };

      console.log('➕ Adding bookmark with complete data:', bookmarkData);
      
      // Add bookmark using DataService
      const response = await DataService.bookmarkInternship(
        user.id, 
        internship.id,
        bookmarkData.notes,
        selectedPriority
      );

      console.log('📬 Bookmark response:', response);

      if (response.success) {
        // Update local state if provided
        if (setIsBookmarked) {
          setIsBookmarked(true);
        }

        // Success confirmation
        const priorityEmoji = {
          high: '🔴 HIGH',
          medium: '🟡 MEDIUM', 
          low: '🟢 LOW'
        };

        const successMessage = `✅ Successfully bookmarked!

📋 ${internship.title}
🏢 ${internship.company}
${priorityEmoji[selectedPriority]} Priority

You can view and manage your bookmarks in the Bookmarks page.`;

        if (!options.silent) {
          alert(successMessage);
        }
        
        console.log('✅ Bookmark saved successfully:', response.data);
        
        // Return success info for external handling
        return {
          success: true,
          data: response.data,
          bookmarkData
        };
        
      } else {
        console.error('❌ Bookmark failed:', response.error);
        if (!options.silent) {
          alert(`❌ ${response.error || 'Failed to bookmark internship'}`);
        }
        return {
          success: false,
          error: response.error
        };
      }
      
    } catch (error) {
      console.error('💥 Error in bookmark handler:', error);
      if (!options.silent) {
        alert('❌ Failed to bookmark internship. Please try again.');
      }
      return {
        success: false,
        error: error.message
      };
    }
  };
};

