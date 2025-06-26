import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './pages/auth/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/home/Home';
import Browse from './pages/Browse';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
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
      
      {/* Applications page - protected route (requires authentication) */}
      <Route path="/applications" element={
        <ProtectedRoute>
          <Applications />
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
      
      {/* Bookmarks page - protected route */}
      <Route path="/bookmarks" element={
        <ProtectedRoute>
          <div style={{ padding: '50px', textAlign: 'center', color: '#f8fafc' }}>
            <h1>🔖 Your Bookmarks</h1>
            <p>Save your favorite internships here for quick access!</p>
            <p style={{ marginTop: '2rem', opacity: 0.7 }}>Coming soon in Milestone 2...</p>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/community" element={
        <ProtectedRoute>
          <div style={{ padding: '50px', textAlign: 'center', color: '#f8fafc' }}>
            <h1>Community Page</h1>
            <p>Coming soon...</p>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/internships/:id" element={
        <div style={{ padding: '50px', textAlign: 'center', color: '#f8fafc' }}>
          <h1>Internship Details</h1>
          <p>Coming soon...</p>
        </div>
      } />
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