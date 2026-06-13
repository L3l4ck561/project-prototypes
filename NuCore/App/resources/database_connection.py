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

def execute_query(sql, params=None, fetch=None, return_last_id=False):
    connection = open_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(sql, params or ())

        if fetch == "one":
            return cursor.fetchone()

        if fetch == "all":
            return cursor.fetchall()

        connection.commit()

        if return_last_id:
            return cursor.lastrowid

    except mysql.connector.Error as e:
        connection.rollback()
        raise e

    finally:
        cursor.close()
        connection.close()