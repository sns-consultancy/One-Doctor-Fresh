/**
 * Registers a new user by sending their data to the backend.
 * @param {Object} userData - The registration data (e.g., { email, password, name })
 * @returns {Promise<Object>} - The created user or success message
 * @throws {Error} - If the request fails
 */
export async function registerUser(userData) {
  // Make the POST request to your API
  const response = await fetch("http://127.0.0.1:5000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });

  // Read raw response text
  const text = await response.text();

  // If not OK, try to parse the error and throw
  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;

    try {
      const errorData = JSON.parse(text);
      if (errorData?.error) {
        errorMsg = errorData.error;
      }
    } catch {
      // Fallback if response is not JSON
      errorMsg = `Error ${response.status}: ${text.slice(0, 100)}`;
    }

    throw new Error(errorMsg);
  }

  // Parse and return JSON on success
  return JSON.parse(text);
}
