//* =========================================
//* Variáveis Globais - SAÍDA
//* =========================================
let pharmaOut = [];
let stockOut = [];

//* =========================================
//* Manipulação DOM - SAÍDA
//* =========================================
const farmacoOut = document.getElementById('pharma-out');
const farmacoCorOut = document.getElementById('pharma-cor-out');
const farmacoListaOut = document.getElementById('list-pharma-out');

const msgPOut = document.getElementById("pharma-exit-out");
const modalOut = document.getElementById("modal");

let timeoutOut;
let itemSelecionadoOut = null;

//* =========================================
//* Funções de Busca e Utilitários - SAÍDA
//* =========================================

function removerAcentos(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function buscarItensOut(termo) {
    if (!termo?.trim()) return pharmaOut;

    const termoNormalizado = removerAcentos(termo);
    const palavras = termoNormalizado.split(/\s+/).filter(p => p.length > 0);

    return pharmaOut.filter(item => {
        const nomeNormalizado = removerAcentos(item.nome);
        return palavras.every(palavra => nomeNormalizado.includes(palavra));
    });
}

function encontrarFarmacoOut(nome) {
    if (!nome?.trim()) return null;
    const nomeNormalizado = removerAcentos(nome);
    return pharmaOut.find(item => removerAcentos(item.nome) === nomeNormalizado);
}

//* =========================================
//* Renderização - SAÍDA
//* =========================================

function destacarTextoOut(texto, termo) {
    if (!termo?.trim()) return texto;
    const palavras = removerAcentos(termo).split(/\s+/);
    let resultado = texto;

    palavras.forEach(palavra => {
        if (palavra.length < 1) return;
        const regex = new RegExp(`(${palavra})`, 'gi');
        resultado = resultado.replace(regex, '<span class="highlight">$1</span>');
    });

    return resultado;
}

function renderizarResultadosOut(resultados, termo) {
    farmacoListaOut.innerHTML = '';

    if (resultados.length === 0) {
        msgPOut.textContent = 'Fármaco sem unidades no estoque, ou ainda não foi cadastrado.';
        farmacoListaOut.classList.add('hidden');
        return;
    }
    farmacoListaOut.classList.remove('hidden');
    msgPOut.textContent = `${resultados.length} lote${resultados.length > 1 ? 's' : ''} disponivel${resultados.length > 1 ? 's' : ''}.`;

    resultados.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
            <li class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer" 
                onclick="pharmaSelectOut('${item.nome}')"
                 style="border-left: 5px solid ${item.cor};">
                 <strong>${destacarTextoOut(item.nome, termo)}</strong>
                | <i>há ${item.saldo} unidade${item.saldo > 1 ? 's' : ''} em estoque</i>
            </li>
        `;
        farmacoListaOut.appendChild(div);
    });
}

//* =========================================
//* Seleção e Edição - SAÍDA
//* =========================================

window.pharmaSelectOut = function (nome) {
    const item = encontrarFarmacoOut(nome);
    if (!item) return;

    itemSelecionadoOut = item;
    farmacoOut.value = item.nome;
    farmacoCorOut.style.backgroundColor = item.cor;

    msgPOut.textContent = 'Fármaco encontrado. Há lote disponivel';
    farmacoListaOut.classList.add('hidden');



    let resultLot = stockOut.filter(x => x.pharma === item.nome);
    openStockModal(item, resultLot);
};

farmacoOut.addEventListener('blur', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        farmacoListaOut.classList.add('hidden');
    }, 180);
})

//* =========================================
//* Handler Principal - SAÍDA
//* =========================================

function handleInputOut(e) {
    const value = e.target.value.trim();
    itemSelecionadoOut = null;

    clearTimeout(timeoutOut);
    timeoutOut = setTimeout(() => {
        const existente = encontrarFarmacoOut(value);

        if (existente) {
            itemSelecionadoOut = existente;
            msgPOut.textContent = 'Fármaco encontrado. Há lote disponivel';
            farmacoCorOut.style.backgroundColor = existente.cor;
            farmacoListaOut.classList.add('hidden');
        } else if (value) {
            const resultados = buscarItensOut(value);
            renderizarResultadosOut(resultados, value);
        } else {
            resetUIOut();
        }
    }, 180);
}

//* =========================================
//* Modal de Saída
//* =========================================

let currentLotsOut = [];

function openStockModal(farmacoName, lots = null) {
    if (lots) currentLotsOut = lots;

    document.getElementById('modal-title').textContent = `Fármaco: ${farmacoName.nome}`;
    document.getElementById('total-stock').textContent = farmacoName.saldo;

    renderLotsOut();
    document.getElementById('stockModal').classList.remove('hidden');
}

function renderLotsOut() {
    const tbody = document.getElementById('lots-body');
    tbody.innerHTML = '';

    currentLotsOut.forEach(lot => {
        const data = new Date(lot.validade);
        const dataFormatada =
            String(data.getDate() + 1).padStart(2, '0') + '/' +
            String(data.getMonth() + 1).padStart(2, '0') + '/' +
            data.getFullYear();

        const row = document.createElement('tr');
        row.className = 'last:border-none hover:bg-gray-50';
        row.innerHTML = `
            <td class="py-4 font-medium">${lot.lote} | <i>${dataFormatada}</i></td>
            <td class="py-4">
                <div class="flex items-center justify-center gap-3">
                    <button onclick="changeUsedOut(${lot.id}, -1)" 
                            class="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-xl text-lg font-medium">-</button>
                    
                    <span id="used-${lot.id}" class="w-12 text-center font-semibold text-lg">${lot.usados}</span>
                    
                    <button onclick="changeUsedOut(${lot.id}, 1)" 
                            class="w-8 h-8 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-lg font-medium">+</button>
                    
                    <button onclick="resetUsedOut(${lot.id})" 
                            class="ml-2 text-xs text-red-500 hover:text-red-600">reset</button>
                </div>
            </td>
            <td class="py-4 text-right font-medium" id="disp-${lot.id}">
                ${lot.disponivel}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function changeUsedOut(id, amount) {
    const lot = currentLotsOut.find(l => l.id === id);
    if (!lot) return;
    if (lot.disponivel === 0 && amount > 0) return;

    lot.usados = Math.max(0, parseInt(lot.usados) + amount);
    lot.disponivel = lot.inicial - parseInt(lot.usados);

    document.getElementById(`used-${id}`).textContent = lot.usados;
    document.getElementById(`disp-${id}`).textContent = lot.disponivel;

    // const totalUsed = currentLotsOut.reduce((sum, l) => sum + l.usados, 0)
    renderStockOutPreview(stockOut, '#preview-cards');
}

function resetUsedOut(id) {
    const lot = currentLotsOut.find(l => l.id === id);
    if (lot) {
        lot.usados = 0;
        lot.disponivel = lot.inicial;
        renderLotsOut();
        renderStockOutPreview(stockOut, '#preview-cards');
    }
}

async function confirmUsage() {
    try {
        const date = document.getElementById('use-date').value;
        if (!date) {
            showToast("Por favor, informe a data de uso.", "warning");
            return;
        }
        // console.log("Saída confirmada:", {
        //     data: date,
        //     lotes: stockOut.filter(l => l.usados > 0)
        // });

        const response = await fetch(
            '/outs-pharma',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: date,
                    lotes: stockOut.filter(l => l.usados > 0)
                })
            }
        );

        showToast("Saída registrada com sucesso!", 'success');
        closeModal();
        await loadItensOut();
        renderStockOutPreview(stockOut, '#preview-cards');
        clearTimeout(timeoutOut);
        timeoutOut = setTimeout(() => {
            if (!encontrarFarmacoOut(farmacoOut.value.trim())) zerarTelaOut();
        }, 180);
    } catch (erro) {
        showToast('Erro de conexão com o servidor', 'error');
        console.error('Erro na requisição:', erro);
    }
}

