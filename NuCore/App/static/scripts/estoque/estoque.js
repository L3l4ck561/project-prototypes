let stock = [];

const dtDe = document.getElementById('dataDe');
const dtAte = document.getElementById('dataAte');
const opDt = document.getElementById('op-dt');
const ativoS = document.getElementById('ativo');

function renderStockTable(stock) {
    const tbody = document.getElementById('stock-table');
    tbody.innerHTML = ''; // Limpa a tabela antes de renderizar

    if (!stock || stock.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                    Nenhum medicamento encontrado
                </td>
            </tr>
        `;
        return;
    }

    stock.forEach(item => {
        // Converte Decimal (que geralmente vem como string ou número) para número
        const estoque = Number(item.Estoque) || 0;
        const usados = Number(item.Usados) || 0;
        const vencidos = Number(item.Vencidos) || 0;
        const recebidos = Number(item.Recebidos) || 0;
        const saldo = Number(item.Saldo) || 0;

        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition-colors";

        row.innerHTML = `
            <td class="px-6 py-4 font-medium text-slate-800">
                ${item.Farmaco}
            </td>
            <td class="px-6 py-4 text-right text-slate-700">
                ${estoque}
            </td>
            <td class="px-6 py-4 text-right text-rose-600 font-medium">
                ${usados}
            </td>
            <td class="px-6 py-4 text-right text-amber-600 font-medium">
                ${vencidos}
            </td>
            <td class="px-6 py-4 text-right text-emerald-600 font-medium">
                ${recebidos}
            </td>
            <td class="px-6 py-4 text-right font-semibold ${saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}">
                ${saldo}
            </td>
        `;

        tbody.appendChild(row);
    });
}

async function validarPeriodo() {
    // Só valida quando os dois campos estiverem preenchidos
    if (!dtDe.value || !dtAte.value) return;

    const inicio = new Date(dtDe.value);
    const fim = new Date(dtAte.value);

    if (inicio > fim) {
        showToast("A data inicial não pode ser maior que a data final.", "info");
        // Opcional: limpa o campo final
        opDt.checked = false
        return dtPSemanal()
    }
    ativoS.classList.remove('bg-blue-300')
    ativoS.classList.add('bg-gray-300')

    await loadItens(dtDe.value, dtAte.value);
}

// Executa ao alterar qualquer uma das datas
// dtDe.addEventListener('change', validarPeriodo);
// dtAte.addEventListener('change', validarPeriodo);
opDt.addEventListener('change', ()=>{
    ativoS.classList.add('bg-blue-300')
    ativoS.classList.remove('bg-gray-300')
    if(opDt.checked){
        dtPAtual();
    }else{
        dtPSemanal();
    };
});

async function dtPSemanal() {
    const hoje = new Date();

    // getDay(): 0=domingo, 1=segunda, ..., 6=sábado
    const diaSemana = hoje.getDay();

    // Domingo da semana atual
    const domingo = new Date(hoje);
    domingo.setDate(hoje.getDate() - diaSemana);

    // Sábado da mesma semana
    const sabado = new Date(domingo);
    sabado.setDate(domingo.getDate() + 6);

    // Formata para YYYY-MM-DD (aceito por input[type="date"])
    const formatar = (data) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    };

    dtDe.value = formatar(domingo);
    dtAte.value = formatar(sabado);
    await loadItens(dtDe.value, dtAte.value);
}
async function dtPAtual() {
    const hoje = new Date();

    // getDay(): 0=domingo, 1=segunda, ..., 6=sábado
    const diaSemana = hoje.getDay();

    // Domingo da semana atual
    const domingo = new Date(hoje);
    domingo.setDate(hoje.getDate() - diaSemana);

    // Formata para YYYY-MM-DD (aceito por input[type="date"])
    const formatar = (data) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    };

    dtDe.value = formatar(domingo);
    dtAte.valueAsDate = hoje;
    await loadItens(dtDe.value, dtAte.value);
}

function ordenarPorCriticidade(lista) {
    return [...lista].sort((a, b) => {
        const score = (item) => {
            const estoque = Number(item.Estoque);
            const recebidos = Number(item.Recebidos);
            const usados = Number(item.Usados);
            const vencidos = Number(item.Vencidos);
            const saldo = Number(item.Saldo);

            // Item sem movimentação nenhuma
            const semMovimento =
                estoque === 0 &&
                recebidos === 0 &&
                usados === 0 &&
                vencidos === 0 &&
                saldo === 0;

            if (semMovimento) {
                return -999999; // vai para o final
            }

            // Criticidade:
            // + saldo baixo
            // + muito uso
            // + muitos vencidos
            return (
                usados * 10 +
                vencidos * 20 -
                saldo * 5
            );
        };

        return score(b) - score(a); // maior score primeiro
    });
}
//* =========================================
//* Form Submit - SAÍDA
//* =========================================
document.getElementById('periodo').addEventListener('submit', async (e) => {
    e.preventDefault();

    validarPeriodo();
});

//* =========================================
//* Inicialização
//* =========================================

async function loadItens(dataInicio, dataFim) {
    try {
        const response = await fetch('/pharmastock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data_inicio: dataInicio,
                data_fim: dataFim
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (!result) return;
        
        stock = ordenarPorCriticidade(result)

        renderStockTable(stock);
    } catch (erro) {
        console.error('Erro na requisição:', erro);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    dtPSemanal()
});