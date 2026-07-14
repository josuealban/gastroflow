# Informe de Parte 0

Fecha: 2026-07-14. Alcance: inspección y documentación exclusivamente.

## 1. Rama actual

`codex/fase-2-saas-dominios`.

## 2. Estado inicial

El repositorio ya estaba fuertemente modificado y sin commit al comenzar esta Parte 0. `git status --short` mostró 173 entradas: 25 modificadas, 20 eliminadas en índice, 8 renombradas, 27 renombradas/eliminadas, 55 renombradas/modificadas y 38 no rastreadas. Había cambios staged y unstaged procedentes del trabajo anterior.

`git diff --stat` informó 107 archivos, 14.710 inserciones y 53.973 eliminaciones en el worktree. `git diff --cached --stat` informó 110 archivos y 1.824 eliminaciones. `git diff --check` terminó con código 0 y sólo advirtió conversiones futuras LF/CRLF.

Últimos commits observados:

```text
a6a115bd correcion previa a la fase dos que es la implementacion de prisma y demas
3322e8d0 actualizacion
0b7c9811 feat:gastroflow correcion de git ignore  y estabilizacion del proyecto
244f53fa stabilized project
23f1ff5d Update project files
ab973b19 feat:arreglo de client
f0aa6729 arreglos ligeros
831f293f feat:estabilizacion de varias cosas dentro del proyecto
51d637c4 feat:general structure
cb09c941 Initial commit
```

Entorno: Node.js `v24.14.1`, npm `11.11.0`. Docker y Docker Compose no se encontraron.

Había directorios `node_modules` y archivos `.env` locales ignorados por Git en los cuatro proyectos. No se crearon en Parte 0 ni aparecen como archivos nuevos rastreables. No se exponen sus valores en este informe.

## 3. Arquitectura encontrada

- Cuatro proyectos independientes: Gateway, Core, Operations y frontend.
- Gateway HTTP en 3000, con prefijo `/api/v1` y clientes TCP.
- Core TCP en 3001 y Operations TCP en 3002.
- Health checks `health.core` y `health.operations`, con pruebas unitarias/E2E presentes.
- Frontend Vite en 5173 y Axios configurado hacia el Gateway.
- Gateway sin Prisma.
- `audit-service` aparece renombrado en el índice a `operations-service`.
- Persistencia no confirmada con tres bases globales, tres schemas, migraciones, seeds y clientes generados.
- Docker Compose e init SQL orientados a esas tres bases globales.

## 4. Contradicciones y acción futura

| Archivo o zona | Contradicción | Acción futura | Fase responsable |
| --- | --- | --- | --- |
| `core-service/prisma/personal/schema.prisma` | Usa base global de personal y `restaurantId`; no modela sucursales ni acceso por sucursal | Sustituir por schema central `gastroflow_control` con `Branch`, `UserBranch` y `UserBranchRole` | Fase 2 |
| `core-service/prisma/customers/schema.prisma` | Clientes/reservaciones están en una base global de Core | Mover estos modelos al schema operacional común | Fase 2 |
| `operations-service/prisma/schema.prisma` | Una base global compartida y `restaurantId` en todas las tablas | Rediseñar schema para una base por sucursal y retirar discriminador redundante | Fase 2 |
| `core-service/prisma/*/migrations` | Migraciones iniciales de bases globales | Revisar y reemplazar por historias central/operacional; no aplicar el legado | Fase 2 |
| `operations-service/prisma/migrations` | Migración para `gastroflow_operaciones` global | Crear historia operacional canónica aplicable a cada sucursal | Fase 2 |
| `core-service/prisma/*/seed.ts` | Seeds multi-tenant por `restaurantId` | Crear seed central y plantilla operacional sin historial | Fase 2 |
| `operations-service/prisma/seed.ts` | Seed mezcla varios restaurantes en una base | Convertir a seed de una sucursal o catálogo de plantilla | Fase 2 |
| `core-service/src/database/personal` | PrismaService apunta al dominio global personal | Reemplazar por cliente central | Fase 2 |
| `core-service/src/database/customers` | Core administra una base global de clientes | Retirar tras mover clientes a Operations | Fase 2 |
| `operations-service/src/database/operations-prisma.service.ts` | Una URL fija para todas las operaciones | Diseñar resolvedor/caché de conexión por sucursal autorizada | Fase 2 |
| `core-service/src/database/tenant` | Aislamiento lógico por `restaurantId` | Reemplazar por autorización central de restaurante/sucursal | Fases 2-3 |
| `operations-service/src/database/restaurant-scope.ts` | Obliga filtro tenant en una base compartida | Retirar al adoptar base por sucursal; mantener autorización previa | Fases 2-3 |
| `operations-service/scripts/verify-tenant-isolation.ts` | Prueba aislamiento lógico en tres bases globales | Reescribir para dos bases físicas y selección segura | Fase 2 |
| `core-service/src/generated/*-client` | Clientes generados para personal/clientes globales | No editar manualmente; regenerar desde schemas definitivos | Fase 2 |
| `operations-service/src/generated/operations-client` | Cliente generado con `restaurantId` global | Regenerar desde schema operacional definitivo | Fase 2 |
| `core-service/.env.example` | URLs para personal y clientes globales | Definir sólo conexión/control central y mecanismo seguro necesario | Fase 2 |
| `operations-service/.env.example` | URL fija a `gastroflow_operaciones` | Definir acceso administrativo/secret store sin URL enviada por frontend | Fase 2 |
| `docker-compose.yml` | Base inicial `gastroflow_personal` | Alinear entorno local con control + bases de sucursal de prueba | Fase 2 |
| `docker/postgres/init/01-create-databases.sql` | Crea clientes y operaciones globales | Crear control y dos sucursales de desarrollo, si se conserva este mecanismo | Fase 2 |
| `package.json` raíz | Scripts Prisma de tres dominios y verificación por tenant lógico | Reemplazar tras definir los flujos definitivos | Fases 1-2 |
| `core-service/package.json` | Scripts personal/customers | Redefinir para schema central | Fase 2 |
| `operations-service/package.json` | Scripts de una única base global | Definir generación canónica y despliegue a múltiples bases | Fase 2 |
| `core-service/test/database.integration-spec.ts` | Prueba las bases globales | Reescribir para control central y autorización de sucursal | Fases 2-3 |
| `operations-service/test/database.integration-spec.ts` | Prueba tenancy por `restaurantId` | Reescribir para aislamiento físico y selección | Fase 2 |
| `docs/PHASE_2_REPORT.md` | Declara completa una arquitectura ahora descartada | Archivar como antecedente no vigente | Parte 0 |
| `docs/DATABASE_MODEL.md`, `DATABASE_SEPARATION.md`, `MIGRATIONS.md`, `PRISMA.md`, `RBAC.md` | Describen tres bases globales y roles por restaurante | Marcar como sustituidos y enlazar documentos vigentes | Parte 0 |

