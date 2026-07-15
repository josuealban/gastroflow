# GastroFlow SaaS

## Persistencia de Fase 2

La arquitectura activa usa `gastroflow_control` y una base PostgreSQL independiente por sucursal. Principal y Norte comparten el schema de `operations-service/prisma/branch`, sin discriminadores de tenant. Consulte `docs/PRISMA.md`, `docs/MIGRATIONS.md` y `docs/PHASE_2_REPORT.md`.

Copie los `.env.example`, genere la clave AES y el token interno con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`, ejecute `npm run phase2:setup` y luego `npm run phase2:verify`. `npm run db:reset` elimina deliberadamente el volumen y todos los datos PostgreSQL locales.

GastroFlow es una plataforma SaaS académica para restaurantes con múltiples sucursales. El repositorio conserva cuatro proyectos independientes, sin Nx ni monorepo NestJS.

## Fase 1 operativa

```text
Frontend React/Vite :5173
        |
        | GET /api/v1/health
        v
API Gateway HTTP :3000
        |
        | TCP con timeout
        +-------------------------+
        |                         |
        v                         v
Core Service :3001       Operations Service :3002
{ cmd: core.health }     { cmd: operations.health }
```

API Gateway es la única entrada pública y no usa Prisma ni PostgreSQL. Los módulos Prisma existentes son provisionales, permanecen desacoplados del arranque técnico y se reemplazarán en Fase 2.

## Requisitos

- Node.js 24 o compatible con las dependencias declaradas.
- npm 11.
- PostgreSQL no es necesario para ejecutar los health checks de Fase 1.

## Configuración

Copiar los `.env.example` de cada proyecto a `.env` sólo para desarrollo local. No versionar archivos `.env`.

| Proyecto | Variables principales |
| --- | --- |
| Gateway | `PORT`, `CORS_ORIGIN`, hosts/puertos TCP, `MICROSERVICE_TIMEOUT_MS` |
| Core | `CORE_SERVICE_HOST`, `CORE_SERVICE_PORT` |
| Operations | `OPERATIONS_SERVICE_HOST`, `OPERATIONS_SERVICE_PORT` |
| Frontend | `VITE_API_BASE_URL` |

Las variables Prisma presentes en Core y Operations son legado provisional y no se usan en el arranque de health.

## Instalación y desarrollo

```bash
npm install
npm --prefix api-gateway install
npm --prefix core-service install
npm --prefix operations-service install
npm --prefix frontend install
npm run dev
```

URLs:

- Health: `http://localhost:3000/api/v1/health`
- Pantalla técnica: `http://localhost:5173`

## Scripts raíz

- `npm run start:gateway`
- `npm run start:core`
- `npm run start:operations`
- `npm run start:frontend`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`

También existen variantes por proyecto como `build:gateway`, `lint:core` y `test:operations`.

## Health público

Un resultado saludable devuelve HTTP 200:

```json
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

Si uno o ambos microservicios no responden antes del timeout, el Gateway devuelve HTTP 503 con estado `degraded` o `unavailable`. Nunca incluye stack traces, secretos o URLs de base.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Fundamentos HTTP](docs/HTTP_FUNDAMENTALS.md)
- [Cliente-servidor](docs/CLIENT_SERVER.md)
- [Microservicios](docs/MICROSERVICES.md)
- [Estrategia de bases futura](docs/DATABASE_STRATEGY.md)
- [Requisitos académicos](docs/ACADEMIC_REQUIREMENTS.md)
- [Lista de tareas](docs/TASK_LIST.md)
- [Informe de Fase 1](docs/PHASE_1_REPORT.md)

JWT, RBAC, schema Prisma definitivo, bases por sucursal, CRUD, facturación y despliegue continúan fuera de Fase 1.
