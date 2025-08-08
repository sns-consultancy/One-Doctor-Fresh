import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import styles from './Signup.module.css';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      setMessage('Please fill all required fields and select a role.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      await registerUser(userData);

      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      // Handle case when the server returns HTML instead of JSON
      if (err.response && err.response.status === 404) {
        setMessage('The registration service is unavailable. Please try again later.');
      } else if (err.message && err.message.includes('Unexpected token')) {
        setMessage('Server error: Received invalid response. Please contact support.');
      } else {
        setMessage(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          className={styles.input}
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          className={styles.input}
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          className={styles.input}
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />
        <select
          className={styles.input}
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="hospital">Hospital</option>
        </select>
        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      {message && (
        <p className={
          message.includes('successful') ? styles.successMessage : styles.errorMessage
        }>
          {message}
        </p>
      )}
      <p className={styles.loginOption}>
        Already have an account?{' '}
        <Link to="/login" className={styles.loginLink}>Log in</Link>
      </p>
    </div>
  );
}

export default Signup;
