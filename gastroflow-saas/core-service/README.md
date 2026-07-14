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
CONTROL_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastroflow_control?schema=public
DEMO_CENTRO_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastroflow_demo_centro?schema=public
DEMO_NORTE_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastroflow_demo_norte?schema=public
POSTGRES_ADMIN_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres?schema=public
BRANCH_DB_ENCRYPTION_KEY=REPLACE_WITH_64_HEX_CHARACTERS
```

Copiar `.env.example` a `.env` para desarrollo local. La clave de cifrado del ejemplo debe reemplazarse por 32 bytes y nunca reutilizarse en producción.

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

## Persistencia de Fase 2

Core contiene un schema de control y una plantilla operacional por sucursal. Los clientes Prisma se generan en `src/generated/control-client` y `src/generated/branch-client`. La selección de sucursal valida empresa, estado y suscripción; las credenciales se cifran con AES-256-GCM y los clientes se reutilizan en una caché por `branchId`.

Los comandos `prisma:*`, `branches:migrate-all`, `branches:status` y `verify:branch-isolation` están documentados en `../docs/MIGRATIONS.md`.

## Estado actual

El servicio carga variables con `@nestjs/config`, valida su puerto y escucha mediante TCP. Prisma y la infraestructura de base por sucursal están implementados. JWT, RBAC funcional y endpoints de inventario, pedidos y pagos aún no están implementados.
