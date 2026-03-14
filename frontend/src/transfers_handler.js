const API_URL = 'http://localhost:3000/api';

async function setupTransfers() {
    const sourceContainer = document.getElementById('source-accounts');
    const targetContainer = document.getElementById('target-accounts');
    const form = document.getElementById('transfer-form');
    const userName = document.getElementById('user-name');

    try {
        // Load source accounts
        const accResponse = await fetch(`${API_URL}/accounts`);
        const accounts = await accResponse.json();

        sourceContainer.innerHTML = accounts.map(acc => `
            <label class="relative flex flex-col p-4 bg-slate-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-white hover:border-primary transition-all has-[:checked]:border-primary has-[:checked]:bg-white group shadow-sm">
                <input type="radio" name="sourceAccount" value="${acc.id}" class="hidden" required ${acc.account_type === 'Cuenta Corriente' ? 'checked' : ''}>
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-black text-primary uppercase tracking-widest">${acc.account_type}</span>
                    <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">check_circle</span>
                </div>
                <p class="text-lg font-black text-slate-800">${acc.account_number}</p>
                <p class="text-sm font-bold text-slate-400 mt-1">Saldo: $${parseFloat(acc.balance).toLocaleString('es-CL')}</p>
            </label>
        `).join('');

        // Load targeted contacts
        const contactResponse = await fetch(`${API_URL}/contacts`);
        const contacts = await contactResponse.json();

        targetContainer.innerHTML = contacts.map(contact => `
            <label class="relative flex flex-col p-4 bg-slate-50 border-2 border-transparent rounded-2xl cursor-pointer hover:bg-white hover:border-primary transition-all has-[:checked]:border-primary has-[:checked]:bg-white group shadow-sm">
                <input type="radio" name="targetContact" value="${contact.id}" class="hidden" required>
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-black text-primary uppercase tracking-widest">${contact.bank}</span>
                    <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">account_circle</span>
                </div>
                <p class="text-md font-black text-slate-800">${contact.name}</p>
                <p class="text-xs font-bold text-slate-400 mt-1">CC: ${contact.account_number}</p>
                <p class="text-[10px] text-slate-300 mt-1">${contact.rut}</p>
            </label>
        `).join('');

        const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Alex Thompson' };
        userName.textContent = user.full_name;

        // Form handling
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const sourceAccountId = form.querySelector('input[name="sourceAccount"]:checked').value;
            const amount = parseFloat(document.getElementById('amount').value);

            const payload = {
                sourceAccountId,
                amount,
                description: `Transferencia a contacto externo`,
                isExternal: true
            };

            const res = await fetch(`${API_URL}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.success) {
                alert('¡Transferencia Realizada!');
                window.location.href = '/accounts.html';
            } else {
                alert('Error: ' + result.message);
            }
        });

    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', setupTransfers);

document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = '/login.html';
});
