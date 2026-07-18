# Matriz de requisitos acadÃ©micos

## ConvenciÃ³n de estados

- `PENDING`: aÃºn no diseÃ±ado o construido con evidencia suficiente.
- `DOCUMENTED`: explicado, pero no implementado.
- `IMPLEMENTED`: existe cÃ³digo alineado con la arquitectura vigente, todavÃ­a sin prueba suficiente.
- `TESTED`: implementaciÃ³n cubierta por una prueba ejecutable.
- `EVIDENCED`: probado y acompaÃ±ado por evidencia acadÃ©mica preparada para entrega.

Fase 2 verificÃ³ Prisma definitivo con PostgreSQL real, dos bases fÃ­sicas, migraciones, seeds, vistas, cifrado y selecciÃ³n dinÃ¡mica. AutenticaciÃ³n y mÃ³dulos comerciales permanecen `PENDING`. NingÃºn requisito se marca `EVIDENCED` porque aÃºn no existe un paquete acadÃ©mico externo de capturas.

| ID | Tema | Concepto | AplicaciÃ³n en GastroFlow | Fase | Proyecto responsable | Endpoint o archivo esperado | Prueba esperada | Evidencia esperada | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AC-001 | HTTP | Protocolo de aplicaciÃ³n | Frontend consume sÃ³lo el Gateway | 1 | API Gateway | `src/main.ts` | E2E de health | Request/response capturado | TESTED |
| AC-002 | HTTP/1.1 | ConexiÃ³n y mensajes | Base compatible del servidor HTTP | 12 | API Gateway | ConfiguraciÃ³n de despliegue | NegociaciÃ³n HTTP/1.1 | Captura de protocolo | DOCUMENTED |
| AC-003 | HTTP/2 | MultiplexaciÃ³n | EvaluaciÃ³n tras HTTPS | 12 | API Gateway | Proxy o servidor | NegociaciÃ³n h2 | Captura ALPN | DOCUMENTED |
| AC-004 | HTTP/3 | QUIC | InvestigaciÃ³n fuera del MVP | 12 | Infraestructura | Documento de despliegue | Prueba exploratoria | Informe comparativo | DOCUMENTED |
| AC-005 | HTTP frente a HTTPS | Transporte cifrado | HTTP local; HTTPS obligatorio al desplegar | 12 | Infraestructura | Proxy/TLS | RedirecciÃ³n y certificado | Captura TLS | DOCUMENTED |
| AC-006 | Cliente-servidor | SeparaciÃ³n de responsabilidades | React solicita; Gateway responde | 1 | Frontend / Gateway | `docs/CLIENT_SERVER.md` | E2E de health | Diagrama y respuesta | TESTED |
| AC-007 | Request | Solicitud HTTP | MÃ©todo, ruta, headers y body | 1 | API Gateway | `/api/v1/health` | Supertest | Registro de prueba | TESTED |
| AC-008 | Response | Respuesta HTTP | Estado y JSON estable | 1 | API Gateway | `/api/v1/health` | Supertest | JSON de respuesta | TESTED |
| AC-009 | Headers | Metadatos HTTP | Content-Type y futura autorizaciÃ³n | 3 | API Gateway | Middleware/Guard | IntegraciÃ³n de headers | Captura de Postman | DOCUMENTED |
| AC-010 | Body | Carga de solicitud | DTO JSON para comandos | 4 | API Gateway | `POST /api/v1/branches` | ValidaciÃ³n de body | Casos vÃ¡lido/invÃ¡lido | PENDING |
| AC-011 | JSON | RepresentaciÃ³n | Contrato externo del Gateway | 1 | API Gateway | Controllers | E2E Content-Type | Respuesta guardada | TESTED |
| AC-012 | GET | Lectura | Health y futuros listados | 1 | API Gateway | `GET /api/v1/health` | E2E 200/503 | Reporte Jest | TESTED |
| AC-013 | POST | CreaciÃ³n/acciÃ³n | Sucursales y selecciÃ³n futura | 4 | Gateway / Core | `/api/v1/branches`, `/session/branch` | E2E 201/errores | ColecciÃ³n Postman | PENDING |
| AC-014 | PUT | Reemplazo | SÃ³lo donde el recurso lo requiera | 6 | Gateway / Operations | Endpoint por definir | E2E idempotencia | Contrato OpenAPI | PENDING |
| AC-015 | PATCH | ActualizaciÃ³n parcial | Estado, catÃ¡logo y archivo lÃ³gico | 6 | Gateway / Operations | Endpoint por definir | E2E de cambios parciales | ColecciÃ³n Postman | PENDING |
| AC-016 | DELETE | EliminaciÃ³n | SÃ³lo recursos permitidos; no facturas | 6 | Gateway / Services | Endpoint por definir | E2E y reglas de integridad | Casos de prueba | PENDING |
| AC-017 | CÃ³digos HTTP | SemÃ¡ntica | 2xx, 4xx y 5xx coherentes | 1 | API Gateway | Health controller | E2E 200/503 | Reporte Jest | TESTED |
| AC-018 | NestJS | Framework backend | Tres proyectos NestJS separados | 1 | Backend | `*/src/main.ts` | Build y smoke test | Ãrbol del repositorio | TESTED |
| AC-019 | Controllers | Adaptador de entrada | HTTP en Gateway, mensajes TCP en servicios | 1 | Backend | `app.controller.ts` | Unitarias | Reporte Jest | TESTED |
| AC-020 | Services | Casos de uso | LÃ³gica fuera de controllers | 4 | Core / Operations | `src/**/**.service.ts` | Unitarias aisladas | Cobertura | TESTED |
| AC-021 | DTO | Contratos tipados | ValidaciÃ³n de entradas pÃºblicas | 4 | Gateway / Services | `src/**/dto` | Unitarias de DTO | Matriz vÃ¡lido/invÃ¡lido | TESTED |
| AC-022 | Entidades | Modelo de dominio | Restaurant, Branch y agregados operativos | 2 | Core / Operations | Schemas y dominio | Pruebas de invariantes | Diagrama ER | TESTED |
| AC-023 | class-validator | Reglas declarativas | Validar DTO | 4 | Backend | DTO futuros | Casos de error | Captura 400 | TESTED |
| AC-024 | class-transformer | TransformaciÃ³n | ConversiÃ³n segura de query/body | 4 | Backend | DTO futuros | Pruebas de transformaciÃ³n | Reporte Jest | TESTED |
| AC-025 | ValidationPipe | Frontera de entrada | Pipe global del Gateway | 1 | API Gateway | `src/configure-http-app.ts` | ConfiguraciÃ³n y E2E HTTP | Reporte Jest | TESTED |
| AC-026 | Prisma | Acceso tipado | Central y schema operacional por sucursal | 2 | Core / Operations | schemas definitivos | Validate/generate | Salida CLI | TESTED |
| AC-027 | ORM | Mapeo objeto-relacional | Prisma encapsula PostgreSQL | 2 | Core / Operations | Capa de persistencia | IntegraciÃ³n real | Reporte de prueba | TESTED |
| AC-028 | schema.prisma | Modelo declarativo | Un schema central y uno operacional | 2 | Core / Operations | `prisma/control`, `prisma/branch` | `prisma validate` | Diff revisado | TESTED |
| AC-029 | PrismaService | Ciclo de conexiÃ³n | Central fijo y operaciones dinÃ¡micas | 2 | Core / Operations | `src/database` | Init/destroy y errores | Reporte Jest | TESTED |
| AC-030 | findMany | Consulta ORM | Consultas internas de sucursales | 2 | Services | resolver y pruebas | IntegraciÃ³n de filtros | SQL/log seguro | TESTED |
| AC-031 | create | Escritura ORM | Seeds y aislamiento | 2 | Services | seeds/verificador | Integridad | Datos verificados | TESTED |
| AC-032 | Arquitectura monolÃ­tica | ComparaciÃ³n | Contrastar con servicios separados | 1 | DocumentaciÃ³n | `docs/ARCHITECTURE.md` | RevisiÃ³n acadÃ©mica | Cuadro comparativo | DOCUMENTED |
| AC-033 | Arquitectura en capas | OrganizaciÃ³n | Controllers, aplicaciÃ³n, dominio y persistencia | 4 | Backend | estructura futura | Pruebas por capa | Diagrama | DOCUMENTED |
| AC-034 | Microservicios | Servicios autÃ³nomos | Gateway, Core y Operations | 1 | Backend | `docs/MICROSERVICES.md` | Health TCP | Diagrama y pruebas | TESTED |
| AC-035 | Hexagonal | Puertos y adaptadores | Aislar HTTP/TCP/Prisma del dominio | 4 | Backend | interfaces futuras | Unitarias sin infraestructura | Diagrama de puertos | DOCUMENTED |
| AC-036 | REST | Estilo de API | Recursos HTTP sÃ³lo en Gateway | 4 | API Gateway | `/api/v1` | E2E de contratos | ColecciÃ³n Postman | DOCUMENTED |
| AC-037 | Recursos | Sustantivos de dominio | branches, products, orders, invoices | 4 | API Gateway | rutas futuras | RevisiÃ³n de naming | CatÃ¡logo de API | PENDING |
| AC-038 | Endpoints | Operaciones pÃºblicas | Gateway traduce a TCP | 4 | API Gateway | controllers futuros | E2E | Postman/OpenAPI | PENDING |
| AC-039 | Versionamiento `/api/v1` | Compatibilidad | Prefijo global HTTP | 1 | API Gateway | `src/main.ts` | E2E de ruta | Captura 200 | TESTED |
| AC-040 | Query params | Opciones de lectura | Filtros y paginaciÃ³n | 6 | API Gateway | listados futuros | ValidaciÃ³n de query | Casos Postman | PENDING |
| AC-041 | BÃºsqueda | Coincidencias controladas | CatÃ¡logo, clientes y facturas | 6 | Operations | endpoints futuros | Relevancia y aislamiento | Dataset de prueba | PENDING |
| AC-042 | Filtros | RestricciÃ³n de resultados | Estado, fecha y sucursal activa | 6 | Operations | repositorios futuros | IntegraciÃ³n | Resultados esperados | PENDING |
| AC-043 | PaginaciÃ³n | Listados acotados | Especialmente facturas/historial | 6 | Operations | DTO de paginaciÃ³n | Bordes y orden estable | Evidencia Postman | PENDING |
| AC-044 | Migraciones | EvoluciÃ³n del schema | Central y todas las bases de sucursal | 2 | Core / Operations | historiales definitivos | Deploy en bases de prueba | Salida CLI | TESTED |
| AC-045 | Vistas SQL | Lecturas derivadas | Cinco vistas operacionales | 2 | Operations | migraciÃ³n SQL | Existencia en dos bases | Reporte integraciÃ³n | TESTED |
| AC-046 | JWT | Token firmado | Identidad y contexto autorizado | 3 | Core / Gateway | auth module | E2E vÃ¡lido/expirado | Claims sanitizados | TESTED |
| AC-047 | Passport | Estrategia auth | ValidaciÃ³n JWT | 3 | Core / Gateway | strategy futura | Unitarias/E2E | Reporte Jest | TESTED |
| AC-048 | bcrypt | Hash de contraseÃ±a | Seed central; login futuro | 2-3 | Core | seed y auth futura | Hash en PostgreSQL | Test sin secretos | TESTED |
| AC-049 | Guards | AutorizaciÃ³n | Proteger rutas y permisos | 3 | Gateway / Core | guards futuros | 401/403/200 | Matriz de acceso | TESTED |
| AC-050 | CurrentUser | Contexto | Usuario autenticado tipado | 3 | Backend | decorator futuro | Unitarias | Claims esperados | TESTED |
| AC-051 | Refresh Token | RenovaciÃ³n segura | RotaciÃ³n/revocaciÃ³n central | 3 | Core | modelo y endpoint futuro | Reuso/revocaciÃ³n | Evidencia E2E | TESTED |
| AC-052 | RBAC | Acceso por sucursal | Roles distintos por UserBranch | 3 | Core | guards y relaciones | Matriz de permisos | Reporte de autorizaciÃ³n | TESTED |
| AC-053 | users | Identidades | Usuarios centrales | 2 | Core | schema central | IntegraciÃ³n de seed | Registros de prueba | TESTED |
| AC-054 | roles | AgrupaciÃ³n de permisos | Roles del restaurante por sucursal | 2 | Core | schema central | Integridad | Diagrama ER | TESTED |
| AC-055 | permissions | Capacidades | CatÃ¡logo de acciones | 2 | Core | schema central | Unicidad | Seed revisado | TESTED |
| AC-056 | user_roles | Rol base | RelaciÃ³n N:M central | 2 | Core | schema central | Integridad relacional | Diagrama ER | TESTED |
| AC-057 | role_permissions | ComposiciÃ³n RBAC | Permisos por rol | 2 | Core | schema central | Integridad relacional | Matriz RBAC | TESTED |
| AC-058 | Transacciones | Unidad atÃ³mica | Stock, compras, secuencia y factura | 7-10 | Operations | casos de uso futuros | Fallo/rollback | Evidencia de invariantes | PENDING |
| AC-059 | ACID | Propiedades transaccionales | Consistencia en PostgreSQL | 7-10 | Operations | capa de persistencia | Concurrencia/rollback | Informe tÃ©cnico | PENDING |
| AC-060 | DesestructuraciÃ³n | Sintaxis JS/TS | DTO y mapeos legibles | 4 | Backend / Frontend | cÃ³digo futuro | Lint/unitarias | Fragmento explicado | PENDING |
| AC-061 | Consultas derivadas | Datos calculados | Totales, dashboard y stock | 9-12 | Operations | query/service futuro | ComparaciÃ³n esperada | Dataset y resultado | PENDING |
| AC-062 | Consultas nativas | SQL especÃ­fico | Vistas/reportes justificados | 2-12 | Operations | migraciÃ³n y `$queryRaw` de prueba | IntegraciÃ³n PostgreSQL | SQL y plan | TESTED |
| AC-063 | Postman | Cliente de prueba | ColecciÃ³n sobre Gateway | 4-12 | API Gateway | `postman/` futuro | EjecuciÃ³n de colecciÃ³n | Export y capturas | IMPLEMENTED |
| AC-064 | Pruebas | Calidad | Unitarias, E2E e integraciÃ³n | Todas | Todos | `*.spec.ts` | Suites por fase | Reportes | TESTED |
| AC-065 | HTTPS | Seguridad de transporte | TLS en despliegue | 12 | Infraestructura | proxy/certificados | SSL Labs o equivalente | Captura de certificado | DOCUMENTED |
| AC-066 | Despliegue | Entrega estable | Servicios, DB, secretos y backups | 12 | Infraestructura | pipeline/guÃ­a futura | Smoke/rollback | URL y pipeline | PENDING |

## Criterio de avance

Un requisito sÃ³lo avanzarÃ¡ de `DOCUMENTED` cuando el cÃ³digo pertenezca a la arquitectura vigente. `TESTED` exige una prueba ejecutable y `EVIDENCED` exige ademÃ¡s un artefacto acadÃ©mico reproducible.
# Matriz Fase 3

| Requisito | Estado |
|---|---|
| JWT, Passport, bcrypt, DTO y ValidationPipe | TESTED |
| Guards, CurrentUser, roles, permisos, 401 y 403 | TESTED |
| Refresh Token, rotación y revocación | TESTED |
| Evidencia visual/manual | PENDING |
| Registro pÃºblico | PENDING |
