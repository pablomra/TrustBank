import { login, checkAuth } from './auth.js';

// Pre-check if already logged in
checkAuth();

const loginForm = document.getElementById('login-form');
const errorAlert = document.getElementById('error-alert');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    errorAlert.classList.add('hidden');
    
    const success = await login(username, password);
    if (success) {
        window.location.href = '/accounts.html';
    } else {
        errorAlert.textContent = 'Usuario o contraseña incorrectos';
        errorAlert.classList.remove('hidden');
    }
});
