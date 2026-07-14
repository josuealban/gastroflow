# Core Service

Microservicio TCP en `127.0.0.1:3001`. Responde `{ cmd: 'health.core' }` y administra dos dominios PostgreSQL:

- `gastroflow_personal` mediante `personal-client`.
- `gastroflow_clientes` mediante `customers-client`.

```env
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=3001
PERSONAL_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastroflow_personal?schema=public
CUSTOMERS_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastroflow_clientes?schema=public
```

Los modelos incluyen restaurantes, planes, suscripciones, usuarios, empleados, roles, permisos, clientes y reservaciones. Las consultas funcionales futuras deberán filtrar siempre por `restaurantId` derivado de la autenticación.

Login, JWT, refresh tokens funcionales, Guards y CRUD todavía no están implementados.
