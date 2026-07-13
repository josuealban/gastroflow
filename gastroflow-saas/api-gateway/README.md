# API Gateway

Puerta de entrada HTTP de GastroFlow. En la fase inicial expone el estado del sistema y consulta por TCP a `core-service` y `audit-service`.

## Puerto y endpoint actual

- HTTP: `3000`
- `GET /api/v1/health`: devuelve `ok`, `degraded` o `unavailable` según la disponibilidad de las dependencias.

El prefijo global es `/api/v1`. Las consultas TCP usan los patrones `{ cmd: 'health.core' }` y `{ cmd: 'health.audit' }`, con un timeout máximo de 2000 ms por dependencia.

## Variables de entorno

```env
PORT=3000
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=3001
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
CORS_ORIGIN=http://localhost:5173
```

Copiar `.env.example` a `.env` para desarrollo local. No guardar secretos en el ejemplo.

## Comandos

```bash
npm install
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

Las pruebas usan dobles de `ClientProxy`; no requieren iniciar los microservicios.

## Estado actual

La comunicación HTTP/TCP y el health check están implementados. No hay Prisma, autenticación JWT, RBAC ni endpoints de inventario, pedidos o pagos.
