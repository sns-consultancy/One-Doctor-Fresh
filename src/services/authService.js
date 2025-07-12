const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

/**
 * Helper function to get common request headers
 * @returns {Object} - Headers object with API key if available
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  
  return headers;
};

/**
 * Login user with username and password
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise} - Promise with the login response
 */
export const loginUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store authentication data
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userId', data.username || data.user_id);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Promise with the registration response
 */
export const registerUser = async (userData) => {
  if (!userData.username || !userData.password) {
    throw new Error('Username and password are required');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  // Optionally call a logout API endpoint if your backend requires it
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get the current user's ID
 * @returns {string|null} - User ID if authenticated, null otherwise
 */
export const getCurrentUserId = () => {
  return localStorage.getItem('userId');
};