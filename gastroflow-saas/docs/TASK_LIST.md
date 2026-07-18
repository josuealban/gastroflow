# Lista de tareas

## Parte 0 â€” congelaciÃ³n âœ…

- [x] Capturar rama, estado, historial, diff, archivos y versiones.
- [x] Inspeccionar proyectos, HTTP/TCP, health, entornos, Docker, Prisma, scripts, docs y pruebas.
- [x] Congelar arquitectura, estrategia de bases, sucursales, personal, inventario y facturaciÃ³n.
- [x] Crear matriz acadÃ©mica y visiÃ³n de titulaciÃ³n.
- [x] Inventariar contradicciones sin borrar cÃ³digo masivamente.
- [x] Validar documentaciÃ³n, secretos y artefactos ignorados.

---

## Fase 1 â€” estructura base âœ…

- [x] Conservar cuatro proyectos independientes.
- [x] Conservar Gateway HTTP 3000, Core TCP 3001 y Operations TCP 3002.
- [x] Conservar frontend apuntando Ãºnicamente al Gateway.
- [x] Alinear el nombre activo `operations-service` en cÃ³digo, variables y scripts.
- [x] Crear `.gitattributes` y `.editorconfig` sin reformateo masivo.
- [x] Configurar `/api/v1`, `ValidationPipe`, CORS y apagado ordenado.
- [x] Validar hosts, puertos, timeout y orÃ­genes con mensajes seguros.
- [x] Reutilizar clientes TCP con tokens de inyecciÃ³n Ãºnicos.
- [x] Definir contratos `{ cmd: 'core.health' }` y `{ cmd: 'operations.health' }`.
- [x] Devolver HTTP 200 saludable y HTTP 503 degradado/indisponible.
- [x] Retirar scripts raÃ­z de las tres bases globales.
- [x] Crear scripts reales de inicio, desarrollo, lint, test y build.
- [x] Corregir los cuatro `.env.example` sin aÃ±adir secretos.
- [x] Implementar la pantalla tÃ©cnica de estado y actualizaciÃ³n real.
- [x] Ejecutar lint sin errores en los cuatro proyectos.
- [x] Ejecutar 41+ pruebas unitarias y 6+ pruebas E2E correctamente.
- [x] Compilar los cuatro proyectos desde la raÃ­z.
- [x] Verificar manualmente health 200, degradaciÃ³n 503 y frontend real.
- [x] Documentar HTTP, cliente-servidor y microservicios.

---

## Fase 2 â€” Prisma y persistencia âœ…

- [x] Retirar Prisma provisional y las tres bases globales.
- [x] DiseÃ±ar schema central `gastroflow_control`.
- [x] Incluir `Restaurant`, `Branch`, `Subscription`, `Plan`, `User`, `Role`, `Permission`, `UserRole`, `UserBranchRole`.
- [x] DiseÃ±ar schema operacional Ãºnico sin `branchId` ni `restaurantId` globales.
- [x] Crear migraciÃ³n inicial de `gastroflow_control`.
- [x] Crear migraciÃ³n operacional con schema completo y 5 vistas SQL.
- [x] Crear seeds de desarrollo para control, Principal y Norte.
- [x] Crear bases `gastroflow_demo_principal` y `gastroflow_demo_norte`.
- [x] Implementar cifrado AES-256-GCM en `DatabaseCredentialsEncryptionService`.
- [x] Implementar resoluciÃ³n TCP segura en `BranchConnectionResolverService`.
- [x] Implementar `BranchConnectionController` con `{ cmd: 'branch.connection.resolve' }`.
- [x] Reparar `branch-connection.controller.ts` y `branch-connection-resolver.service.ts` (corrupciÃ³n UTF-16).
- [x] Implementar factorÃ­a de Prisma Client por sucursal.
- [x] Implementar cachÃ© de Prisma Clients con desconexiÃ³n en apagado.
- [x] Implementar `BranchConnectionResolverClient` en Operations.
- [x] Verificar aislamiento fÃ­sico entre Principal y Norte (requiere PostgreSQL activo).
- [x] Implementar `vw_low_stock`, `vw_daily_sales`, `vw_invoice_summary`, `vw_top_selling_products`, `vw_inventory_movements_summary`.
- [x] Compilar los cuatro proyectos sin errores TS.
- [x] Ejecutar lint en los cuatro proyectos sin errores.
- [x] Ejecutar 30 pruebas unitarias en Core, 20 en Operations, 15 en Gateway.
- [x] Ejecutar E2E: 1 en Core, 1 en Operations, 4 en Gateway.
- [x] Verificar health general HTTP 200 con todos los servicios.
- [x] Actualizar documentaciÃ³n de Fase 2.
- [x] Corregir `branch-status.ts` (importaba `branch-client` en lugar de `control-client`).

