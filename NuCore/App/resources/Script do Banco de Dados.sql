-- ===================================== banco em uso para testes
DROP DATABASE if EXISTS teste_db;
CREATE DATABASE if NOT EXISTS teste_db;
USE teste_db;

-- ===============================================================
-- ---------------------------------------------------------------
-- Apenas para testes
-- ---------------------------------------------------------------

DROP TABLE if EXISTS auditoria;
DROP TABLE if EXISTS stock_outs;
DROP TABLE if EXISTS stock;
DROP TABLE if EXISTS pharma;
DROP TABLE if EXISTS usuario;

-- ---------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------

CREATE TABLE if NOT EXISTS pharma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    cor VARCHAR(7) NOT NULL DEFAULT "#00ffee",
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE if NOT EXISTS stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pharma INT NOT NULL,
	 lote VARCHAR(100) NOT NULL UNIQUE,
    qnt INT NOT NULL,
    dt_prazo DATE NOT NULL, 
    dt_ent DATE NOT NULL,
    obs TEXT,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pharma) REFERENCES pharma(id)
);


CREATE TABLE if NOT EXISTS stock_outs (
    id_stock INT NOT NULL,
    usado INT NOT NULL,
    dt DATE NOT NULL,
    FOREIGN KEY (id_stock) REFERENCES stock(id)
);

CREATE TABLE if NOT EXISTS usuario (
	 id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    nome_completo VARCHAR(255),
    cargo VARCHAR(50) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
	 ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if NOT EXISTS auditoria (
	 id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_pharma INT NOT NULL,
    id_stock INT NOT NULL,
	 acao VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES usuario(id),
    FOREIGN KEY (id_stock) REFERENCES stock(id),
    FOREIGN KEY (id_pharma) REFERENCES pharma(id)
);

-- =============================================================== Procedures

DELIMITER //

CREATE OR REPLACE PROCEDURE sp_estoque_cronologico(
    IN p_data_inicio DATE,
    IN p_data_fim DATE
)
BEGIN

WITH estoque_lotes AS (

    SELECT
        s.id,
        s.id_pharma,
        s.qnt,
        s.dt_ent,
        s.dt_prazo,

        COALESCE(
            SUM(
                CASE
                    WHEN so.dt < p_data_inicio
                    THEN so.usado
                    ELSE 0
                END
            ),
            0
        ) AS usado_antes_inicio,

        COALESCE(
            SUM(
                CASE
                    WHEN so.dt <= p_data_fim
                    THEN so.usado
                    ELSE 0
                END
            ),
            0
        ) AS usado_ate_fim

    FROM stock s
    LEFT JOIN stock_outs so
        ON so.id_stock = s.id

    WHERE s.ativo = 1
      AND s.dt_ent <= p_data_fim

    GROUP BY
        s.id,
        s.id_pharma,
        s.qnt,
        s.dt_ent,
        s.dt_prazo
),

totais AS (

    SELECT

        p.nome,

        --------------------------------------------------
        -- ESTOQUE INICIAL
        --------------------------------------------------

        SUM(

            CASE

                -- lote já vencido antes do período
                WHEN e.dt_prazo < p_data_inicio
                THEN 0

                ELSE GREATEST(
                    e.qnt - e.usado_antes_inicio,
                    0
                )

            END

        ) AS estoque_inicial,

        --------------------------------------------------
        -- RECEBIDOS NO PERÍODO
        --------------------------------------------------

        SUM(

            CASE
                WHEN e.dt_ent BETWEEN p_data_inicio AND p_data_fim
                THEN e.qnt
                ELSE 0
            END

        ) AS recebidos,

        --------------------------------------------------
        -- USADOS NO PERÍODO
        --------------------------------------------------

        SUM(

            COALESCE(
                (
                    SELECT SUM(so2.usado)
                    FROM stock_outs so2
                    WHERE so2.id_stock = e.id
                      AND so2.dt BETWEEN p_data_inicio AND p_data_fim
                ),
                0
            )

        ) AS usados,

        --------------------------------------------------
        -- VENCIDOS NO PERÍODO
        --------------------------------------------------

        SUM(

            CASE

                WHEN e.dt_prazo BETWEEN p_data_inicio AND p_data_fim

                THEN GREATEST(
                    e.qnt - e.usado_ate_fim,
                    0
                )

                ELSE 0

            END

        ) AS vencidos

    FROM pharma p

    LEFT JOIN estoque_lotes e
        ON e.id_pharma = p.id

    WHERE p.ativo = 1

    GROUP BY
        p.nome
)

SELECT

    nome AS Farmaco,

    (COALESCE(estoque_inicial,0)-COALESCE(recebidos,0)) AS Estoque,

    COALESCE(recebidos,0) AS Recebidos,

    COALESCE(usados,0) AS Usados,

    COALESCE(vencidos,0) AS Vencidos,

    (
        COALESCE(estoque_inicial,0)
        -- + COALESCE(recebidos,0)
        - COALESCE(usados,0)
        - COALESCE(vencidos,0)
    ) AS Saldo

FROM totais

ORDER BY nome;

END //

DELIMITER ;