# Matriz de requisitos académicos

## Convención de estados

- `PENDING`: aún no diseñado o construido con evidencia suficiente.
- `DOCUMENTED`: explicado, pero no implementado.
- `IMPLEMENTED`: existe código alineado con la arquitectura vigente, todavía sin prueba suficiente.
- `TESTED`: implementación cubierta por una prueba ejecutable.
- `EVIDENCED`: probado y acompañado por evidencia académica preparada para entrega.

Fase 2 verificó Prisma definitivo con PostgreSQL real, dos bases físicas, migraciones, seeds, vistas, cifrado y selección dinámica. Autenticación y módulos comerciales permanecen `PENDING`. Ningún requisito se marca `EVIDENCED` porque aún no existe un paquete académico externo de capturas.

| ID | Tema | Concepto | Aplicación en GastroFlow | Fase | Proyecto responsable | Endpoint o archivo esperado | Prueba esperada | Evidencia esperada | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AC-001 | HTTP | Protocolo de aplicación | Frontend consume sólo el Gateway | 1 | API Gateway | `src/main.ts` | E2E de health | Request/response capturado | TESTED |
| AC-002 | HTTP/1.1 | Conexión y mensajes | Base compatible del servidor HTTP | 12 | API Gateway | Configuración de despliegue | Negociación HTTP/1.1 | Captura de protocolo | DOCUMENTED |
| AC-003 | HTTP/2 | Multiplexación | Evaluación tras HTTPS | 12 | API Gateway | Proxy o servidor | Negociación h2 | Captura ALPN | DOCUMENTED |
| AC-004 | HTTP/3 | QUIC | Investigación fuera del MVP | 12 | Infraestructura | Documento de despliegue | Prueba exploratoria | Informe comparativo | DOCUMENTED |
| AC-005 | HTTP frente a HTTPS | Transporte cifrado | HTTP local; HTTPS obligatorio al desplegar | 12 | Infraestructura | Proxy/TLS | Redirección y certificado | Captura TLS | DOCUMENTED |
| AC-006 | Cliente-servidor | Separación de responsabilidades | React solicita; Gateway responde | 1 | Frontend / Gateway | `docs/CLIENT_SERVER.md` | E2E de health | Diagrama y respuesta | TESTED |
| AC-007 | Request | Solicitud HTTP | Método, ruta, headers y body | 1 | API Gateway | `/api/v1/health` | Supertest | Registro de prueba | TESTED |
| AC-008 | Response | Respuesta HTTP | Estado y JSON estable | 1 | API Gateway | `/api/v1/health` | Supertest | JSON de respuesta | TESTED |
| AC-009 | Headers | Metadatos HTTP | Content-Type y futura autorización | 3 | API Gateway | Middleware/Guard | Integración de headers | Captura de Postman | DOCUMENTED |
| AC-010 | Body | Carga de solicitud | DTO JSON para comandos | 4 | API Gateway | `POST /api/v1/branches` | Validación de body | Casos válido/inválido | PENDING |
| AC-011 | JSON | Representación | Contrato externo del Gateway | 1 | API Gateway | Controllers | E2E Content-Type | Respuesta guardada | TESTED |
| AC-012 | GET | Lectura | Health y futuros listados | 1 | API Gateway | `GET /api/v1/health` | E2E 200/503 | Reporte Jest | TESTED |
| AC-013 | POST | Creación/acción | Sucursales y selección futura | 4 | Gateway / Core | `/api/v1/branches`, `/session/branch` | E2E 201/errores | Colección Postman | PENDING |
| AC-014 | PUT | Reemplazo | Sólo donde el recurso lo requiera | 6 | Gateway / Operations | Endpoint por definir | E2E idempotencia | Contrato OpenAPI | PENDING |
| AC-015 | PATCH | Actualización parcial | Estado, catálogo y archivo lógico | 6 | Gateway / Operations | Endpoint por definir | E2E de cambios parciales | Colección Postman | PENDING |
| AC-016 | DELETE | Eliminación | Sólo recursos permitidos; no facturas | 6 | Gateway / Services | Endpoint por definir | E2E y reglas de integridad | Casos de prueba | PENDING |
| AC-017 | Códigos HTTP | Semántica | 2xx, 4xx y 5xx coherentes | 1 | API Gateway | Health controller | E2E 200/503 | Reporte Jest | TESTED |
| AC-018 | NestJS | Framework backend | Tres proyectos NestJS separados | 1 | Backend | `*/src/main.ts` | Build y smoke test | Árbol del repositorio | TESTED |
| AC-019 | Controllers | Adaptador de entrada | HTTP en Gateway, mensajes TCP en servicios | 1 | Backend | `app.controller.ts` | Unitarias | Reporte Jest | TESTED |
| AC-020 | Services | Casos de uso | Lógica fuera de controllers | 4 | Core / Operations | `src/**/**.service.ts` | Unitarias aisladas | Cobertura | TESTED |
| AC-021 | DTO | Contratos tipados | Validación de entradas públicas | 4 | Gateway / Services | `src/**/dto` | Unitarias de DTO | Matriz válido/inválido | PENDING |
| AC-022 | Entidades | Modelo de dominio | Restaurant, Branch y agregados operativos | 2 | Core / Operations | Schemas y dominio | Pruebas de invariantes | Diagrama ER | TESTED |
| AC-023 | class-validator | Reglas declarativas | Validar DTO | 4 | Backend | DTO futuros | Casos de error | Captura 400 | PENDING |
| AC-024 | class-transformer | Transformación | Conversión segura de query/body | 4 | Backend | DTO futuros | Pruebas de transformación | Reporte Jest | PENDING |
| AC-025 | ValidationPipe | Frontera de entrada | Pipe global del Gateway | 1 | API Gateway | `src/configure-http-app.ts` | Configuración y E2E HTTP | Reporte Jest | IMPLEMENTED |
| AC-026 | Prisma | Acceso tipado | Central y schema operacional por sucursal | 2 | Core / Operations | schemas definitivos | Validate/generate | Salida CLI | TESTED |
| AC-027 | ORM | Mapeo objeto-relacional | Prisma encapsula PostgreSQL | 2 | Core / Operations | Capa de persistencia | Integración real | Reporte de prueba | TESTED |
| AC-028 | schema.prisma | Modelo declarativo | Un schema central y uno operacional | 2 | Core / Operations | `prisma/control`, `prisma/branch` | `prisma validate` | Diff revisado | TESTED |
| AC-029 | PrismaService | Ciclo de conexión | Central fijo y operaciones dinámicas | 2 | Core / Operations | `src/database` | Init/destroy y errores | Reporte Jest | TESTED |
| AC-030 | findMany | Consulta ORM | Consultas internas de sucursales | 2 | Services | resolver y pruebas | Integración de filtros | SQL/log seguro | TESTED |
| AC-031 | create | Escritura ORM | Seeds y aislamiento | 2 | Services | seeds/verificador | Integridad | Datos verificados | TESTED |
| AC-032 | Arquitectura monolítica | Comparación | Contrastar con servicios separados | 1 | Documentación | `docs/ARCHITECTURE.md` | Revisión académica | Cuadro comparativo | DOCUMENTED |
| AC-033 | Arquitectura en capas | Organización | Controllers, aplicación, dominio y persistencia | 4 | Backend | estructura futura | Pruebas por capa | Diagrama | DOCUMENTED |
| AC-034 | Microservicios | Servicios autónomos | Gateway, Core y Operations | 1 | Backend | `docs/MICROSERVICES.md` | Health TCP | Diagrama y pruebas | TESTED |
| AC-035 | Hexagonal | Puertos y adaptadores | Aislar HTTP/TCP/Prisma del dominio | 4 | Backend | interfaces futuras | Unitarias sin infraestructura | Diagrama de puertos | DOCUMENTED |
| AC-036 | REST | Estilo de API | Recursos HTTP sólo en Gateway | 4 | API Gateway | `/api/v1` | E2E de contratos | Colección Postman | DOCUMENTED |
| AC-037 | Recursos | Sustantivos de dominio | branches, products, orders, invoices | 4 | API Gateway | rutas futuras | Revisión de naming | Catálogo de API | PENDING |
| AC-038 | Endpoints | Operaciones públicas | Gateway traduce a TCP | 4 | API Gateway | controllers futuros | E2E | Postman/OpenAPI | PENDING |
| AC-039 | Versionamiento `/api/v1` | Compatibilidad | Prefijo global HTTP | 1 | API Gateway | `src/main.ts` | E2E de ruta | Captura 200 | TESTED |
| AC-040 | Query params | Opciones de lectura | Filtros y paginación | 6 | API Gateway | listados futuros | Validación de query | Casos Postman | PENDING |
| AC-041 | Búsqueda | Coincidencias controladas | Catálogo, clientes y facturas | 6 | Operations | endpoints futuros | Relevancia y aislamiento | Dataset de prueba | PENDING |
| AC-042 | Filtros | Restricción de resultados | Estado, fecha y sucursal activa | 6 | Operations | repositorios futuros | Integración | Resultados esperados | PENDING |
| AC-043 | Paginación | Listados acotados | Especialmente facturas/historial | 6 | Operations | DTO de paginación | Bordes y orden estable | Evidencia Postman | PENDING |
| AC-044 | Migraciones | Evolución del schema | Central y todas las bases de sucursal | 2 | Core / Operations | historiales definitivos | Deploy en bases de prueba | Salida CLI | TESTED |
| AC-045 | Vistas SQL | Lecturas derivadas | Cinco vistas operacionales | 2 | Operations | migración SQL | Existencia en dos bases | Reporte integración | TESTED |
| AC-046 | JWT | Token firmado | Identidad y contexto autorizado | 3 | Core / Gateway | auth module | E2E válido/expirado | Claims sanitizados | PENDING |
| AC-047 | Passport | Estrategia auth | Validación JWT | 3 | Core / Gateway | strategy futura | Unitarias/E2E | Reporte Jest | PENDING |
| AC-048 | bcrypt | Hash de contraseña | Seed central; login futuro | 2-3 | Core | seed y auth futura | Hash en PostgreSQL | Test sin secretos | IMPLEMENTED |
| AC-049 | Guards | Autorización | Proteger rutas y permisos | 3 | Gateway / Core | guards futuros | 401/403/200 | Matriz de acceso | PENDING |
| AC-050 | CurrentUser | Contexto | Usuario autenticado tipado | 3 | Backend | decorator futuro | Unitarias | Claims esperados | PENDING |
| AC-051 | Refresh Token | Renovación segura | Rotación/revocación central | 3 | Core | modelo y endpoint futuro | Reuso/revocación | Evidencia E2E | PENDING |
| AC-052 | RBAC | Acceso por sucursal | Roles distintos por UserBranch | 3 | Core | guards y relaciones | Matriz de permisos | Reporte de autorización | PENDING |
| AC-053 | users | Identidades | Usuarios centrales | 2 | Core | schema central | Integración de seed | Registros de prueba | TESTED |
| AC-054 | roles | Agrupación de permisos | Roles del restaurante por sucursal | 2 | Core | schema central | Integridad | Diagrama ER | TESTED |
| AC-055 | permissions | Capacidades | Catálogo de acciones | 2 | Core | schema central | Unicidad | Seed revisado | TESTED |
| AC-056 | user_roles | Rol base | Relación N:M central | 2 | Core | schema central | Integridad relacional | Diagrama ER | TESTED |
| AC-057 | role_permissions | Composición RBAC | Permisos por rol | 2 | Core | schema central | Integridad relacional | Matriz RBAC | TESTED |
| AC-058 | Transacciones | Unidad atómica | Stock, compras, secuencia y factura | 7-10 | Operations | casos de uso futuros | Fallo/rollback | Evidencia de invariantes | PENDING |
| AC-059 | ACID | Propiedades transaccionales | Consistencia en PostgreSQL | 7-10 | Operations | capa de persistencia | Concurrencia/rollback | Informe técnico | PENDING |
| AC-060 | Desestructuración | Sintaxis JS/TS | DTO y mapeos legibles | 4 | Backend / Frontend | código futuro | Lint/unitarias | Fragmento explicado | PENDING |
| AC-061 | Consultas derivadas | Datos calculados | Totales, dashboard y stock | 9-12 | Operations | query/service futuro | Comparación esperada | Dataset y resultado | PENDING |
| AC-062 | Consultas nativas | SQL específico | Vistas/reportes justificados | 2-12 | Operations | migración y `$queryRaw` de prueba | Integración PostgreSQL | SQL y plan | TESTED |
| AC-063 | Postman | Cliente de prueba | Colección sobre Gateway | 4-12 | API Gateway | `postman/` futuro | Ejecución de colección | Export y capturas | PENDING |
| AC-064 | Pruebas | Calidad | Unitarias, E2E e integración | Todas | Todos | `*.spec.ts` | Suites por fase | Reportes | TESTED |
| AC-065 | HTTPS | Seguridad de transporte | TLS en despliegue | 12 | Infraestructura | proxy/certificados | SSL Labs o equivalente | Captura de certificado | DOCUMENTED |
| AC-066 | Despliegue | Entrega estable | Servicios, DB, secretos y backups | 12 | Infraestructura | pipeline/guía futura | Smoke/rollback | URL y pipeline | PENDING |

## Criterio de avance

Un requisito sólo avanzará de `DOCUMENTED` cuando el código pertenezca a la arquitectura vigente. `TESTED` exige una prueba ejecutable y `EVIDENCED` exige además un artefacto académico reproducible.
# Matriz Fase 3

| Requisito | Estado |
|---|---|
| JWT, Passport, bcrypt, DTO y ValidationPipe | TESTED |
| Guards, CurrentUser, roles, permisos, 401 y 403 | TESTED |
| Refresh Token, rotación y revocación | IMPLEMENTED |
| Evidencia visual/manual | PENDING |
| Registro público | PENDING |
