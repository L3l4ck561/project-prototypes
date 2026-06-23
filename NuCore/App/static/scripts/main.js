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
            showToast(`Erro: ${result.error || 'Erro desconhecido'}`,'error');
            return null;
        }

        return result;
    } catch (error) {
        console.error('Erro na requisição:', error);
        showToast('Erro de conexão com o servidor','error');
        return null;
    }
}
document.addEventListener("dragstart", e => e.preventDefault());

// Toast
// Toast com múltiplos tipos
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast')

    if (!toast) {
        toast = document.createElement('div')
        toast.id = 'toast'
        toast.className = `hidden fixed bottom-6 right-6 rounded-3xl px-6 py-4 flex items-center gap-3 shadow-xl border`
        document.body.appendChild(toast)
    }

    // Configurações por tipo
    const types = {
        success: {
            bg: 'bg-white',
            border: 'border-emerald-500',
            text: 'text-emerald-700',
            icon: 'fa-solid fa-circle-check'
        },
        error: {
            bg: 'bg-white',
            border: 'border-red-500',
            text: 'text-red-700',
            icon: 'fa-solid fa-circle-xmark'
        },
        warning: {
            bg: 'bg-white',
            border: 'border-amber-500',
            text: 'text-amber-700',
            icon: 'fa-solid fa-triangle-exclamation'
        },
        info: {
            bg: 'bg-white',
            border: 'border-sky-500',
            text: 'text-sky-700',
            icon: 'fa-solid fa-circle-info'
        }
    }

    const config = types[type] || types.success

    // Atualiza classes e conteúdo
    toast.className = `fixed bottom-6 right-6 rounded-3xl px-6 py-4 flex items-center gap-3 shadow-xl border z-99
                       ${config.bg} ${config.border} ${config.text}`

    toast.innerHTML = `
        <i class="${config.icon}"></i>
        <span id="toast-text" class="text-sm font-medium">${message}</span>
    `

    // Mostra o toast
    toast.classList.remove('hidden')
    toast.style.transform = 'translateY(0)'

    // Esconde após 3 segundos
    setTimeout(() => {
        toast.style.transform = 'translateY(80px)'
        setTimeout(() => {
            toast.classList.add('hidden')
        }, 300)
    }, 2800)
}