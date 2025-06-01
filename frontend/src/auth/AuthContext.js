import React, { createContext, useState, useEffect, useContext } from 'react';                                                    
import axios from "axios";

// auth/AuthContext.js
export const useAuth = () => useContext(AuthContext);  // Must be exported
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:8000/verify-token", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post("http://localhost:8000/token", {
      username: email,
      password,
    });
    localStorage.setItem("token", res.data.access_token);
    setUser({ email });
  };

  const signup = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:8000/signup", { 
      email, 
      password 
    });
    return response.data; // Return success data
  } catch (error) {
    // Improved error handling
    const errorMessage = error.response?.data?.detail || 
                       error.message || 
                       "Signup failed";
    throw new Error(errorMessage);
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);

  const LoginAsGuest = () => {
    setIsGuest(true);
  }
};

  return (
    <AuthContext.Provider value={{ user, isGuest, login, signup, logout, LoginAsGuest,loading }}>
      {children}
    </AuthContext.Provider>
  );
};