const API_URL = 'http://localhost:3000/api';

async function loadCards() {
    const container = document.getElementById('cards-container');
    const userName = document.getElementById('user-name');

    try {
        const response = await fetch(`${API_URL}/cards`);
        const cards = await response.json();

        container.innerHTML = cards.map(card => `
            <div class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-8 relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                
                <div class="flex justify-between items-start relative">
                    <div class="flex flex-col gap-2">
                        <span class="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full w-fit tracking-wider uppercase">${card.card_type}</span>
                        <div class="mt-4">
                            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Número de Tarjeta</p>
                            <p class="text-2xl font-black text-slate-800 mt-1">${card.card_number}</p>
                        </div>
                    </div>
                    <div class="text-slate-300">
                        <span class="material-symbols-outlined text-4xl">contactless</span>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex justify-between items-end">
                        <div>
                            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Cupo Utilizado</p>
                            <p class="text-2xl font-black text-primary">$${parseFloat(card.used_amount).toLocaleString('es-CL')}</p>
                        </div>
                        <p class="text-slate-400 text-[10px] font-bold">MONTO DISPONIBLE: $${(parseFloat(card.credit_limit) - parseFloat(card.used_amount)).toLocaleString('es-CL')}</p>
                    </div>
                    
                    <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div class="bg-primary h-full rounded-full transition-all duration-1000" style="width: ${(card.used_amount / card.credit_limit) * 100}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Gastos Facturados</p>
                        <p class="text-lg font-black text-slate-800">$${parseFloat(card.billed_amount).toLocaleString('es-CL')}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p class="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Por Facturar</p>
                        <p class="text-lg font-black text-slate-800">$${parseFloat(card.unbilled_amount).toLocaleString('es-CL')}</p>
                    </div>
                </div>

                <div class="flex gap-4">
                    <div class="flex-1 bg-slate-50 p-5 rounded-2xl border border-dashed border-slate-200">
                        <p class="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Cupo Total</p>
                        <p class="text-xl font-black text-slate-800">$${parseFloat(card.credit_limit).toLocaleString('es-CL')}</p>
                    </div>
                    <div class="flex-1 bg-slate-50 p-5 rounded-2xl border border-dashed border-slate-200">
                        <p class="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Vencimiento</p>
                        <p class="text-xl font-black text-slate-800">${card.expiry_date}</p>
                    </div>
                </div>

                <button class="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]">
                    Pagar Tarjeta
                </button>
            </div>
        `).join('');

        const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Alex Thompson' };
        userName.textContent = user.full_name;

    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadCards);

document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = '/login.html';
});
