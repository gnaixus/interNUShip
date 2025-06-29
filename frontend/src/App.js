import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './pages/auth/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/home/Home';
import Browse from './pages/Browse';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import About from './pages/About';
import ResumeUpload from './pages/resume/ResumeUpload';
import ApplicationForm from './pages/resume/ApplicationForm';
import './styles/App.css';

//Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #374151 100%)',
        color: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

//Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #374151 100%)',
        color: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/home" replace /> : children;
};

const profileData = {
  firstName: 'Jie Ying',
  lastName: 'Tan',
  email: 'tanjieying16@gmail.com',
  phone: '+65 9123 4567',
  university: 'National University of Singapore',
  major: 'Computer Science',
  graduationDate: '2026-05-15',
  gpa: '4.2',
  skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Machine Learning'],
  experience: 'Web Development Intern at Tech Startup SG (Jun 2024 - Aug 2024)'
};

//App Content Component (needs to be inside AuthProvider)
const AppContent = () => {
  
  const handleParsedResume = (parsedData) => {
    console.log('Parsed resume data:', parsedData);
    // You can also set state here to display parsed data in UI
  };

  return (
    <Routes>
      {/* Public routes - redirect to home if logged in */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      
      {/* Home route is accessible to everyone */}
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Browse page - accessible to everyone (guests can browse) */}
      <Route path="/internships" element={<Browse />} />
      
      {/* About page - accessible to everyone */}
      <Route path="/about" element={<About />} />
      
      {/* Applications page - protected route (requires authentication) */}
      <Route path="/applications" element={
        <ProtectedRoute>
          <Applications />
        </ProtectedRoute>
      } />

      {/* Bookmarks page - protected route */}
      <Route path="/bookmarks" element={
        <ProtectedRoute>
          <Bookmarks />
        </ProtectedRoute>
      } />

      {/* Resume Upload Route - protected */}
      <Route path="/resume-upload" element={
        <ProtectedRoute>
          <ResumeUpload onParse={handleParsedResume} />
        </ProtectedRoute>
      } />

      {/* Application Form Route - protected */}
      <Route path="/apply/:id" element={
        <ProtectedRoute>
          <ApplicationForm />
        </ProtectedRoute>
      } />
      
      {/* Profile page - protected route */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Community page - placeholder for future development */}
      <Route path="/community" element={
        <ProtectedRoute>
          <div style={{ 
            padding: '50px', 
            textAlign: 'center', 
            color: '#f8fafc',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #374151 100%)',
            minHeight: '100vh'
          }}>
            <h1>👥 Community Page</h1>
            <p>Connect with fellow students and share internship experiences!</p>
            <p style={{ marginTop: '2rem', opacity: 0.7 }}>Coming soon in Milestone 3...</p>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Internship details page - placeholder */}
      <Route path="/internships/:id" element={
        <div style={{ 
          padding: '50px', 
          textAlign: 'center', 
          color: '#f8fafc',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #374151 100%)',
          minHeight: '100vh'
        }}>
          <h1>📋 Internship Details</h1>
          <p>Detailed view of internship opportunities</p>
          <p style={{ marginTop: '2rem', opacity: 0.7 }}>Coming soon in Milestone 2...</p>
        </div>
      } />
      
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;