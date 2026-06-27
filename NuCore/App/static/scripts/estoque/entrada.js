//* =========================================
//* Variaveis Globais
//* =========================================
// Array completo vindo do backend
let pharma = [];
let stock = [];

//* =========================================
//* Manipulação DOM
//* =========================================
// ? Entidade Pharma 
const farmaco = document.getElementById('pharma');
const farmacoCor = document.getElementById('pharma-cor');
const farmacoLista = document.getElementById('list-pharma');
const farmacoEditBox = document.getElementById('pharma-edit-box');
const farmacoEdit = document.getElementById('pharma-edit');
// ? Entidade Stock
const lote = document.getElementById('batch')
const qnt = document.getElementById('quantity')
const dtEnt = document.getElementById('received')
const dtPrazo = document.getElementById('expiry')
const obs = document.getElementById('obs')

// interação com a página
const msgP = document.getElementById("pharma-exit");
const btn = document.getElementById("btn");
const btnBox = document.getElementById("btnBox");
const statusPost = document.getElementById('status-post');

let timeout;
let itemSelecionado = null; // Para controlar se estamos editando
let itemSelecionadoStock = null;

//* =========================================
//* Funções de Busca e Utilitários
//* =========================================

function removerAcentos(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Busca por nome (usado no autocomplete)
function buscarItens(termo) {
    if (!termo?.trim()) return pharma;

    const termoNormalizado = removerAcentos(termo);
    const palavras = termoNormalizado.split(/\s+/).filter(p => p.length > 0);

    return pharma.filter(item => {
        const nomeNormalizado = removerAcentos(item.nome);
        return palavras.every(palavra => nomeNormalizado.includes(palavra));
    });
}

// Retorna o item completo se existir (melhor que nomeExiste anterior)
function encontrarFarmaco(nome) {
    if (!nome?.trim()) return null;
    const nomeNormalizado = removerAcentos(nome);
    return pharma.find(item => removerAcentos(item.nome) === nomeNormalizado);
}

function encontrarEstoque(nome) {
    if (!nome?.trim()) return null;
    const nomeNormalizado = removerAcentos(nome);
    return stock.find(item => removerAcentos(item.lote) === nomeNormalizado);
}

//* =========================================
//* Renderização
//* =========================================

function destacarTexto(texto, termo) {
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

function renderizarResultados(resultados, termo) {
    farmacoLista.innerHTML = '';

    if (resultados.length === 0) {
        msgP.textContent = 'Fármaco não encontrado.';
        farmacoLista.classList.add('hidden');
        return;
    }

    farmacoLista.classList.remove('hidden');
    msgP.textContent = `${resultados.length} resultado${resultados.length > 1 ? 's' : ''} encontrado${resultados.length > 1 ? 's' : ''}.`;

    resultados.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
            <li class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer" 
                onclick="pharmaSelect('${item.nome}')">
                ${destacarTexto(item.nome, termo)}
            </li>
        `;
        farmacoLista.appendChild(div);
    });
}
farmaco.addEventListener('blur', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        farmacoLista.classList.add('hidden');
    }, 180);
})



//* =========================================
//* Handler
//* =========================================

function handleInput(e) {
    const value = e.target.value.trim();
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        if (!farmacoEdit.checked) {
            itemSelecionado = null; // Reseta seleção ao digitar

            const existente = encontrarFarmaco(value);

            if (existente) {
                itemSelecionado = existente;
                farmacoEditBox.classList.remove('hidden');
                farmacoLista.classList.add('hidden');
                farmacoCor.value = existente.cor;
                msgP.textContent = 'Fármaco localizado.';
            } else if (value) {
                const resultados = buscarItens(value);
                renderizarResultados(resultados, value);
                farmacoEditBox.classList.add('hidden');
            } else {
                resetUI();
            }

        } else if (encontrarFarmaco(value) && itemSelecionado.nome !== value) {
            msgP.textContent = 'Já existe Fármaco com esse nome!';
        } else {
            msgP.textContent = 'Fármaco localizado.';
        }
        validarFormulario()
    }, 180);
}
farmacoEdit.addEventListener('input', () => { if (!farmacoEdit.checked) { resetUI(); farmaco.value = ''; validarFormulario() } })

function handleInputLote(e) {
    const value = e.target.value.trim();
    itemSelecionadoStock = null;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const existente = encontrarEstoque(value);

        if (existente) {// lote existe
            itemSelecionadoStock = existente;
        }
        validarFormulario()
    }, 180);
}

function handleInputQnt(e) {
    const value = e.target.value.trim();
    validarFormulario()
}
function handleInputDtEnt(e) {
    const value = e.target.value.trim();
    validarFormulario()
}
function handleInputDtPrazo(e) {
    const value = e.target.value.trim();
    validarFormulario()
}
function handleInputObs(e) {
    const value = e.target.value.trim();
    validarFormulario()
}

//* =========================================
//* Validação Geral do Formulário
//* =========================================
function validarFormulario() {
    statusPost.textContent = ''
    if (itemSelecionadoStock) {
        statusPost.textContent = 'Esse lote já foi cadastrado'

    } else if (lote.value.trim() || qnt.value || dtEnt.value || dtPrazo.value || obs.value) {
        statusPost.textContent = 'Cadastrando novo Lote'
        if (!lote.value.trim() || !qnt.value || !dtEnt.value || !dtPrazo.value || !farmaco.value.trim()) {
            statusPost.textContent += '. Ainda falta preencher:'
            if (!farmaco.value.trim()) statusPost.textContent += ' - Fármaco'
            if (!lote.value.trim()) statusPost.textContent += ' - Lote'
            if (!qnt.value) statusPost.textContent += ' - Quantidade'
            if (!dtEnt.value) statusPost.textContent += ' - Recebido'
            if (!dtPrazo.value) statusPost.textContent += ' - Validade'
            btnSubmit(false, true)
        } else {
            if (!encontrarFarmaco(farmaco.value.trim())) statusPost.textContent += ' + Fármaco'
            btnSubmit(false)
        }
    } else if (farmacoEdit.checked && encontrarFarmaco(farmaco.value.trim()) && itemSelecionado.nome !== farmaco.value.trim()) {
        btnSubmit(false, true)
    } else if (itemSelecionado) {
        statusPost.textContent = 'Aberto para editar infomações do Fármaco'
        btnSubmit()
    } else if (farmaco.value.trim()) {
        statusPost.textContent = 'Cadastrando novo Fármaco'
        btnSubmit(false)
    }
}
function btnSubmit(a = true, h = false) {
    btnBox.classList.toggle('hidden', h);
    btn.textContent = a ? 'Atualizar' : 'Enviar';
}

//* =========================================
//* Seleção e Edição
//* =========================================

window.pharmaSelect = function (nome) {
    const item = encontrarFarmaco(nome);
    if (!item) return;

    itemSelecionado = item;
    farmaco.value = item.nome;
    farmacoCor.value = item.cor;

    msgP.textContent = 'Fármaco encontrado.';
    validarFormulario()

    farmacoLista.classList.add('hidden');
    farmacoEditBox.classList.remove('hidden');
};

//* =========================================
//* Criação / Atualização
//* =========================================

async function salvarFarmaco() {
    const nome = farmaco.value.trim();
    const cor = farmacoCor.value.trim();

    if (!nome) {
        msgP.textContent = "Nome do fármaco é obrigatório.";
        return;
    }

    const data = { nome, cor };

    try {
        let result;
        let idP;
        let doisitens = false

        if (itemSelecionado) {
            idP = itemSelecionado.id
            // Atualizar existente
            result = await crudOperation('PUT', `pharma`, data, itemSelecionado.id);
            showToast('Fármaco atualizado com sucesso!')
        } else {
            // Criar novo
            result = await crudOperation('POST', 'pharma', data);
            idP = result.id
            showToast('Fármaco cadastrado com sucesso!')
            doisitens = true
        }

        if (result) {
            if (lote.value.trim()) {
                const data_stock = {
                    id_pharma: idP,
                    lote: lote.value.trim(),
                    qnt: qnt.value,
                    dt_prazo: dtPrazo.value,
                    dt_ent: dtEnt.value,
                    obs: obs.value || ''
                };

                const result_stock = await crudOperation('POST', 'stock', data_stock);
                showToast(`Lote ${doisitens ? ' + Fármaco' : ''} cadastrado com sucesso!`)
                zerarTelaOut()
                await loadItensOut();
            }

            await loadItens(); // Recarrega lista
            zerarTela();
        }

    } catch (error) {
        console.error(error);
        msgP.textContent = 'Erro ao salvar fármaco.';
    }
}

// Evento do formulário
document.getElementById('entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (farmacoEdit.checked && encontrarFarmaco(farmaco.value.trim()) && itemSelecionado.nome !== farmaco.value.trim()) return;
    if (lote.value.trim() || qnt.value || dtEnt.value || dtPrazo.value) {
        if (!lote.value.trim() && !qnt.value && !dtEnt.value && !dtPrazo.value) return
    };
    if (itemSelecionadoStock && lote.value.trim()) return;

    await salvarFarmaco();
});

//* =========================================
//* Funções Auxiliares
//* =========================================

function resetUI() {
    msgP.textContent = '';
    btnBox.classList.add('hidden');
    farmacoLista.classList.add('hidden');
    farmacoEditBox.classList.add('hidden');
    itemSelecionado = null;
    farmacoEdit.checked = false;
}

function zerarTela() {
    resetUI();
    farmaco.value = '';
    lote.value = '';
    qnt.value = '';
    dtPrazo.value = '';
    dtEnt.value = '';
    obs.value = '';
    farmacoCor.value = gerarCorAleatoria();
    statusPost.textContent = ''
}

function gerarCorAleatoria() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        zerarTela()
    }
});

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
    farmaco.addEventListener('input', handleInput);
    lote.addEventListener('input', handleInputLote);
    qnt.addEventListener('input', handleInputQnt);
    dtEnt.addEventListener('input', handleInputDtEnt);
    dtPrazo.addEventListener('input', handleInputDtPrazo);
    obs.addEventListener('input', handleInputObs);

    farmacoCor.value = gerarCorAleatoria();
    document.getElementById('received').valueAsDate = new Date();
});