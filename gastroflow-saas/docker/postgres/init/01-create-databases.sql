SELECT 'CREATE DATABASE gastroflow_clientes'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gastroflow_clientes')\gexec

SELECT 'CREATE DATABASE gastroflow_operaciones'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gastroflow_operaciones')\gexec
