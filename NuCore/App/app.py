from flask import Flask, jsonify, request, render_template, send_from_directory
import toml
from resources.database_connection import execute_query

app = Flask(__name__)

# ==================== CONFIG ====================
config = toml.load('config.toml')

ALLOWED_TABLES = config.get('allowed_tables', {})
ALLOWED_PAGES = config.get('allowed_pages', {})
ALLOWED_SUBPAGES = config.get('allowed_subpages', {})

def is_table_allowed(table_name: str) -> bool:
    return table_name in ALLOWED_TABLES

def get_table_columns(table_name: str):
    return ALLOWED_TABLES.get(table_name, [])

def is_page_allowed(page_name: str) -> bool:
    return page_name in ALLOWED_PAGES

def get_template_name(page_name: str):
    return ALLOWED_PAGES.get(page_name)

def is_sub_page_allowed(sub_page: str) -> bool:
    return sub_page in ALLOWED_SUBPAGES

def get_template_subpage(sub_page: str):
    return ALLOWED_SUBPAGES.get(sub_page, [])

# ====================== CONTEXTO GLOBAL (para todos os templates) ======================
@app.context_processor
def inject_global_context():
    """Disponibiliza variáveis em TODOS os templates automaticamente"""
    return {
        'allowed_pages': ALLOWED_PAGES,           # dict completo
        'page_list': list(ALLOWED_PAGES.keys()),   # lista só com os nomes
    }

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        'static',
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

# ====================== CRUD DINÂMICO (mantido) ======================
@app.route('/api/crud/<string:table>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def crud(table):
    if not is_table_allowed(table):
        return jsonify({"error": f"Tabela '{table}' não permitida"}), 403

    columns = get_table_columns(table)
    pk = "id"

    if request.method == 'GET':
        item_id = request.args.get('id')
        if item_id:
            result = execute_query(f"SELECT * FROM {table} WHERE {pk} = %s", (item_id,), fetch="one")
            return jsonify(result) if result else jsonify({"error": "Não encontrado"}), 200 if result else 404
        else:
            results = execute_query(f"SELECT * FROM {table}", fetch="all")
            return jsonify(results), 200

    elif request.method == 'POST':
        data = request.get_json(silent=True) or {}
        valid_data = {k: v for k, v in data.items() if k in columns}
        if not valid_data:
            return jsonify({"error": "Nenhum campo válido"}), 400

        cols = ", ".join(valid_data.keys())
        placeholders = ", ".join(["%s"] * len(valid_data))
        values = list(valid_data.values())

        sql = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
        last_id = execute_query(sql, values, return_last_id=True)
        return jsonify({"message": "Criado com sucesso", "id": last_id}), 201

    elif request.method == 'PUT':
        item_id = request.args.get('id')
        if not item_id: return jsonify({"error": "ID obrigatório"}), 400
        data = request.get_json(silent=True) or {}
        valid_data = {k: v for k, v in data.items() if k in columns and k != pk}
        if not valid_data: return jsonify({"error": "Nada para atualizar"}), 400

        set_clause = ", ".join([f"{col} = %s" for col in valid_data.keys()])
        values = list(valid_data.values()) + [item_id]
        sql = f"UPDATE {table} SET {set_clause} WHERE {pk} = %s"
        execute_query(sql, values)
        return jsonify({"message": "Atualizado com sucesso"}), 200

    elif request.method == 'DELETE':
        item_id = request.args.get('id')
        if not item_id: return jsonify({"error": "ID obrigatório"}), 400
        execute_query(f"DELETE FROM {table} WHERE {pk} = %s", (item_id,))
        return jsonify({"message": "Excluído com sucesso"}), 200


# ====================== ROTAS DE PÁGINAS ======================
@app.route('/')
def home():
    return render_template('index.html', page='home')

@app.route("/<page_name>/<sub_page>")
@app.route('/<page_name>')
def user_page(page_name, sub_page=None):
    if not is_page_allowed(page_name):
        return "Página não permitida", 403

    if is_sub_page_allowed(page_name):
        if not any(sub_page in d for d in get_template_subpage(page_name)):
            sub_page = next(iter(get_template_subpage(page_name)[0]))
    elif sub_page:
        return "Página não permitida", 403



    template_name = get_template_name(page_name)
    if not template_name:
        return "Template não configurado", 404

    return render_template(template_name, 
                         page=page_name,
                         subpage = sub_page,
                         subpage_list = get_template_subpage(page_name) or None,
                         subpage_list_keys = [next(iter(d)) for d in get_template_subpage(page_name)] or None,
                         title=page_name.capitalize())


# ====================== HEALTH ======================
@app.route('/status')
def status():
    return jsonify({
        "status": "online",
        "allowed_tables": list(ALLOWED_TABLES.keys()),
        "allowed_pages": list(ALLOWED_PAGES.keys()),
        "allowed_sub_pages": list(ALLOWED_SUBPAGES.keys())
    })

# ===================================================================
# PharmaStock
# ===================================================================
@app.route('/entrada-novo-farmaco', methods=['POST'])
def pharma():

    return jsonify({"message": "Excluído com sucesso"}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)