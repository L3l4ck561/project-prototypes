// Sample Data
let inventory = [
    {
        id: 1,
        name: "Technetium-99m",
        code: "TC-99M",
        quantity: 1240,
        unit: "mCi",
        minStock: 800,
        expiring: [
            { batch: "TC240512", expiry: "2026-06-12", qty: 320 },
            { batch: "TC240519", expiry: "2026-06-19", qty: 410 }
        ],
        usedWeek: 680,
        type: "SPECT"
    },
    {
        id: 2,
        name: "Fluorine-18",
        code: "F-18",
        quantity: 680,
        unit: "mCi",
        minStock: 500,
        expiring: [
            { batch: "F240603", expiry: "2026-06-09", qty: 180 }
        ],
        usedWeek: 920,
        type: "PET"
    },
    {
        id: 3,
        name: "Iodine-131",
        code: "I-131",
        quantity: 450,
        unit: "mCi",
        minStock: 300,
        expiring: [
            { batch: "I240528", expiry: "2026-07-15", qty: 450 }
        ],
        usedWeek: 120,
        type: "SPECT"
    },
    {
        id: 4,
        name: "Gallium-68",
        code: "GA-68",
        quantity: 210,
        unit: "mCi",
        minStock: 300,
        expiring: [
            { batch: "GA240605", expiry: "2026-06-11", qty: 210 }
        ],
        usedWeek: 340,
        type: "PET"
    }
]

let notifications = [
    {
        time: "há 12 min",
        action: "Saída",
        item: "Technetium-99m",
        qty: "-240 mCi",
        batch: "TC240512"
    },
    {
        time: "há 47 min",
        action: "Entrada",
        item: "Fluorine-18",
        qty: "+400 mCi",
        batch: "F240603"
    },
    {
        time: "há 2h",
        action: "Saída",
        item: "Gallium-68",
        qty: "-150 mCi",
        batch: "GA240605"
    }
]

// Render Expiring Items
function renderExpiring() {
    const container = document.getElementById('expiring-list')
    container.innerHTML = ''

    const sorted = [...inventory].sort((a, b) => {
        const earliestA = a.expiring[0] ? new Date(a.expiring[0].expiry) : new Date(9999, 12, 31)
        const earliestB = b.expiring[0] ? new Date(b.expiring[0].expiry) : new Date(9999, 12, 31)
        return earliestA - earliestB
    })

    sorted.forEach(item => {
        if (!item.expiring.length) return

        const isUrgent = item.expiring[0].expiry <= '2026-06-15'

        const div = document.createElement('div')
        div.className = `list-item flex items-center gap-4 p-4 rounded-2xl cursor-pointer border border-transparent 
                             ${isUrgent ? 'border-amber-300 bg-amber-50' : 'hover:bg-slate-50'}`
        div.innerHTML = `
                <div class="flex-1">
                    <div class="font-medium text-slate-800">${item.name}</div>
                    <div class="text-xs text-slate-500">${item.expiring[0].batch}</div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium ${isUrgent ? 'text-amber-600' : 'text-slate-700'}">
                        ${item.expiring[0].qty} ${item.unit}
                    </div>
                    <div class="text-xs ${isUrgent ? 'text-amber-600' : 'text-slate-500'}">
                        ${item.expiring[0].expiry}
                    </div>
                </div>
            `
        div.onclick = () => showPreview(item)
        container.appendChild(div)
    })
}

