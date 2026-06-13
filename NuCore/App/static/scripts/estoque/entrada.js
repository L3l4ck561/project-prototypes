//* =========================================
//* Variaveis global
//* =========================================
let pharma = []

//* =========================================
//* Coleta de dados do formulário
//* =========================================

// função final para enviar os dados por API
async function createItem(farmaco) {
    const data = { nome: farmaco };

    const result = !nomeExiste(farmaco)? await crudOperation('POST', 'pharma', data) : false;

    if (result) {
        alert('novo farmaco');

        // document.getElementById('pharma').value = ''
        // document.getElementById('batch').value = ''
        // document.getElementById('quantity').value = ''
        // document.getElementById('received').value = ''
        // document.getElementById('expiry').value = ''
        // document.getElementById('obs').value = ''
    }
    alert('novo lote');
}

// Evento para puxar as informações inseridas no formulário 
document.getElementById('entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const farmaco = document.getElementById('pharma').value.trim();
    // const lote = document.getElementById('batch').value.trim();
    // const qnt = document.getElementById('quantity').value.trim();
    // const dtEnt = document.getElementById('received').value.trim();
    // const dtPrazo = document.getElementById('expiry').value.trim();
    // const obs = document.getElementById('obs').value.trim();

    if (farmaco) {
        await createItem(farmaco);
    }
});

//* =========================================
//* funções gerais
//* =========================================

// procura se o farmaco já existe no banco
function nomeExiste(nomeDigitado) {
    return pharma.some(item => item.nome === nomeDigitado);
}

//* =========================================
//* Inicialização
//* =========================================

// lista de farmacos cadastrados
async function loadItens() {
    const result = await crudOperation('GET', 'pharma');
    if (!result) return;

    pharma = result
}

document.addEventListener('DOMContentLoaded', () => {
    loadItens();
});