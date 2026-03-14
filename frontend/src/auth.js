/* frontend/src/auth.js */

const API_URL = 'http://localhost:3000/api';

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('bank_session', 'true');
      localStorage.setItem('bank_user', JSON.stringify(data.user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('bank_session');
  localStorage.removeItem('bank_user');
  window.location.href = '/login.html';
};

export const isAuthenticated = () => {
  return localStorage.getItem('bank_session') === 'true';
};

export const checkAuth = () => {
  const publicPages = ['/login.html', '/index.html', '/'];
  const isPublicHeader = publicPages.includes(window.location.pathname);
  
  if (!isAuthenticated() && !isPublicHeader) {
    window.location.href = '/login.html';
  } else if (isAuthenticated() && isPublicHeader) {
    // If logged in, don't show login page
    // window.location.href = '/accounts.html';
  }
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem('bank_user'));
};
