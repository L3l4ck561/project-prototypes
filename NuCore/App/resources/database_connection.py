import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def open_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password= os.getenv("DB_PASSWORD"),
        database='teste_db',
        port=3307,
    )

import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def open_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password=os.getenv("DB_PASSWORD"),
        database='teste_db',
        port=3307,
    )

def execute_query(
    sql,
    params=None,
    fetch=None,           # "one", "all", ou None
    return_last_id=False,
    many=False,
    is_procedure=False    # ← Novo parâmetro
):
    connection = open_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        if is_procedure:
            # Chama Stored Procedure
            if params is None:
                params = []
            
            # callproc espera uma lista de parâmetros
            cursor.callproc(sql, params)
            
            # Pega os resultados (procedures podem retornar múltiplos result sets)
            results = []
            for result in cursor.stored_results():
                if fetch == "one":
                    results.append(result.fetchone())
                elif fetch == "all":
                    results.append(result.fetchall())
                else:
                    results.append(result.fetchall())
            
            # Se tiver apenas um result set, retorna direto (comportamento mais comum)
            if len(results) == 1:
                return results[0]
            return results

        else:
            # Comportamento original (queries normais)
            if (
                isinstance(params, list)
                and params
                and isinstance(params[0], (list, tuple))
            ):
                cursor.executemany(sql, params)
            else:
                cursor.execute(sql, params or ())

            if fetch == "one":
                return cursor.fetchone()

            if fetch == "all":
                return cursor.fetchall()

            connection.commit()

            if return_last_id:
                return cursor.lastrowid

    except mysql.connector.Error as e:
        if not is_procedure:  # Procedures geralmente não precisam de rollback manual
            connection.rollback()
        raise e

    finally:
        cursor.close()
        connection.close()