function closeModal() {
    document.getElementById('stockModal').classList.add('hidden');
}


//* =========================================
//* Preview dos usos
//* =========================================
//renderStockOutPreview(stockOut, '#preview-cards');
function renderStockOutPreview(stockOut, containerSelector = '.preview-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Limpa o conteúdo anterior
    container.innerHTML = '';

    // Agrupa os itens por fármaco
    const grouped = groupByPharma(stockOut);

    // Cria um card para cada fármaco que teve saída
    Object.keys(grouped).forEach(pharma => {
        const items = grouped[pharma];

        // Só cria card se houver pelo menos um item com usados > 0
        const hasUsage = items.some(item => Number(item.usados) > 0);
        if (!hasUsage) return;

        const card = createPharmaCard(pharma, items);
        container.appendChild(card);
    });

    // Mostra o botão "Prosseguir com a Baixa" se houver algo
    const proceedBtn = document.querySelector('.proceed-btn');
    if (proceedBtn) {
        proceedBtn.classList.toggle('hidden', container.children.length === 0);
    }
}
// Agrupa os itens por nome do fármaco
function groupByPharma(stockOut) {
    return stockOut.reduce((acc, item) => {
        const pharma = item.pharma || 'Sem nome';
        if (!acc[pharma]) acc[pharma] = [];
        acc[pharma].push(item);
        return acc;
    }, {});
}

