# GastroFlow SaaS

Sistema de gestión de restaurantes multi-sucursal construido con arquitectura de microservicios.

## Descripción

GastroFlow SaaS permite a empresas con múltiples sucursales gestionar pedidos, inventario, mesas, usuarios y reportes desde un único sistema SaaS, con bases de datos independientes por sucursal para máximo aislamiento de datos.

## Estructura del Proyecto

```
gastroflow-saas/
├── api-gateway/        # Entrada HTTP única (puerto 3000)
├── core-service/       # Lógica de negocio, TCP (puerto 3001)
├── audit-service/      # Auditoría, TCP (puerto 3002)
├── frontend/           # Aplicación React, Vite (puerto 5173)
├── docs/               # Documentación técnica
├── postman/            # Colecciones Postman
├── docker-compose.yml  # Bases de datos PostgreSQL
├── package.json        # Scripts raíz con concurrently
└── PROJECT_SPEC.md     # Especificaciones del proyecto
```

## Responsabilidades

| Servicio | Rol | Puerto |
|----------|-----|--------|
| `api-gateway` | Entrada HTTP, validación DTOs, enrutamiento TCP | 3000 |
| `core-service` | Lógica de negocio, autenticación, multi-tenant DBs | 3001 (TCP) |
| `audit-service` | Registro de eventos de seguridad y operaciones | 3002 (TCP) |
| `frontend` | Interfaz React/Vite | 5173 |

## Requisitos

- Node.js 18+ o 20+
- npm 9+
- PostgreSQL 15+ (vía Docker recomendado)
- Docker y Docker Compose (opcional pero recomendado)

## Instalación

```bash
# Instalar dependencias de cada servicio
cd api-gateway && npm install
cd ../core-service && npm install
cd ../audit-service && npm install
cd ../frontend && npm install
cd ..
npm install    # Instala concurrently en raíz
```

## Variables de Entorno

Copiar los archivos `.env.example` a `.env` en cada servicio:

```bash
cp api-gateway/.env.example api-gateway/.env
cp core-service/.env.example core-service/.env
cp audit-service/.env.example audit-service/.env
cp frontend/.env.example frontend/.env
```

### api-gateway `.env.example`
```
PORT=3000
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=3001
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
CORS_ORIGIN=*
```

### core-service `.env.example`
```
PORT=3001
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=3001
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
```

### audit-service `.env.example`
```
PORT=3002
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
```

### frontend `.env.example`
```
VITE_API_URL=http://localhost:3000/api/v1
```

## Cómo Iniciar

### Iniciar cada servicio individualmente

```bash
# Terminal 1 — API Gateway
cd api-gateway && npm run start:dev

# Terminal 2 — Core Service
cd core-service && npm run start:dev

# Terminal 3 — Audit Service
cd audit-service && npm run start:dev

# Terminal 4 — Frontend
cd frontend && npm run dev
```

### Iniciar todo simultáneamente

```bash
# Desde la raíz gastroflow-saas/
npm run start:all
```

## Build de Producción

```bash
# Compilar todos los servicios
npm run build:all

# O individualmente:
cd api-gateway && npm run build
cd core-service && npm run build
cd audit-service && npm run build
cd frontend && npm run build
```

## Pruebas

```bash
# api-gateway
cd api-gateway
npm run test          # Pruebas unitarias
npm run test:e2e      # Pruebas e2e
npm run lint          # Linter

# core-service
cd core-service
npm run test
npm run test:e2e
npm run lint

# audit-service
cd audit-service
npm run test
npm run test:e2e
npm run lint

# frontend
cd frontend
npm run lint
npm run build
```

## Endpoint Health Check

```
GET http://localhost:3000/api/v1/health
```

Respuesta cuando todos los servicios están disponibles:
```json
{
  "status": "ok",
  "service": "api-gateway",
  "dependencies": {
    "coreService": "ok",
    "auditService": "ok"
  }
}
```

| `status` | Significado |
|----------|-------------|
| `ok` | Todos los servicios responden |
| `degraded` | `audit-service` no responde, `core-service` sí |
| `unavailable` | `core-service` no responde → HTTP 503 |

## Bases de Datos (con Docker)

```bash
# Levantar todas las bases de datos
docker-compose up -d

# Bases disponibles:
# gastroflow_control  → localhost:5432
# gastroflow_audit    → localhost:5433
# gastroflow_demo_centro → localhost:5434
# gastroflow_demo_norte  → localhost:5435
```

## Comunicación entre Servicios

```
Frontend → HTTP → api-gateway → TCP → core-service → TCP → audit-service
```

## Estado Actual

✅ Fase 1 completada:
- Cuatro proyectos independientes inicializados
- Comunicación TCP configurada
- Health check funcional
- Variables de entorno con ConfigModule
- Pruebas unitarias y e2e
- Documentación inicial

🔜 Siguiente fase — Prisma y Bases de Datos:
- Schema de control (`gastroflow_control`)
- Schema de auditoría (`gastroflow_audit`)
- Schemas operacionales por sucursal
- Conexión dinámica a bases de datos por sucursal

## Fases del Proyecto

1. ✅ Estructura base y comunicación entre servicios
2. 🔜 Bases de datos, Prisma y multi-tenancy
3. ⬜ Autenticación JWT, RBAC y Guards
4. ⬜ Módulos de negocio (pedidos, inventario, pagos)
5. ⬜ Frontend completo con React
6. ⬜ Pruebas e2e completas y documentación Swagger
