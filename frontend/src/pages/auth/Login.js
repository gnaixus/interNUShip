import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';  
import styles from '../../styles/Login.module.css';
import authStyles from '../../styles/Auth.module.css';

export default function Login() {
  const { login, loginAsGuest, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, default to home
  const from = location.state?.from?.pathname || '/home';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log('User already logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log('Attempting login...');
      await login(formData.email, formData.password);
      
      console.log('Login successful, redirecting to:', from);
      // Success! The useEffect will handle the redirect
      
    } catch (error) {
      console.error('Login failed:', error);
      
      if (error.response?.status === 401) {
        setErrors({ general: 'Invalid email or password' });
      } else if (error.response?.data?.detail) {
        setErrors({ general: error.response.data.detail });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/home');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className={authStyles.authContainer}>
        <div className={authStyles.authCard}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={authStyles.authContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Welcome Back</h1>
        <p className={styles.loginSubtitle}>Sign in to your InterNUShip account</p>
        
        {errors.general && (
          <div className={styles.errorMessage}>
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className={styles.rememberForgot}>
            <label className={styles.rememberMe}>
              <div 
                className={`${styles.checkbox} ${rememberMe ? styles.checked : ''}`}
                onClick={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
            <a href="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            className={`${styles.loginButton} ${isSubmitting ? styles.loading : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        {/* Social Login */}
        <div className={styles.socialLogin}>
          <button className={`${styles.socialButton} ${styles.google}`}>
            <span>G</span>
            Continue with Google
          </button>
          <button className={`${styles.socialButton} ${styles.github}`}>
            <span>⚡</span>
            Continue with GitHub
          </button>
        </div>

        {/* Guest Login */}
        <button 
          onClick={handleGuestLogin}
          className={styles.guestLogin}
        >
          Continue as Guest
        </button>

        <p className={styles.loginFooter}>
          Don't have an account?{' '}
          <a href="/signup" className={styles.signupLink}>Sign up here</a>
        </p>
      </div>
    </div>
  );
}