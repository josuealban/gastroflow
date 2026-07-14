# GastroFlow SaaS

Base de una plataforma multi-sucursal con cuatro proyectos independientes:

- `api-gateway`: NestJS HTTP en 3000.
- `core-service`: NestJS TCP en 3001 y persistencia de control/sucursales.
- `audit-service`: NestJS TCP en 3002 y persistencia exclusiva de auditoría.
- `frontend`: React/Vite en 5173, pantalla temporal de salud.

## Requisitos

- Node.js 24 (Prisma 7 requiere Node 20.19+, 22.12+ o 24+).
- npm 11.
- Docker y Docker Compose para PostgreSQL de desarrollo.

## Instalación

Ejecutar `npm install` en la raíz y en cada uno de los cuatro proyectos. Copiar cada `.env.example` a `.env`; la clave `BRANCH_DB_ENCRYPTION_KEY` debe reemplazarse por 64 caracteres hexadecimales reales de desarrollo.

## PostgreSQL local

```bash
npm run db:up
npm run db:logs
npm run db:down
```

El contenedor crea `gastroflow_control`, `gastroflow_audit`, `gastroflow_demo_centro` y `gastroflow_demo_norte` en un servidor PostgreSQL, manteniéndolas como bases separadas.

`npm run db:reset` elimina el volumen y todos los datos locales. Es destructivo.

## Preparación de Prisma

```bash
cd core-service
npm run prisma:control:generate
npm run prisma:control:deploy
npm run prisma:control:seed
npm run prisma:branch:generate
npm run prisma:branch:deploy:centro
npm run prisma:branch:deploy:norte
npm run prisma:branch:seed:centro
npm run prisma:branch:seed:norte
npm run verify:branch-isolation
npm run branches:status

cd ../audit-service
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
```

Los comandos completos y el proceso de nuevas sucursales están en `docs/MIGRATIONS.md` y `docs/DATABASE_PER_BRANCH.md`.

## Desarrollo y verificación

```bash
npm run start:all
npm run build:all
```

Cada proyecto ofrece sus propios `lint`, `test`, `test:e2e` y `build`. Core y Audit añaden `test:integration`, que requiere `RUN_DATABASE_TESTS=true` y PostgreSQL preparado.

## Estado

- Fase 1: completada.
- Fase 2: implementación en repositorio terminada; verificación real de migraciones, seeds y aislamiento pendiente cuando PostgreSQL de desarrollo esté disponible.
- Fase 3: autenticación JWT y RBAC pendiente.

No existen todavía endpoints completos de autenticación, productos, inventario, pedidos o pagos.
