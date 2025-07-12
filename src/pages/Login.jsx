import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import styles from './Signup.module.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessage('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Call loginUser and await the response
      await loginUser(username, password);

      setMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/home'), 1000);
    } catch (err) {
      console.error('Login error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setMessage('Cannot connect to the server. Please check your network or API URL.');
      } else {
        setMessage(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          className={styles.input}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          disabled={loading}
        />
        <input
          className={styles.input}
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          disabled={loading}
        />
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && (
        <p className={styles.message}>
          {message}
        </p>
      )}
      <p className={styles.signupOption}>
        Don't have an account?{' '}
        <Link to="/signup" className={styles.signupLink}>Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
