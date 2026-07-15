SELECT 'CREATE DATABASE gastroflow_control'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gastroflow_control')\gexec

SELECT 'CREATE DATABASE gastroflow_demo_principal'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gastroflow_demo_principal')\gexec

SELECT 'CREATE DATABASE gastroflow_demo_norte'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gastroflow_demo_norte')\gexec
