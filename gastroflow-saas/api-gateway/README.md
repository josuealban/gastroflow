# API Gateway

Entrada HTTP de GastroFlow en `127.0.0.1:3000`, con prefijo `/api/v1`. El frontend y Postman sólo deben comunicarse con este proyecto.

El health check consulta por TCP:

- `{ cmd: 'health.core' }` en Core.
- `{ cmd: 'health.operations' }` en Operations.

```env
PORT=3000
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=3001
OPERATIONS_SERVICE_HOST=127.0.0.1
OPERATIONS_SERVICE_PORT=3002
CORS_ORIGIN=http://localhost:5173
```

API Gateway no instala ni importa Prisma. Los DTO, validaciones y endpoints funcionales se incorporarán en fases posteriores.
