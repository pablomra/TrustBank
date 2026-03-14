import { checkAuth, getUser, logout } from './auth.js';

checkAuth();

const API_URL = 'http://localhost:3000/api';
const user = getUser();

const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const userInitialsEl = document.getElementById('user-initials');
const paymentsListEl = document.getElementById('payments-list');

if (user) {
    userNameEl.textContent = user.fullName;
    userInitialsEl.textContent = user.fullName.split(' ').map(n => n[0]).join('');
}

logoutBtn.addEventListener('click', logout);

async function loadPayments() {
    try {
        const response = await fetch(`${API_URL}/payments?userId=${user.id}`);
        const payments = await response.json();
        
        paymentsListEl.innerHTML = payments.map(p => `
            <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary/50 transition-all cursor-pointer">
                <div class="flex items-center gap-4">
                    <div class="size-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <span class="material-symbols-outlined text-emerald-600">bolt</span>
                    </div>
                    <div>
                        <h4 class="font-bold">${p.service_name}</h4>
                        <p class="text-xs text-slate-500">Vence el ${new Date(p.due_date).toLocaleDateString()} • ${p.auto_pay ? 'Auto-pago activado' : 'Pago manual'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-black text-slate-900">$${parseFloat(p.amount).toLocaleString('es-CL')}</div>
                    <button class="text-xs font-bold text-primary hover:underline">${p.status === 'pending' ? 'Pagar Ahora' : 'Pagado'}</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

loadPayments();
