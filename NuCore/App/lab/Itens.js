// ==================== FUNÇÕES ESPECÍFICAS PARA ITENS ====================

// Carregar todos os itens
async function loadItens() {
    const result = await crudOperation('GET', 'itens');
    if (!result) return;

    const tbody = document.querySelector('#itensTable tbody');
    tbody.innerHTML = '';

    result.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>
                <button onclick="editItem(${item.id}, '${item.nome}')">Editar</button>
                <button onclick="deleteItem(${item.id})" style="background:red;">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Criar novo item
async function createItem(nome) {
    const data = { nome: nome };
    const result = await crudOperation('POST', 'itens', data);
    
    if (result) {
        alert('Item criado com sucesso!');
        document.getElementById('nome').value = '';
        loadItens();
    }
}

// Editar item
let currentEditId = null;

function editItem(id, nome) {
    currentEditId = id;
    document.getElementById('editNome').value = nome;
    document.getElementById('editModal').style.display = 'block';
}

async function saveEdit() {
    const novoNome = document.getElementById('editNome').value;
    if (!novoNome) return;

    const data = { nome: novoNome };
    const result = await crudOperation('PUT', 'itens', data, currentEditId);

    if (result) {
        alert('Item atualizado!');
        closeModal();
        loadItens();
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Excluir item
async function deleteItem(id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const result = await crudOperation('DELETE', 'itens', null, id);
    if (result) {
        alert('Item excluído!');
        loadItens();
    }
}

// ==================== EVENT LISTENERS ====================
document.getElementById('itemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    if (nome) {
        await createItem(nome);
    }
});

// Carregar itens ao abrir a página
document.addEventListener('DOMContentLoaded', ()=>{
    loadItens();
    closeModal()
});