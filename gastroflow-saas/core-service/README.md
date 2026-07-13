# Core Service

Microservicio TCP principal de GastroFlow. Esta fase establece su arranque, configuración y contrato de salud; la lógica de negocio se implementará más adelante.

## Puerto y patrón actual

- TCP: `127.0.0.1:3001`
- `{ cmd: 'health.core' }`: responde `{ "status": "ok", "service": "core-service" }`.

## Variables de entorno

```env
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=3001
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
```

Copiar `.env.example` a `.env` para desarrollo local. Los valores de ejemplo son exclusivamente locales.

## Comandos

```bash
npm install
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

Las pruebas actuales validan la respuesta del patrón de salud sin depender de otros procesos.

## Estado actual

El servicio carga variables con `@nestjs/config`, valida su puerto y escucha mediante el transporte TCP de NestJS. Prisma, multi-tenancy, JWT, RBAC, inventario, pedidos y pagos aún no están implementados.
