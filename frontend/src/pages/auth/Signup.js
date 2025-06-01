import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import styles from '../../styles/Signup.module.css';
import authStyles from '../../styles/Auth.module.css';
import axios from 'axios';
import { 
  formatDateToDDMMYYYY, 
  formatDateToYYYYMMDD, 
  getTodayYYYYMMDD,
  isValidDDMMYYYY,
  calculateAge 
} from '../utils/dateHelpers';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    confirmEmail: '',
    dob: '', // This will store DD/MM/YYYY format
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form completion progress
  useEffect(() => {
    const filledFields = Object.values(formData).filter(value => value.trim() !== '').length;
    const totalFields = Object.keys(formData).length;
    setFormProgress((filledFields / totalFields) * 100);
  }, [formData]);

  // Debounced username check
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (!username || username.length < 3) {
        setUsernameStatus(null);
        return;
      }

      setUsernameStatus('checking');
      try {
        const response = await axios.get(`http://localhost:8000/check-username?username=${username}`);
        setUsernameStatus(response.data.available ? 'available' : 'taken');
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameStatus(null);
      }
    }, 500),
    []
  );

  // Debounced email check
  const checkEmail = useCallback(
    debounce(async (email) => {
      if (!email || !isValidEmail(email)) {
        setEmailStatus(null);
        return;
      }

      setEmailStatus('checking');
      try {
        const response = await axios.get(`http://localhost:8000/check-email?email=${email}`);
        setEmailStatus(response.data.available ? 'available' : 'taken');
      } catch (error) {
        console.error("Error checking email:", error);
        setEmailStatus(null);
      }
    }, 500),
    []
  );

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  // Enhanced password validation
  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (password.length > 128) return 'Password must be less than 128 characters';
    if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  // Handle date input change (convert from YYYY-MM-DD to DD/MM/YYYY)
  const handleDateChange = (e) => {
    const inputDate = e.target.value; // This comes in YYYY-MM-DD format from HTML input
    const formattedDate = formatDateToDDMMYYYY(inputDate);
    setFormData(prev => ({ ...prev, dob: formattedDate }));
    
    // Clear date error when user changes date
    if (errors.dob) {
      setErrors(prev => ({ ...prev, dob: '' }));
    }
  };

  // Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long';
    }
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (usernameStatus === 'taken') {
      newErrors.username = 'Username is already taken';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (emailStatus === 'taken') {
      newErrors.email = 'Email is already registered';
    }
    
    // Confirm email validation
    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }
    
    // Date of birth validation (DD/MM/YYYY format)
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else if (!isValidDDMMYYYY(formData.dob)) {
      newErrors.dob = 'Please enter a valid date in DD/MM/YYYY format';
    } else {
      const age = calculateAge(formData.dob);
      if (age === null) {
        newErrors.dob = 'Invalid date of birth';
      } else if (age < 13) {
        newErrors.dob = 'You must be at least 13 years old to register';
      } else if (age > 120) {
        newErrors.dob = 'Please enter a valid date of birth';
      }
    }
    
    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if async validations are still pending
    if (usernameStatus === 'checking' || emailStatus === 'checking') {
      alert('Please wait for validation to complete');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format data to match backend expectations
      // Convert DD/MM/YYYY back to YYYY-MM-DD for backend
      const dobForBackend = formatDateToYYYYMMDD(formData.dob);
      
      const signupData = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        confirmEmail: formData.confirmEmail,
        dob: dobForBackend, // Send in YYYY-MM-DD format to backend
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      await signup(signupData);
      
      // Show success and redirect
      alert('🎉 Account created successfully! Please log in.');
      navigate('/login');
      
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors from Pydantic
          const backendErrors = {};
          error.response.data.detail.forEach(err => {
            const field = err.loc[err.loc.length - 1];
            backendErrors[field] = err.msg;
          });
          setErrors(backendErrors);
        } else {
          alert("Signup failed: " + error.response.data.detail);
        }
      } else {
        alert("Signup failed: " + (error.message || 'Unknown error occurred'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Trigger availability checks
    if (name === 'username') {
      checkUsername(value);
    } else if (name === 'email') {
      checkEmail(value);
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      checkUsername.cancel && checkUsername.cancel();
      checkEmail.cancel && checkEmail.cancel();
    };
  }, [checkUsername, checkEmail]);

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className={authStyles.authContainer}>
      <div className={authStyles.authCard} style={{ maxWidth: '520px' }}>
        <h1 className={authStyles.authTitle}>Create Your Account</h1>
        <p className={authStyles.authSubtitle}>Join us today and start your journey</p>
        
        {/* Progress bar */}
        <div className={styles.formProgress}>
          <div 
            className={styles.formProgressBar} 
            style={{ width: `${formProgress}%` }}
          />
        </div>
        
        <form onSubmit={handleSubmit} className={authStyles.authForm}>
          {/* Full Name */}
          <div className={authStyles.inputGroup}>
            <label className={authStyles.inputLabel}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={authStyles.inputField}
              placeholder="Enter your full name"
              required
            />
            {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
          </div>

          {/* Username */}
          <div className={authStyles.inputGroup}>
            <label className={authStyles.inputLabel}>Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={authStyles.inputField}
                placeholder="Choose a unique username"
                required
              />
              {usernameStatus === 'checking' && (
                <span className={styles.checking}>Checking...</span>
              )}
              {usernameStatus === 'taken' && (
                <span className={styles.taken}>Username taken</span>
              )}
              {usernameStatus === 'available' && (
                <span className={styles.available}>Available</span>
              )}
            </div>
            {errors.username && <span className={styles.error}>{errors.username}</span>}
          </div>

          {/* Email */}
          <div className={authStyles.inputGroup}>
            <label className={authStyles.inputLabel}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={authStyles.inputField}
                placeholder="Enter your email address"
                required
              />
              {emailStatus === 'checking' && (
                <span className={styles.checking}>Checking...</span>
              )}
              {emailStatus === 'taken' && (
                <span className={styles.taken}>Email already registered</span>
              )}
              {emailStatus === 'available' && (
                <span className={styles.available}>Available</span>
              )}
            </div>
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          {/* Confirm Email */}
          <div className={authStyles.inputGroup}>
            <label className={authStyles.inputLabel}>Confirm Email</label>
            <input
              type="email"
              name="confirmEmail"
              value={formData.confirmEmail}
              onChange={handleChange}
              className={authStyles.inputField}
              placeholder="Confirm your email address"
              required
            />
            {errors.confirmEmail && (
              <span className={styles.error}>{errors.confirmEmail}</span>
            )}
          </div>

          {/* Date of Birth - Shows DD/MM/YYYY but uses HTML date input */}
          <div className={authStyles.inputGroup}>
            <label className={authStyles.inputLabel}>
              Date of Birth
              {formData.dob && (
                <span style={{ 
                  color: '#94a3b8', 
                  fontWeight: 'normal', 
                  fontSize: '14px',
                  marginLeft: '8px'
                }}>
                  ({formData.dob})
                </span>
              )}
            </label>
            <input
              type="date"
              name="dob"
              value={formatDateToYYYYMMDD(formData.dob)} // Convert DD/MM/YYYY to YYYY-MM-DD for HTML input
              onChange={handleDateChange}
              className={authStyles.inputField}
              max={getTodayYYYYMMDD()} // Set max to today's date
              required
            />
            {errors.dob && <span className={styles.error}>{errors.dob}</span>}
            <div className={styles.passwordHint}>
              Your date will be displayed as DD/MM/YYYY
            </div>
          </div>

          {/* Password */}
          <div className={authStyles.inputGroup}>
            <label className={authStyles.inputLabel}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={authStyles.inputField}
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            {errors.password && <span className={styles.error}>{errors.password}</span>}
            
            {/* Password strength indicator */}
            {formData.password && (
              <div className={styles.passwordStrength}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.strengthBar} ${
                      i < passwordStrength 
                        ? passwordStrength <= 2 ? styles.weak 
                        : passwordStrength <= 3 ? styles.medium 
                        : styles.strong
                        : ''
                    }`}
                  />
                ))}
              </div>
            )}
            
            <div className={styles.passwordHint}>
              At least 8 characters with letters and numbers
            </div>
          </div>

          {/* Confirm Password */}
          <div className={authStyles.inputGroup}>
            <label className={authStyles.inputLabel}>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={authStyles.inputField}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && (
              <span className={styles.error}>{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms and conditions */}
          <div className={authStyles.inputGroup}>
            <label className={styles.checkbox}>
              <input type="checkbox" required />
              <span className={styles.checkmark}></span>
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button 
            type="submit" 
            className={`${authStyles.submitButton} ${isSubmitting ? styles.loading : ''}`}
            disabled={isSubmitting || usernameStatus === 'checking' || emailStatus === 'checking'}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className={authStyles.authFooter}>
          Already have an account?{' '}
          <a href="/login" className={authStyles.authLink}>Sign in here</a>
        </p>
      </div>
    </div>
  );
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}