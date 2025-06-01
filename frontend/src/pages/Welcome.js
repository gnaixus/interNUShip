// frontend/src/pages/Welcome.js
import { useNavigate } from 'react-router-dom';
import authStyles from '../auth/Auth.module.css';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className={authStyles.authContainer}>
      <div className={authStyles.authCard}>
        <h1 className={authStyles.authTitle}>Welcome to InterNUShip</h1>
        
        <div className={authStyles.authForm}>
          <button 
            onClick={() => navigate('/login')}
            className={authStyles.submitButton}
            style={{marginBottom: '1rem'}}
          >
            Login
          </button>
          
          <button 
            onClick={() => navigate('/guest')} 
            className={authStyles.submitButton}
            style={{background: '#4a5568'}}
          >
            Continue as Guest
          </button>
        </div>

        <p className={authStyles.authFooter}>
          New user?{' '}
          <a href="/signup" className={authStyles.authLink}>Create account</a>
        </p>
      </div>
    </div>
  );
}