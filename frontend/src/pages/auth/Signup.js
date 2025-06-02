import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import styles from '../../styles/Signup.module.css';
import authStyles from '../../styles/Auth.module.css';
import axios from 'axios';


const FormField = React.memo(({ name, type = 'text', placeholder, children, hint, value, onChange, error }) => (
  <div className={authStyles.inputGroup}>
    <label className={authStyles.inputLabel}>
      {name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        key={name} 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={authStyles.inputField}
        placeholder={placeholder}
        autoComplete={name === 'password' ? 'new-password' : 'off'}
        spellCheck="false"
        required
      />
      {children}
    </div>
    {error && <span className={styles.error}>{error}</span>}
    {hint && <div className={styles.hint}>{hint}</div>}
  </div>
));

// Status indicator to check availability of email and username
const StatusIndicator = React.memo(({ status }) => {
  if (!status) return null;
  
  const configs = {
    checking: { text: 'Checking...', class: styles.checking },
    available: { text: 'Available', class: styles.available },
    taken: { text: 'Taken', class: styles.taken }
  };
  
  const config = configs[status];
  return <span className={config.class}>{config.text}</span>;
});

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  //Form components
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', confirmEmail: '', 
    password: '', confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const timeoutRefs = useRef({});

  //Debounce function to avoid spamming API
  const debounce = useCallback((func, delay, key) => {
    return (...args) => {
      clearTimeout(timeoutRefs.current[key]);
      timeoutRefs.current[key] = setTimeout(() => func(...args), delay);
    };
  }, []);

  const checkUsername = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    
    setUsernameStatus('checking');
    try {
      const res = await axios.get(`http://localhost:8000/check-username?username=${username}`);
      setUsernameStatus(res.data.available ? 'available' : 'taken');
    } catch (error) {
      console.error('Username check failed:', error);
      setUsernameStatus(null);
    }
  }, []);

  const checkEmail = useCallback(async (email) => {
    if (!email || !email.includes('@') || email.length < 5) {
      setEmailStatus(null);
      return;
    }
    
    setEmailStatus('checking');
    try {
      const res = await axios.get(`http://localhost:8000/check-email?email=${email}`);
      setEmailStatus(res.data.available ? 'available' : 'taken');
    } catch (error) {
      console.error('Email check failed:', error);
      setEmailStatus(null);
    }
  }, []);

  const debouncedUsernameCheck = useMemo(
    () => debounce(checkUsername, 1000, 'username'),
    [debounce, checkUsername]
  );

  const debouncedEmailCheck = useMemo(
    () => debounce(checkEmail, 1000, 'email'),
    [debounce, checkEmail]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    //Clear error sign when user starts typing again
    setErrors(prev => prev[name] ? { ...prev, [name]: '' } : prev);
    
    // Check for availability
    if (name === 'username') {
      if (value.length >= 3) {
        debouncedUsernameCheck(value);
      } else {
        setUsernameStatus(null);
      }
    }
    
    if (name === 'email') {
      if (value.includes('@') && value.length > 5) {
        debouncedEmailCheck(value);
      } else {
        setEmailStatus(null);
      }
    }
  }, [debouncedUsernameCheck, debouncedEmailCheck]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name too short';
    
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username too short';
    else if (usernameStatus === 'taken') newErrors.username = 'Username taken';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email';
    else if (emailStatus === 'taken') newErrors.email = 'Email already registered';
    
    if (formData.email !== formData.confirmEmail) newErrors.confirmEmail = 'Emails do not match';
    
    if (formData.password.length < 8) newErrors.password = 'Password must be 8+ characters';
    else if (!/[a-zA-Z]/.test(formData.password)) newErrors.password = 'Must contain letters';
    else if (!/\d/.test(formData.password)) newErrors.password = 'Must contain numbers';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, usernameStatus, emailStatus]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    //Don't submit form if validation fails or still checking availability
    if (!validateForm() || usernameStatus === 'checking' || emailStatus === 'checking') return;

    setIsSubmitting(true);
    try {
      await signup(formData);
      alert('Account created successfully!');
      navigate('/login');
    } catch (error) {
      if (error.response?.data?.detail) {
        Array.isArray(error.response.data.detail) 
          ? setErrors(error.response.data.detail.reduce((acc, err) => ({ 
              ...acc, [err.loc[err.loc.length - 1]]: err.msg 
            }), {}))
          : alert("Signup failed: " + error.response.data.detail);
      } else {
        alert("Signup failed: " + (error.message || 'Unknown error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, usernameStatus, emailStatus, signup, formData, navigate]);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  //Progress percentage of form completion
  const progress = useMemo(() => 
    Object.values(formData).filter(v => v.trim()).length / 6 * 100,
    [formData]
  );

  const passwordToggleButton = useMemo(() => (
    <button
      type="button"
      className={styles.togglePassword}
      onClick={togglePassword}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      
      {showPassword ? (
        // eye slash icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        </svg>
      ) : (
        // regular eye icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  ), [showPassword, togglePassword]);

  return (
    <div className={authStyles.authContainer}>
      <div className={authStyles.authCard} style={{ maxWidth: '520px' }}>
        <h1 className={authStyles.authTitle}>Create Your Account</h1>
        <p className={authStyles.authSubtitle}>Join us today and start your journey</p>
        
        {/* Progress bar */}
        <div className={styles.formProgress}>
          <div className={styles.formProgressBar} style={{ width: `${progress}%` }} />
        </div>
        
        <form onSubmit={handleSubmit} className={authStyles.authForm}>
          <FormField 
            name="fullName" 
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          
          <FormField 
            name="username" 
            placeholder="Enter a username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          >
            <StatusIndicator status={usernameStatus} />
          </FormField>
          
          <FormField 
            name="email" 
            type="email" 
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          >
            <StatusIndicator status={emailStatus} />
          </FormField>
          
          <FormField 
            name="confirmEmail" 
            type="email" 
            placeholder="Confirm your email address"
            value={formData.confirmEmail}
            onChange={handleChange}
            error={errors.confirmEmail}
          />
          
          <FormField 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="Create a strong password"
            hint="At least 8 characters with letters and numbers"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          >
            {passwordToggleButton}
          </FormField>
          
          <FormField 
            name="confirmPassword" 
            type="password" 
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          {/* Terms checkbox */}
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
            disabled={isSubmitting || usernameStatus === 'taken' || emailStatus === 'taken'}
          >
            {isSubmitting ? 'Creating Account...' : 
             (usernameStatus === 'taken' || emailStatus === 'taken') ? 'Fix errors to continue' : 'Create Account'}
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

//milestone 1