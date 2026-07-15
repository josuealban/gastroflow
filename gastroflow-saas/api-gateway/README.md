# API Gateway

Servidor HTTP público de GastroFlow en el puerto 3000. Expone `GET /api/v1/health`, usa CORS y timeout configurables, `ValidationPipe`, versionamiento URI y apagado ordenado.

Mantiene dos clientes TCP reutilizables:

- `{ cmd: 'core.health' }` hacia Core Service.
- `{ cmd: 'operations.health' }` hacia Operations Service.

Devuelve HTTP 200 cuando ambos responden y HTTP 503 con `degraded` o `unavailable` cuando falla uno o ambos. No expone errores internos.

Variables: `PORT`, `CORS_ORIGIN`, `CORE_SERVICE_HOST`, `CORE_SERVICE_PORT`, `OPERATIONS_SERVICE_HOST`, `OPERATIONS_SERVICE_PORT` y `MICROSERVICE_TIMEOUT_MS`.

```bash
npm install
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

API Gateway no instala ni importa Prisma y no se conecta a PostgreSQL.
