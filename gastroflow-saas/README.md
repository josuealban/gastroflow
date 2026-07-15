# GastroFlow SaaS

Plataforma SaaS académica para restaurantes con múltiples sucursales. El repositorio conserva cuatro proyectos independientes, sin Nx ni monorepo NestJS.

## Estado actual

| Fase | Estado |
|---|---|
| Parte 0 — congelación de arquitectura | ✅ Completada |
| Fase 1 — estructura base HTTP/TCP | ✅ Completada y verificada |
| Fase 2 — Prisma y persistencia por sucursal | ✅ Completada técnicamente |
| Fase 3 — autenticación JWT/RBAC | ⏳ Pendiente |
| Fases 4-12 — funcionalidades comerciales | ⏳ Pendiente |

## Arquitectura activa

```text
Frontend React/Vite :5173
        |
        | GET /api/v1/...
        v
API Gateway NestJS :3000
        |
        | TCP con timeout
        +------------------------+
        |                        |
        v                        v
Core Service :3001       Operations Service :3002
gastroflow_control       base operacional por sucursal
```

- **API Gateway**: única entrada HTTP pública. No usa Prisma ni PostgreSQL.
- **Core Service**: dueño de `gastroflow_control`. Gestiona restaurantes, sucursales, planes, suscripciones, usuarios, roles y permisos. Resuelve credenciales por TCP.
- **Operations Service**: recibe `branchId` autorizado, obtiene credenciales de Core por TCP, crea y reutiliza Prisma Clients por sucursal en caché.
- **Frontend**: pantalla técnica de estado (Fase 1). Módulos comerciales pendientes de Fase 3+.

## Estrategia de bases

| Base | Tipo | Responsable |
|---|---|---|
| `gastroflow_control` | Central | Core Service |
| `gastroflow_demo_principal` | Operacional — demo | Operations Service |
| `gastroflow_demo_norte` | Operacional — demo | Operations Service |
| `gastroflow_<nombre>` | Operacional por sucursal | Operations Service |

- Una sola base central para identidad, acceso y metadatos de sucursal.
- Una base física independiente por sucursal para datos operacionales.
- Sin `branchId` ni `restaurantId` en tablas operacionales.
- Sin bases globales por dominio (`gastroflow_personal`, `gastroflow_clientes`, `gastroflow_operaciones`).

## Requisitos para desarrollo local

- Node.js 24
- npm 11
- PostgreSQL local o Docker

## Configuración

```bash
# Copiar plantillas de variables
cp gastroflow-saas/core-service/.env.example gastroflow-saas/core-service/.env
cp gastroflow-saas/operations-service/.env.example gastroflow-saas/operations-service/.env
cp gastroflow-saas/api-gateway/.env.example gastroflow-saas/api-gateway/.env
cp gastroflow-saas/frontend/.env.example gastroflow-saas/frontend/.env

# Generar clave de cifrado AES (64 hex chars) — usar en BRANCH_DB_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar token interno — usar el mismo valor en core-service y operations-service
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

No versionar archivos `.env`. Están protegidos por `.gitignore`.

## Inicio rápido (Fase 2 con PostgreSQL)

```bash
cd gastroflow-saas

# 1. Levantar PostgreSQL
npm run db:up

# 2. Configuración completa (migraciones + seeds)
npm run phase2:setup

# 3. Verificación
npm run phase2:verify

# 4. Desarrollo
npm run dev
```

## Scripts raíz (`gastroflow-saas/`)

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia los cuatro servicios con concurrently |
| `npm run build` | Compila los cuatro proyectos |
| `npm run lint` | Lint en los cuatro proyectos |
| `npm run test` | Tests unitarios en todos los servicios |
| `npm run db:up` | Levanta PostgreSQL vía Docker Compose |
| `npm run db:down` | Detiene PostgreSQL |
| `npm run phase2:setup` | Configuración completa de Fase 2 |
| `npm run phase2:verify` | Verificación integral de Fase 2 |
| `npm run branches:status` | Estado de sucursales desde control DB |
| `npm run verify:branch-isolation` | Prueba de aislamiento físico entre sucursales |

## Health

```json
GET http://localhost:3000/api/v1/health

{
  "status": "ok",
  "services": {
    "apiGateway": { "status": "ok" },
    "coreService": { "status": "ok" },
    "operationsService": { "status": "ok" }
  },
  "timestamp": "ISO-8601"
}
```

HTTP 200 si todos los servicios responden. HTTP 503 con estado `degraded` o `unavailable` si algún microservicio no responde antes del timeout. Nunca incluye stack traces, secretos ni URLs de base.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Estrategia de bases](docs/DATABASE_STRATEGY.md)
- [Modelo de sucursal](docs/BRANCH_MODEL.md)
- [Prisma](docs/PRISMA.md)
- [Migraciones](docs/MIGRATIONS.md)
- [Fundamentos HTTP](docs/HTTP_FUNDAMENTALS.md)
- [Cliente-servidor](docs/CLIENT_SERVER.md)
- [Microservicios](docs/MICROSERVICES.md)
- [Requisitos académicos](docs/ACADEMIC_REQUIREMENTS.md)
- [Fases del proyecto](docs/PROJECT_PHASES.md)
- [Lista de tareas](docs/TASK_LIST.md)
- [Informe de Parte 0](docs/PHASE_0_REPORT.md)
- [Informe de Fase 1](docs/PHASE_1_REPORT.md)
- [Informe de Fase 2](docs/PHASE_2_REPORT.md)
