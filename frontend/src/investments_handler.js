import { checkAuth, getUser, logout } from './auth.js';

checkAuth();

const user = getUser();
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const userInitialsEl = document.getElementById('user-initials');

if (user) {
    userNameEl.textContent = user.fullName;
    userInitialsEl.textContent = user.fullName.split(' ').map(n => n[0]).join('');
}

logoutBtn.addEventListener('click', logout);
