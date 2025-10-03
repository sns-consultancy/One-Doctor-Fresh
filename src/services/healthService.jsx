const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

/**
 * Helper function to get common request headers with auth token
 * @returns {Object} - Headers object with auth token if available
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  };
  
  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Get medical history for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise} - Promise with the medical history data
 */
export const getMedicalHistory = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/health/medical-history/${userId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 404) {
        // No medical history found is not an error for us
        return { status: 'success', data: null };
      }
      
      // Check for unauthorized or expired token
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token'); // Clear invalid token
        window.location.href = '/login'; // Redirect to login
        throw new Error('Your session has expired. Please log in again.');
      }
      
      throw new Error(data.message || 'Error fetching medical history');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching medical history:', error);
    throw error;
  }
};

/**
 * Save medical history for a user
 * @param {Object} data - The medical history data
 * @returns {Promise} - Promise with the response
 */
export const saveMedicalHistory = async (data) => {
  if (!data || !data.user_id) {
    throw new Error('Invalid data or missing user ID');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/health/medical-history`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Check for unauthorized or expired token
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token'); // Clear invalid token
        window.location.href = '/login'; // Redirect to login
        throw new Error('Your session has expired. Please log in again.');
      }
      
      throw new Error(responseData.message || 'Failed to save medical history');
    }
    
    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Delete medical history for a user
 * @param {string} userId - The user ID
 * @returns {Promise} - Promise with the response
 */
export const deleteMedicalHistory = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/health/medical-history/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (response.status === 204) {
      return { status: 'success', message: 'Medical history deleted successfully' };
    }
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Check for unauthorized or expired token
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Your session has expired. Please log in again.');
      }
      
      throw new Error(responseData.message || 'Failed to delete medical history');
    }
    
    return responseData;
  } catch (error) {
    console.error('Error deleting medical history:', error);
    throw error;
  }
};