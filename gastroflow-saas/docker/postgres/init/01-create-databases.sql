SELECT 'CREATE DATABASE gastroflow_audit'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gastroflow_audit')\gexec

SELECT 'CREATE DATABASE gastroflow_demo_centro'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gastroflow_demo_centro')\gexec

SELECT 'CREATE DATABASE gastroflow_demo_norte'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gastroflow_demo_norte')\gexec