---

## Fase 3 — autenticación ✅

- [x] Login multirrestaurante, DTO, bcrypt y hash de contraseña
- [x] Access Token y Refresh Token con hash SHA-256
- [x] Cookie HttpOnly configurable
- [x] Rotación, revocación, logout y concurrencia segura
- [x] Passport, JwtStrategy, JwtAuthGuard y CurrentUser
- [x] RolesGuard, PermissionsGuard, 401, 403 y 429
- [x] Listado y selección segura de sucursal de sesión
- [x] E2E de autenticación, frontend mínimo, Postman y documentación
- [ ] Integración PostgreSQL y evidencia manual (credenciales locales rechazadas; Docker no disponible)

---
## Fase 4 — sucursales

- [x] Listado, detalle, creación 202, edición y estados
- [x] Plan, límite, idempotencia, PROVISIONING y trabajo persistente
- [x] Reclamo atómico, recuperación, retry y asignaciones iniciales
- [x] Aprovisionador Operations, migrate deploy, plantilla e invalidación
- [x] Frontend mínimo, E2E, Postman y documentación
- [ ] Integración PostgreSQL real y prueba manual (entorno no disponible)

- [x] Implementar listado y selecciÃ³n autorizada de sucursal.
- [x] Implementar `POST /api/v1/session/branch`.
- [x] Implementar `POST /api/v1/branches` sin secretos en el DTO.
- [x] Implementar estados `PROVISIONING`, `ACTIVE` y `FAILED`.
- [x] Crear el aprovisionador de base operacional, aplicar schema, copiar catÃ¡logos e inicializar en cero.
- [x] Probar de forma aislada reintentos y lÃ­mites del plan.
- [ ] Verificar aprovisionamiento y compensaciÃ³n contra PostgreSQL real (entorno no disponible).

---

## Fase 5 â€” personal â³ PENDIENTE

- [ ] Implementar usuarios y perfiles centrales.
- [ ] Implementar `UserBranchRole` y asignaciones.
- [ ] Asignar propietario al crear sucursal.
- [ ] Implementar pantalla y flujo `+ Asignar personal`.

---

## Fase 6 â€” platillos â³ PENDIENTE

- [ ] Implementar categorÃ­as y platillos.
- [ ] Implementar `+ Nuevo platillo`.
- [ ] Guardar imÃ¡genes externamente y sÃ³lo `imageUrl` en PostgreSQL.
- [ ] Permitir ingredientes como texto libre, sin receta obligatoria.

---

## Fase 7 â€” inventario y compras â³ PENDIENTE

- [ ] Implementar tipos, unidades y catÃ¡logo de inventario.
- [ ] Implementar proveedores, compras y movimientos transaccionales.
- [ ] Inicializar existencias y costos en cero al copiar plantilla.
- [ ] Implementar consulta periÃ³dica de 15 o 30 segundos.

---

## Fase 8 â€” clientes y mesas â³ PENDIENTE

- [ ] Implementar clientes y reservaciones en la base de sucursal.
- [ ] Implementar mesas, estados, bÃºsqueda, filtros y paginaciÃ³n.

---

## Fase 9 â€” pedidos â³ PENDIENTE

- [ ] Implementar pedidos con varios platillos.
- [ ] Conservar snapshots de nombre y precio.
- [ ] Integrar mesas, clientes y personal autorizado.

---

## Fase 10 â€” facturaciÃ³n â³ PENDIENTE

- [ ] Generar factura interna desde el pedido.
- [ ] Leer tasa activa desde `TaxConfiguration`.
- [ ] Proteger secuencia mediante transacciÃ³n.
- [ ] Implementar historia, filtros, paginaciÃ³n y archivo lÃ³gico.
- [ ] Mantener explÃ­citamente fuera del MVP la autorizaciÃ³n SRI.

---

## Fase 11 â€” frontend comercial â³ PENDIENTE

- [ ] Implementar login y tarjetas de sucursales.
- [ ] Implementar selecciÃ³n de sucursal y navegaciÃ³n protegida.
- [ ] Implementar pantallas de personal, platillos, inventario, clientes, pedidos y facturas.
- [ ] Implementar estados de carga, vacÃ­o y error accesibles.

---

## Fase 12 â€” reportes, calidad y despliegue â³ PENDIENTE

- [ ] Crear colecciÃ³n Postman y evidencia acadÃ©mica.
- [ ] Completar unitarias, E2E, integraciÃ³n, seguridad y rendimiento.
- [ ] Implementar reportes y vistas SQL adicionales justificadas.
- [ ] Configurar HTTPS, secretos, backups, observabilidad y CI/CD.
- [ ] Validar usabilidad con usuarios y documentar resultados.
