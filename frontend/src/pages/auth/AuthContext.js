import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  //Check if user is already logged in on app start but probably not since local host
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
    //Verify token with backend
      axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
        console.log('User loaded:', res.data);
      })
      .catch(() => {
        //Token expired or invalid
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const res = await axios.post(`${API_URL}/token`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      localStorage.setItem("token", res.data.access_token);
      
      //Fetch user details after successful login to home page
      const userRes = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      
      setUser(userRes.data);
      console.log('Login successful, user set:', userRes.data);
      
      return res.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      console.log('Attempting signup with data:', userData);
      //turn frontend field names to backend expected format
      const signupData = {
        full_name: userData.fullName || userData.full_name,
        username: userData.username,
        email: userData.email,
        confirm_email: userData.confirmEmail || userData.confirm_email,
        dob: userData.dob,
        password: userData.password,
        confirm_password: userData.confirmPassword || userData.confirm_password
      };

      console.log('Sending signup data to backend:', signupData);

      const response = await axios.post(`${API_URL}/signup`, signupData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Signup successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            const errorMessages = error.response.data.detail.map(err => err.msg).join(', ');
            throw new Error(errorMessages);
          } else {
            throw new Error(error.response.data.detail);
          }
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Network error - could not connect to server');
      } else {
        console.error('Error setting up request:', error.message);
        throw new Error(error.message);
      }
      
      throw new Error('Signup failed');
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsGuest(null);
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isGuest, 
      loading,
      isAuthenticated,
      login, 
      signup, 
      logout, 
      loginAsGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

//Milestone 1 final