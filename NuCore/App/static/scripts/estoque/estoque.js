//* =========================================
//* Variaveis Globais
//* =========================================
let pharma = [];
let stock = [];


//* =========================================
//* Renderização
//* =========================================

let inventory = [
    { id: 1, name: "Technetium-99m", code: "TC-99M", lote: "TC240512", qty: 1240, unit: "mCi", expiry: "2026-06-12", daysLeft: 5, status: "critical", type: "SPECT" },
    { id: 2, name: "Fluorine-18", code: "F-18", lote: "F240603", qty: 680, unit: "mCi", expiry: "2026-06-09", daysLeft: 2, status: "critical", type: "PET" },
    { id: 3, name: "Iodine-131", code: "I-131", lote: "I240528", qty: 450, unit: "mCi", expiry: "2026-07-15", daysLeft: 38, status: "normal", type: "SPECT" },
    { id: 4, name: "Gallium-68", code: "GA-68", lote: "GA240605", qty: 210, unit: "mCi", expiry: "2026-06-11", daysLeft: 4, status: "critical", type: "PET" },
    { id: 5, name: "Lutécio-177", code: "LU-177", lote: "LU240501", qty: 85, unit: "mCi", expiry: "2026-08-20", daysLeft: 74, status: "normal", type: "Terapia" },
];

function getStatusBadge(status) {
    if (status === "critical") return `<span class="px-4 py-1 text-xs font-medium bg-rose-100 text-rose-700 rounded-3xl">Crítico</span>`;
    if (status === "warning") return `<span class="px-4 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-3xl">Atenção</span>`;
    return `<span class="px-4 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-3xl">Normal</span>`;
}

function renderTable(filtered = inventory) {
    const tbody = document.getElementById('stock-table');
    tbody.innerHTML = '';

    filtered.forEach(item => {
        const row = document.createElement('tr');
        row.className = `table-row cursor-pointer ${item.daysLeft <= 7 ? 'bg-rose-50' : ''}`;
        row.innerHTML = `
                <td class="px-6 py-5 font-medium">${item.name}</td>
                <td class="px-6 py-5 font-mono text-sm">${item.lote}</td>
                <td class="px-6 py-5 text-slate-500">${item.code}</td>
                <td class="px-6 py-5 text-center font-semibold">${item.qty} <span class="text-xs">${item.unit}</span></td>
                <td class="px-6 py-5 text-center font-mono">${item.expiry}</td>
                <td class="px-6 py-5 text-center">
                    <span class="${item.daysLeft <= 7 ? 'text-rose-600 font-medium' : 'text-slate-600'}">${item.daysLeft} dias</span>
                </td>
                <td class="px-6 py-5 text-center">${getStatusBadge(item.status)}</td>
                <td class="px-6 py-5 text-center">
                    <i onclick="event.stopImmediatePropagation(); showPreview(${item.id});" class="fa-solid fa-eye text-cyan-500 hover:text-cyan-600"></i>
                </td>
            `;
        row.onclick = () => showPreview(item.id);
        tbody.appendChild(row);
    });
}

function filterTable() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;

    let filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.lote.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term)
    );

    if (statusFilter) {
        filtered = filtered.filter(item => item.status === statusFilter);
    }

    renderTable(filtered);
}

//* =========================================
//* Inicialização
//* =========================================

async function loadItens() {
    const resultP = await crudOperation('GET', 'pharma');
    const resultS = await crudOperation('GET', 'stock');
    if (resultP && resultS) {
        pharma = resultP;
        stock = resultS
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadItens();
    renderTable();
});