La eliminación staged del antiguo selector/caché de bases por sucursal también requiere revisión: sus detalles no deben restaurarse ciegamente, pero la capacidad de resolución dinámica sí vuelve a ser necesaria y debe diseñarse contra la especificación actual.

## 5. Documentos de Parte 0

Creados: `BRANCH_MODEL.md`, `DATABASE_STRATEGY.md`, `STAFF_MODEL.md`, `ACADEMIC_REQUIREMENTS.md`, `THESIS_VISION.md`, `TASK_LIST.md` y este informe.

Actualizados: `README.md`, `PROJECT_SPEC.md`, `ARCHITECTURE.md`, `SAAS_MODEL.md`, `INVENTORY.md`, `INVOICING.md`, `PROJECT_PHASES.md` y documentos históricos contradictorios.

## 6. Decisiones congeladas

1. GastroFlow es SaaS y atiende varios restaurantes.
2. Cada restaurante puede tener varias sucursales; una sucursal no es una aplicación ni un servicio.
3. Hay una base central `gastroflow_control`.
4. Cada sucursal tiene una base operacional propia con el mismo schema.
5. Gateway no usa Prisma; Core administra control; Operations administra bases operacionales.
6. Las tablas operacionales no requieren `branchId`.
7. Una nueva sucursal copia catálogos, no historial, e inicia stock y secuencias en cero.
8. Platillos se copian o crean, usan `imageUrl` y no exigen recetas estructuradas.
9. Personal es central y puede pertenecer a varias sucursales con roles diferentes.
10. Facturas nacen de pedidos, usan tasa configurable, conservan historia y no representan autorización SRI.
11. El proyecto debe evolucionar desde MVP académico hacia titulación.

El detalle completo de las 23 decisiones está distribuido en `PROJECT_SPEC.md` y los documentos de modelo.

## 7. Código pendiente de migración

Todo `prisma/`, `src/generated/`, los PrismaService, seeds, migraciones, configuración Docker, variables de bases, scripts de aislamiento e integraciones de persistencia mencionados en la tabla anterior. La migración debe ser revisada archivo por archivo; Parte 0 no autoriza borrado masivo.

## 8. Próximas fases

Fase 1 debe estabilizar estructura, configuración y contratos sin persistencia nueva. Fase 2 debe rediseñar Prisma desde cero conceptual: base central + schema operacional común + dos bases de sucursal de prueba + selección dinámica segura.

## 9. Confirmaciones de alcance

- No se instaló Prisma ni otra dependencia durante Parte 0.
- No se creó ni ejecutó ninguna migración durante Parte 0.
- No se creó ninguna base durante Parte 0.
- No se implementaron endpoints, JWT, RBAC ni lógica funcional durante Parte 0.
- No se hizo commit ni push durante Parte 0.

Los artefactos Prisma y migraciones visibles ya estaban presentes al iniciar esta Parte 0 como cambios no confirmados del encargo anterior.

## 10. Validación final

- Todos los documentos obligatorios existen.
- Los enlaces Markdown internos resuelven correctamente.
- La matriz contiene todos los temas académicos solicitados.
- No se detectaron valores con patrón de secreto en los archivos revisables.
- Git no rastrea `node_modules`, `dist` ni archivos `.env` reales, y ninguno aparece como alta nueva. Esos artefactos sí existen localmente e ignorados desde antes.
- `git diff --check`: código 0; sólo advertencias informativas de futura conversión LF/CRLF.
- `git diff --cached --check`: código 0.
- `git status --short`: 180 entradas al validar (25 ` M`, 45 `??`, 20 `D `, 8 `R `, 27 `RD` y 55 `RM`). La diferencia frente al estado inicial corresponde a los documentos nuevos de Parte 0; el gran conjunto de código staged/unstaged sigue intacto.
- El clúster PostgreSQL temporal heredado de la tarea anterior fue detenido; Parte 0 no creó ni alteró bases.
