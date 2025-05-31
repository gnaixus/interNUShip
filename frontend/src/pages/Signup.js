import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import styles from './Signup.module.css';
import authStyles from '../auth/Auth.module.css';

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      navigate("/login");
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
  };

  return (
    <div className={authStyles.authContainer}>
      <div className={authStyles.authCard}>
        <h1 className={`${authStyles.authTitle} ${styles.signupHeader}`}>Create Account</h1>
        <p className={styles.signupSubtitle}>Join us to get started</p>
        
        <form onSubmit={handleSubmit} className={authStyles.authForm}>
          <div className={authStyles.inputGroup}>
            <label htmlFor="email" className={authStyles.inputLabel}>Email</label>
            <input
              id="email"
              type="email"
              className={authStyles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={authStyles.inputGroup}>
            <label htmlFor="password" className={authStyles.inputLabel}>Password</label>
            <input
              id="password"
              type="password"
              className={authStyles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength="6"
              required
            />
          </div>

          <button type="submit" className={authStyles.submitButton}>
            Sign Up
          </button>
        </form>

        <p className={authStyles.authFooter}>
          Already have an account?{' '}
          <a href="/login" className={authStyles.authLink}>Log in</a>
        </p>
      </div>
    </div>
  );
}