// Cria o card de um fármaco
function createPharmaCard(pharma, items) {
    const card = document.createElement('div');
    card.className = 'w-80 shrink-0 bg-white rounded-3xl shadow-xl p-4 flex flex-col';

    // Filtra apenas os lotes que foram usados
    const usedItems = items.filter(item => Number(item.usados) > 0);

    let totalUsed = 0;
    const lotsHTML = usedItems.map(item => {
        const usados = Number(item.usados);
        totalUsed += usados;

        return `
            <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div>
                    <p class="font-medium text-slate-700">${item.lote}</p>
                    <p class="text-xs text-slate-500">
                        Val: ${new Date(item.validade).toLocaleDateString('pt-BR')}
                    </p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-emerald-600">${usados} un</p>
                    <p class="text-xs text-slate-500">de ${item.inicial}</p>
                </div>
            </div>
        `;
    }).join('');
    const itemPharma = encontrarFarmacoOut(pharma);
    const subtotal = itemPharma.saldo - totalUsed;

    let subtotalColor = 'text-emerald-600'; // verde

    if (subtotal <= 0) {
        subtotalColor = 'text-red-600';
    } else if (subtotal <= itemPharma.saldo * 0.25) {
        subtotalColor = 'text-orange-500';
    } else if (subtotal <= itemPharma.saldo * 0.5) {
        subtotalColor = 'text-yellow-500';
    }
    card.innerHTML = `
        <!-- Header -->
        <div class="mb-4">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 text-cyan-600 rounded-2xl flex items-center justify-center font-bold" style="background-color:${itemPharma.cor}"></div>
                <div>
                    <h3 class="font-semibold text-lg text-slate-800">${pharma}</h3>
                    <p class="text-sm text-slate-500">${usedItems.length} lote(s) utilizados</p>
                </div>
            </div>
        </div>

        <!-- Total -->
        <div class="bg-slate-50 rounded-2xl p-3 mb-4">
            <div class="flex justify-between items-baseline">
                <span class="text-slate-600 text-sm">Total Disponível:</span>
                <span class="text-2xl font-bold">${itemPharma.saldo} Un</span>
            </div>

            <div class="flex justify-between items-baseline">
                <span class="text-slate-600 text-sm">Total utilizado:</span>
                <span class="text-2xl font-bold text-emerald-600">${totalUsed} Un</span>
            </div>

            <div class="flex justify-between items-baseline">
                <span class="text-slate-600 text-sm">Sub Total:</span>
                <span class="text-2xl font-bold ${subtotalColor}">
                    ${subtotal} Un
                </span>
            </div>
        </div>

        <!-- Lista de lotes -->
        <div class="flex-1 overflow-auto">
            ${lotsHTML}
        </div>
        <span class="text-blue-600 cursor-pointer hover:text-blue-800 text-end" onclick="abrirmodal('${pharma}')">Editar</span>
    `;

    return card;
}

function abrirmodal(pharma) {
    const item = encontrarFarmacoOut(pharma);
    let resultLot = stockOut.filter(x => x.pharma === item.nome);
    openStockModal(item, resultLot);
}

//* =========================================
//* Form Submit - SAÍDA
//* =========================================
document.getElementById('out-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let item = encontrarFarmacoOut(farmacoOut.value.trim());
    if (!item) return;

    let resultLot = stockOut.filter(x => x.pharma === item.nome);

    await openStockModal(item, resultLot);
});

//* =========================================
//* Funções Auxiliares - SAÍDA
//* =========================================

function resetUIOut() {
    farmacoCorOut.style.backgroundColor = '#ffffff';
    itemSelecionadoOut = null;
    farmacoListaOut.classList.add('hidden');
    farmacoOut.value = '';
    msgPOut.textContent = '';
}

function zerarTelaOut() {
    resetUIOut();
    stockOut.forEach(item => {
        item.usados = 0;
    });
    renderStockOutPreview(stockOut, '#preview-cards');
}

//* =========================================
//* Inicialização - SAÍDA
//* =========================================

async function loadItensOut() {
    try {
        const response = await fetch('/outs-pharma');

        if (!response.ok) {
            showToast(`Erro: ${response.status}`, 'error');
            return;
        }

        const result = await response.json();

        if (result) {
            pharmaOut = result.pharma;
            stockOut = result.stock;
        }
    } catch (erro) {
        showToast('Erro de conexão com o servidor', 'error');
        console.error('Erro na requisição:', erro);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadItensOut();
    document.getElementById('use-date').valueAsDate = new Date();
    farmacoOut.addEventListener('input', handleInputOut);
});