// Render Stock List
function renderStockList(filter = '') {
    const container = document.getElementById('stock-list')
    container.innerHTML = ''

    const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.code.toLowerCase().includes(filter.toLowerCase())
    )

    filtered.forEach(item => {
        const isCritical = item.quantity <= item.minStock

        const div = document.createElement('div')
        div.className = `list-item flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer border-l-4 
                             ${isCritical ? 'border-rose-400 bg-rose-50' : 'border-transparent hover:bg-slate-50'}`
        div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div>
                        <div class="font-medium text-slate-800">${item.name}</div>
                        <div class="text-xs text-slate-500">${item.code} • ${item.type}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-semibold ${isCritical ? 'text-rose-600' : 'text-slate-800'}">
                        ${item.quantity}
                    </div>
                    <div class="text-xs text-slate-500">${item.unit}</div>
                </div>
            `
        div.onclick = () => showPreview(item)
        container.appendChild(div)
    })
}

// Charts
let stockChart, typeChart

function createCharts() {
    // Stock vs Used
    const ctx1 = document.getElementById('donut-stock')
    if (stockChart) stockChart.destroy()

    stockChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Em Estoque', 'Utilizado na Semana'],
            datasets: [{
                data: [3120, 2060],
                backgroundColor: ['#22d3ee', '#f43f5e'],
                borderColor: '#ffffff',
                borderWidth: 6,
                cutout: '78%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.raw + ' mCi'
                    }
                }
            }
        }
    })

    // Type distribution
    const ctx2 = document.getElementById('donut-type')
    if (typeChart) typeChart.destroy()

    typeChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['SPECT', 'PET', 'Terapia'],
            datasets: [{
                data: [1690, 890, 540],
                backgroundColor: ['#67e8f9', '#14b8a6', '#a78bfa'],
                borderColor: '#ffffff',
                borderWidth: 6,
                cutout: '78%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#475569',
                        usePointStyle: true,
                        padding: 20,
                        boxWidth: 8
                    }
                }
            }
        }
    })
}

function updateCharts() {
    if (stockChart) {
        stockChart.data.datasets[0].data = [
            Math.floor(Math.random() * 1500) + 2500,
            Math.floor(Math.random() * 1000) + 1500
        ]
        stockChart.update()
    }
}

// Render Notifications
function renderNotifications() {
    const container = document.getElementById('notifications-list')
    container.innerHTML = ''

    notifications.forEach(notif => {
        const div = document.createElement('div')
        div.className = 'flex gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:bg-slate-100 transition-colors'
        div.innerHTML = `
                <div class="text-xs w-16 text-slate-500 pt-0.5">${notif.time}</div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 text-xs rounded-full 
                            ${notif.action === 'Entrada'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'}">
                            ${notif.action}
                        </span>
                        <span class="font-medium text-slate-800">${notif.item}</span>
                    </div>
                    <div class="text-xs text-slate-500 mt-1">${notif.batch} • ${notif.qty}</div>
                </div>
            `
        container.appendChild(div)
    })
}

// Preview Panel
function showPreview(item) {
    const panel = document.getElementById('preview-panel')
    const content = document.getElementById('preview-content')

    content.innerHTML = `
            <div class="mb-8">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-3xl font-semibold text-slate-800">${item.name}</div>
                        <div class="text-cyan-600 font-mono text-lg">${item.code}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-5xl font-bold text-slate-800">${item.quantity}</div>
                        <div class="text-sm text-slate-500">${item.unit}</div>
                    </div>
                </div>
            </div>
            
            <div class="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-6">
                <div class="text-xs uppercase tracking-widest mb-4 text-slate-500">Lotes Ativos</div>
                ${item.expiring.map(batch => `
                    <div class="flex justify-between items-center py-4 border-b border-slate-200 last:border-none">
                        <div>
                            <div class="font-mono text-sm text-slate-700">${batch.batch}</div>
                            <div class="text-xs text-slate-500">Vence em ${batch.expiry}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold text-slate-800">${batch.qty} ${item.unit}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="bg-slate-50 border border-slate-200 rounded-3xl p-5">
                    <div class="text-slate-500 text-xs">Utilizado esta semana</div>
                    <div class="text-3xl font-semibold mt-1 text-slate-800">${item.usedWeek} ${item.unit}</div>
                </div>
                <div class="bg-slate-50 border border-slate-200 rounded-3xl p-5">
                    <div class="text-slate-500 text-xs">Estoque Mínimo</div>
                    <div class="text-3xl font-semibold mt-1 text-slate-800">${item.minStock} ${item.unit}</div>
                    ${item.quantity < item.minStock ?
            `<div class="text-rose-600 text-xs mt-2 flex items-center gap-1">
                            <span>⚠️</span> Crítico
                         </div>` : ''}
                </div>
            </div>
            
            <div class="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
                <div class="flex justify-between">
                    <div>Última atualização:</div>
                    <div class="font-mono">07/06/2026 17:45</div>
                </div>
            </div>
        `

    panel.classList.remove('hidden')
    panel.classList.add('flex')
}

function closePreview() {
    const panel = document.getElementById('preview-panel')
    panel.classList.add('hidden')
    panel.classList.remove('flex')
}

// Search
function filterItems() {
    const term = document.getElementById('search-input').value
    renderStockList(term)
}

// Toast
function showToast(message) {
    let toast = document.getElementById('toast')
    if (!toast) {
        // Create toast if not exists
        toast = document.createElement('div')
        toast.id = 'toast'
        toast.className = `hidden fixed bottom-6 right-6 bg-white border border-cyan-400 text-cyan-700 rounded-3xl px-6 py-4 flex items-center gap-3 shadow-xl`
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span id="toast-text" class="text-sm"></span>`
        document.body.appendChild(toast)
    }
    document.getElementById('toast-text').textContent = message
    toast.classList.remove('hidden')
    toast.style.transform = 'translateY(0)'

    setTimeout(() => {
        toast.style.transform = 'translateY(80px)'
        setTimeout(() => toast.classList.add('hidden'), 300)
    }, 2800)
}

// Fake actions
function newEntry() {
    showToast('Nova entrada registrada com sucesso!')
    setTimeout(() => {
        inventory[0].quantity += 200
        renderStockList(document.getElementById('search-input').value)
    }, 800)
}

function refreshDashboard() {
    showToast('Dashboard atualizado')
    createCharts()
}

function toggleNotifications() {
    showToast('Notificações abertas (demo)')
}

function viewAllMovements() {
    showToast('Abrindo histórico completo...')
}

function navigateTo(page) {
    showToast(`Navegando para ${page}... (demo)`)
}

// Initialize everything
function initializeDashboard() {
    renderExpiring()
    renderStockList()
    renderNotifications()
    createCharts()

    // Demo notification pulse
    setInterval(() => {
        const countEl = document.getElementById('notif-count')
        if (countEl) {
            countEl.style.transform = 'scale(1.3)'
            setTimeout(() => countEl.style.transform = 'scale(1)', 200)
        }
    }, 4000)

    // Welcome toast
    setTimeout(() => {
        showToast('Bem-vindo de volta, Dr. Carlos!')
    }, 1200)

    console.log('%cMedStock Dashboard (Light Mode) carregado com sucesso ✅', 'color:#22d3ee; font-family:monospace')
}

window.onload = initializeDashboard