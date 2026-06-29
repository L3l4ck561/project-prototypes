function renderUsersTable(usuarios) {
    const tbody = document.getElementById('usuarios-table');
    tbody.innerHTML = ''; // Limpa a tabela antes de renderizar

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
        return;
    }

    usuarios.forEach(item => {
        // Converte Decimal (que geralmente vem como string ou número) para número
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition-colors";

        row.innerHTML = `
            <td class="px-6 py-4 font-medium text-slate-800">
                ${item.nome}
            </td>
            <td class="px-6 py-4 text-right text-slate-700">
                ${item.cargo}
            </td>
            <td class="px-6 py-4 text-right font-medium">
                ${item.ativo==1?'SIM':'NÂO'}
            </td>
        `;

        tbody.appendChild(row);
    });
}
renderUsersTable(pessoas)