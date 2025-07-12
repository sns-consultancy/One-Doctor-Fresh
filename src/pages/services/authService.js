export async function loginUser(username, password) {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed.');
  }

  return response.json();
}
