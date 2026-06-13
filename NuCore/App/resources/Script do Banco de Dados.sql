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
-- =============================================================== tabelas final para o nucore

DROP TABLE if EXISTS pharma;
CREATE TABLE if NOT EXISTS pharma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    cor VARCHAR(7) NULL,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE if EXISTS stock;
CREATE TABLE if NOT EXISTS stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pharma INT NOT NULL,
	 lote VARCHAR(100) NOT NULL,
    qnt INT NOT NULL,
    dt_prazo DATE NOT NULL, 
    dt_ent DATE NOT NULL,
    obs TEXT,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pharma) REFERENCES pharma(id)
);