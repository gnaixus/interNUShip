import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import styles from './Login.module.css';
import authStyles from '../auth/Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className={authStyles.authContainer}>
      <div className={authStyles.authCard}>
        <h1 className={authStyles.authTitle}>Welcome Back</h1>
        
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
            Log In
          </button>
        </form>

        <p className={authStyles.authFooter}>
          Don't have an account?{' '}
          <a href="/signup" className={authStyles.authLink}>Sign up</a>
        </p>
      </div>
    </div>
  );
}