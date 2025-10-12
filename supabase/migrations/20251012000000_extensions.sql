-- ============================================
-- MIGRATION 000: Extensões do PostgreSQL
-- Descrição: Habilita extensões necessárias ANTES de tudo
-- ============================================
-- Esta migration deve rodar PRIMEIRO (por isso o número 000)

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensão para criptografia (usada no seed para criar senhas)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
