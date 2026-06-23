-- ===================================== banco em uso para testes
DROP DATABASE if EXISTS teste_db;
CREATE DATABASE if NOT EXISTS teste_db;
USE teste_db;

DROP TABLE if EXISTS itens;
CREATE TABLE if NOT EXISTS itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- =============================================================== tabelas final para o numedi

DROP TABLE if EXISTS pharma;
CREATE TABLE if NOT EXISTS pharma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    cor VARCHAR(7) NOT NULL DEFAULT "#00ffee",
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE if EXISTS stock;
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

DROP TABLE if EXISTS stock_outs;
CREATE TABLE if NOT EXISTS stock_outs (
    id_stock INT NOT NULL,
    usado INT NOT NULL,
    dt DATE NOT NULL,
    FOREIGN KEY (id_stock) REFERENCES stock(id)
);

-- =============================================================== Querys modelo
-- lista o total dos farmacos
SELECT
    p.cor,
    p.nome,
    SUM(
        s.qnt - COALESCE(o.usados, 0)
    ) AS saldo
FROM pharma p
INNER JOIN stock s
    ON s.id_pharma = p.id
LEFT JOIN (
    SELECT
        id_stock,
        SUM(usado) AS usados
    FROM stock_outs
    GROUP BY id_stock
) o
    ON o.id_stock = s.id
WHERE
    p.ativo = 1
    AND s.ativo = 1
    AND s.dt_prazo >= CURDATE()
GROUP BY
    p.id,
    p.nome
HAVING
    saldo > 0
ORDER BY
    p.nome;

-- lista total dos lotes
SELECT 
	 p.nome AS pharma,
    s.lote AS lote,
    s.dt_prazo AS validade,
    s.qnt AS total,
    COALESCE(SUM(o.usado), 0) AS usados
FROM stock s
INNER JOIN pharma p ON s.id_pharma = p.id
LEFT JOIN stock_outs o ON s.id = o.id_stock
WHERE
    s.ativo = 1
    AND p.ativo = 1
    AND s.dt_prazo >= CURDATE()
GROUP BY
    s.id
HAVING
    s.qnt - COALESCE(SUM(o.usado), 0) > 0
ORDER BY
    p.nome;