from flask import Flask, jsonify, request, render_template, send_from_directory, redirect, url_for, make_response, session, flash
import toml
from resources.database_connection import execute_query
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

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

# ====================== CRUD DINÂMICO ======================
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
    
@app.route('/outs-pharma', methods=['GET','POST'])
def outsPharma():
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}

        sql = """
        INSERT INTO stock_outs (id_stock, usado, dt)
        VALUES (%s, %s, %s)
        """

        values = [
        (
            lote["id"],
            lote["usados"],
            data["data"]
        )
        for lote in data["lotes"]
        ]

        execute_query(sql, values)
        return jsonify({"message": "Baixa realizada com sucesso"}), 201

    # Lista todos os fármacos + saldo
    sql = """
        SELECT p.cor, p.nome, SUM(s.qnt - COALESCE(o.usados, 0)) AS saldo
        FROM pharma p
        INNER JOIN stock s ON s.id_pharma = p.id
        LEFT JOIN (
            SELECT id_stock, SUM(usado) AS usados
            FROM stock_outs
            GROUP BY id_stock
            ) o
        ON o.id_stock = s.id
        WHERE p.ativo = 1 AND s.ativo = 1 AND s.dt_prazo >= CURDATE()
        GROUP BY p.id, p.nome
        HAVING saldo > 0
        ORDER BY p.nome;
    """
    resultsP = execute_query(sql, fetch="all")

    # Lista todos os lotes e seus usos
    sql = """
        SELECT p.nome AS pharma, s.id AS id, s.lote AS lote,  s.dt_prazo AS validade, s.qnt AS qnt, s.qnt-COALESCE(SUM(o.usado), 0) AS inicial, s.qnt-COALESCE(SUM(o.usado), 0) AS disponivel, 0 AS usados
        FROM stock s
        INNER JOIN pharma p ON s.id_pharma = p.id
        LEFT JOIN stock_outs o ON s.id = o.id_stock
        WHERE s.ativo = 1 AND p.ativo = 1 AND s.dt_prazo >= CURDATE()
        GROUP BY s.id
        HAVING s.qnt - COALESCE(SUM(o.usado), 0) > 0
        ORDER BY p.nome;
    """
    resultsS = execute_query(sql, fetch="all")

    return jsonify({"pharma":resultsP,"stock":resultsS}), 200

@app.route('/pharmastock', methods=['POST'])
def opharmastock():
    data = request.get_json()

    data_inicio = data.get('data_inicio')
    data_fim = data.get('data_fim')

    resultado = execute_query(
        sql="sp_estoque_cronologico",
        params=[data_inicio, data_fim],
        fetch="all",
        is_procedure=True
    )
    print(resultado)

    return jsonify(resultado), 200

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

if __name__ == '__main__':
    app.run(debug=True, port=8800)