// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../auth/AuthContext';
// import DataService from '../../services/dataService';

// const BookmarkIndicator = ({ internshipId, onBookmarkToggle, style = {} }) => {
//   const { user } = useAuth();
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (user && internshipId) {
//       checkBookmarkStatus();
//     }
//   }, [user, internshipId]);

//   const checkBookmarkStatus = async () => {
//     try {
//       const response = await DataService.isBookmarked(user.id, internshipId);
//       if (response.success) {
//         setIsBookmarked(response.isBookmarked);
//       }
//     } catch (error) {
//       console.error('Error checking bookmark status:', error);
//     }
//   };

//   const handleToggleBookmark = async () => {
//     if (!user || loading) return;

//     setLoading(true);
//     try {
//       if (isBookmarked) {
//         // Remove bookmark
//         const response = await DataService.removeBookmark(user.id, internshipId);
//         if (response.success) {
//           setIsBookmarked(false);
//           onBookmarkToggle && onBookmarkToggle(false);
//         }
//       } else {
//         // Add bookmark
//         const notes = `Bookmarked on ${new Date().toLocaleDateString()}`;
//         const response = await DataService.bookmarkInternship(user.id, internshipId, notes);
//         if (response.success) {
//           setIsBookmarked(true);
//           onBookmarkToggle && onBookmarkToggle(true);
//         }
//       }
//     } catch (error) {
//       console.error('Error toggling bookmark:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) return null;

//   return (
//     <button
//       onClick={handleToggleBookmark}
//       disabled={loading}
//       style={{
//         background: 'none',
//         border: 'none',
//         cursor: loading ? 'not-allowed' : 'pointer',
//         fontSize: '1.2rem',
//         padding: '0.5rem',
//         borderRadius: '50%',
//         transition: 'all 0.2s ease',
//         opacity: loading ? 0.5 : 1,
//         ...style
//       }}
//       title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
//     >
//       {loading ? '⏳' : isBookmarked ? '🔖' : '🏷️'}
//     </button>
//   );
// };

// export default BookmarkIndicator;