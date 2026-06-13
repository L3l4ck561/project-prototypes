// ==================== FUNÇÃO CENTRAL CRUD (Reutilizável em qualquer tela) ====================
async function crudOperation(method, table, data = null, id = null) {
    let url = `/api/crud/${table}`;
    
    if (id) {
        url += `?id=${id}`;
    }

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            alert(`Erro: ${result.error || 'Erro desconhecido'}`);
            return null;
        }

        return result;
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro de conexão com o servidor');
        return null;
    }
}