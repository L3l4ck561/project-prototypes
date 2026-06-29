//* =========================================
//* Auxiliares
//* =========================================
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === Number(cpf[10]);
}

function contarPalavras(frase) {
    if (!frase.trim()) return 0;

    return frase.trim().split(/\s+/).length;
}

//* =========================================
//* DOM
//* =========================================
const userName = document.getElementById('user-name');
const userCPF = document.getElementById('user-cpf');
const userCargo = document.getElementById('user-cargo');

//* =========================================
//* Construíndo dados para salvar
//* =========================================
async function confirmUsage(inp) {
    try {
        const response = await fetch(
            '/logup',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inp)
            }
        );
        showToast("Saída registrada com sucesso!", 'success');
    } catch (erro) {
        showToast('Erro de conexão com o servidor', 'error');
        console.error('Erro na requisição:', erro);
    }
}

//* =========================================
//* Form Submit
//* =========================================
document.getElementById('form-logup').addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!userName.value.trim() || !userCPF.value.trim() || !userCargo.value.trim()) return showToast('Preencha todos os campos antes de salvar!', 'info');

    if(!validarCPF(userCPF.value.trim()) || contarPalavras(userName.value.trim()) < 3) return showToast(`
        ${contarPalavras(userName.value.trim()) < 3?'Nome muito curto':''}
        ${!validarCPF(userCPF.value.trim()) && contarPalavras(userName.value.trim()) < 3?' e ':''}
        ${!validarCPF(userCPF.value.trim())?'CPF Inválido':''}
        `, 'warning');

    data = {
        nomeCompleto: userName.value.trim(),
        cpf: userCPF.value.trim(),
        senha: userCPF.value.trim().slice(0, 6),
        cargo: userCargo.value.trim()
    }

    confirmUsage(data)
});