# GastroFlow SaaS

Plataforma SaaS acadÃ©mica para restaurantes con mÃºltiples sucursales. El repositorio conserva cuatro proyectos independientes, sin Nx ni monorepo NestJS.

## Estado actual

| Fase | Estado |
|---|---|
| Parte 0 â€” congelaciÃ³n de arquitectura | âœ… Completada |
| Fase 1 â€” estructura base HTTP/TCP | âœ… Completada y verificada |
| Fase 2 â€” Prisma y persistencia por sucursal | âœ… Completada tÃ©cnicamente |
| Fase 3 — autenticación JWT/RBAC | ✅ Completada en código y pruebas automatizadas; integración manual pendiente por Docker |
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

- **API Gateway**: Ãºnica entrada HTTP pÃºblica. No usa Prisma ni PostgreSQL.
- **Core Service**: dueÃ±o de `gastroflow_control`. Gestiona restaurantes, sucursales, planes, suscripciones, usuarios, roles y permisos. Resuelve credenciales por TCP.
- **Operations Service**: recibe `branchId` autorizado, obtiene credenciales de Core por TCP, crea y reutiliza Prisma Clients por sucursal en cachÃ©.
- **Frontend**: login, restauración de sesión, selección segura de sucursal y cierre de sesión. Los módulos comerciales siguen pendientes de Fase 4+.

La Fase 3 incorpora autenticación real, rotación atómica y RBAC. No existen todavía CRUD comerciales.

## Estrategia de bases

| Base | Tipo | Responsable |
|---|---|---|
| `gastroflow_control` | Central | Core Service |
| `gastroflow_demo_principal` | Operacional â€” demo | Operations Service |
| `gastroflow_demo_norte` | Operacional â€” demo | Operations Service |
| `gastroflow_<nombre>` | Operacional por sucursal | Operations Service |

- Una sola base central para identidad, acceso y metadatos de sucursal.
- Una base fÃ­sica independiente por sucursal para datos operacionales.
- Sin `branchId` ni `restaurantId` en tablas operacionales.
- Sin bases globales por dominio (`gastroflow_personal`, `gastroflow_clientes`, `gastroflow_operaciones`).

## Requisitos para desarrollo local

- Node.js 24
- npm 11
- PostgreSQL local o Docker

## ConfiguraciÃ³n

```bash
# Copiar plantillas de variables
cp gastroflow-saas/core-service/.env.example gastroflow-saas/core-service/.env
cp gastroflow-saas/operations-service/.env.example gastroflow-saas/operations-service/.env
cp gastroflow-saas/api-gateway/.env.example gastroflow-saas/api-gateway/.env
cp gastroflow-saas/frontend/.env.example gastroflow-saas/frontend/.env

# Generar clave de cifrado AES (64 hex chars) â€” usar en BRANCH_DB_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar token interno â€” usar el mismo valor en core-service y operations-service
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

No versionar archivos `.env`. EstÃ¡n protegidos por `.gitignore`.

## Inicio rÃ¡pido (Fase 2 con PostgreSQL)

```bash
cd gastroflow-saas

# 1. Levantar PostgreSQL
npm run db:up

# 2. ConfiguraciÃ³n completa (migraciones + seeds)
npm run phase2:setup

# 3. VerificaciÃ³n
npm run phase2:verify

# 4. Desarrollo
npm run dev
```

## Scripts raÃ­z (`gastroflow-saas/`)

| Script | DescripciÃ³n |
|---|---|
| `npm run dev` | Inicia los cuatro servicios con concurrently |
| `npm run build` | Compila los cuatro proyectos |
| `npm run lint` | Lint en los cuatro proyectos |
| `npm run test` | Tests unitarios en todos los servicios |
| `npm run db:up` | Levanta PostgreSQL vÃ­a Docker Compose |
| `npm run db:down` | Detiene PostgreSQL |
| `npm run phase2:setup` | ConfiguraciÃ³n completa de Fase 2 |
| `npm run phase2:verify` | VerificaciÃ³n integral de Fase 2 |
| `npm run branches:status` | Estado de sucursales desde control DB |
| `npm run verify:branch-isolation` | Prueba de aislamiento fÃ­sico entre sucursales |

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

HTTP 200 si todos los servicios responden. HTTP 503 con estado `degraded` o `unavailable` si algÃºn microservicio no responde antes del timeout. Nunca incluye stack traces, secretos ni URLs de base.

## DocumentaciÃ³n

- [Arquitectura](docs/ARCHITECTURE.md)
- [Estrategia de bases](docs/DATABASE_STRATEGY.md)
- [Modelo de sucursal](docs/BRANCH_MODEL.md)
- [Prisma](docs/PRISMA.md)
- [Migraciones](docs/MIGRATIONS.md)
- [Fundamentos HTTP](docs/HTTP_FUNDAMENTALS.md)
- [Cliente-servidor](docs/CLIENT_SERVER.md)
- [Microservicios](docs/MICROSERVICES.md)
- [Requisitos acadÃ©micos](docs/ACADEMIC_REQUIREMENTS.md)
- [Fases del proyecto](docs/PROJECT_PHASES.md)
- [Lista de tareas](docs/TASK_LIST.md)
- [Informe de Parte 0](docs/PHASE_0_REPORT.md)
- [Informe de Fase 1](docs/PHASE_1_REPORT.md)
- [Informe de Fase 2](docs/PHASE_2_REPORT.md)
# Fase 3: autenticaciÃ³n y RBAC

El flujo `Frontend â†’ API Gateway HTTP â†’ Core Service TCP â†’ gastroflow_control` implementa login multirrestaurante, JWT de acceso, refresh rotatorio en cookie HttpOnly, selecciÃ³n segura de sucursal y RBAC. Consulte [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md). Operations Service no participa en autenticaciÃ³n.
