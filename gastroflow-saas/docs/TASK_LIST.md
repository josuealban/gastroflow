# Lista de tareas

## Parte 0 — congelación ✅

- [x] Capturar rama, estado, historial, diff, archivos y versiones.
- [x] Inspeccionar proyectos, HTTP/TCP, health, entornos, Docker, Prisma, scripts, docs y pruebas.
- [x] Congelar arquitectura, estrategia de bases, sucursales, personal, inventario y facturación.
- [x] Crear matriz académica y visión de titulación.
- [x] Inventariar contradicciones sin borrar código masivamente.
- [x] Validar documentación, secretos y artefactos ignorados.

---

## Fase 1 — estructura base ✅

- [x] Conservar cuatro proyectos independientes.
- [x] Conservar Gateway HTTP 3000, Core TCP 3001 y Operations TCP 3002.
- [x] Conservar frontend apuntando únicamente al Gateway.
- [x] Alinear el nombre activo `operations-service` en código, variables y scripts.
- [x] Crear `.gitattributes` y `.editorconfig` sin reformateo masivo.
- [x] Configurar `/api/v1`, `ValidationPipe`, CORS y apagado ordenado.
- [x] Validar hosts, puertos, timeout y orígenes con mensajes seguros.
- [x] Reutilizar clientes TCP con tokens de inyección únicos.
- [x] Definir contratos `{ cmd: 'core.health' }` y `{ cmd: 'operations.health' }`.
- [x] Devolver HTTP 200 saludable y HTTP 503 degradado/indisponible.
- [x] Retirar scripts raíz de las tres bases globales.
- [x] Crear scripts reales de inicio, desarrollo, lint, test y build.
- [x] Corregir los cuatro `.env.example` sin añadir secretos.
- [x] Implementar la pantalla técnica de estado y actualización real.
- [x] Ejecutar lint sin errores en los cuatro proyectos.
- [x] Ejecutar 41+ pruebas unitarias y 6+ pruebas E2E correctamente.
- [x] Compilar los cuatro proyectos desde la raíz.
- [x] Verificar manualmente health 200, degradación 503 y frontend real.
- [x] Documentar HTTP, cliente-servidor y microservicios.

---

## Fase 2 — Prisma y persistencia ✅

- [x] Retirar Prisma provisional y las tres bases globales.
- [x] Diseñar schema central `gastroflow_control`.
- [x] Incluir `Restaurant`, `Branch`, `Subscription`, `Plan`, `User`, `Role`, `Permission`, `UserRole`, `UserBranchRole`.
- [x] Diseñar schema operacional único sin `branchId` ni `restaurantId` globales.
- [x] Crear migración inicial de `gastroflow_control`.
- [x] Crear migración operacional con schema completo y 5 vistas SQL.
- [x] Crear seeds de desarrollo para control, Principal y Norte.
- [x] Crear bases `gastroflow_demo_principal` y `gastroflow_demo_norte`.
- [x] Implementar cifrado AES-256-GCM en `DatabaseCredentialsEncryptionService`.
- [x] Implementar resolución TCP segura en `BranchConnectionResolverService`.
- [x] Implementar `BranchConnectionController` con `{ cmd: 'branch.connection.resolve' }`.
- [x] Reparar `branch-connection.controller.ts` y `branch-connection-resolver.service.ts` (corrupción UTF-16).
- [x] Implementar factoría de Prisma Client por sucursal.
- [x] Implementar caché de Prisma Clients con desconexión en apagado.
- [x] Implementar `BranchConnectionResolverClient` en Operations.
- [x] Verificar aislamiento físico entre Principal y Norte (requiere PostgreSQL activo).
- [x] Implementar `vw_low_stock`, `vw_daily_sales`, `vw_invoice_summary`, `vw_top_selling_products`, `vw_inventory_movements_summary`.
- [x] Compilar los cuatro proyectos sin errores TS.
- [x] Ejecutar lint en los cuatro proyectos sin errores.
- [x] Ejecutar 30 pruebas unitarias en Core, 20 en Operations, 15 en Gateway.
- [x] Ejecutar E2E: 1 en Core, 1 en Operations, 4 en Gateway.
- [x] Verificar health general HTTP 200 con todos los servicios.
- [x] Actualizar documentación de Fase 2.
- [x] Corregir `branch-status.ts` (importaba `branch-client` en lugar de `control-client`).

---

## Fase 3 — autenticación ⏳ PENDIENTE

- [ ] Implementar bcrypt y hash de contraseña en login.
- [ ] Implementar DTOs validados para login.
- [ ] Implementar JWT con firma segura y claims mínimos.
- [ ] Implementar Passport y estrategia JWT.
- [ ] Implementar refresh token con rotación y revocación.
- [ ] Implementar Guards de autenticación en Gateway.
- [ ] Implementar `CurrentUser` decorator.
- [ ] Implementar RBAC y autorización por sucursal.

---

## Fase 4 — sucursales ⏳ PENDIENTE

- [ ] Implementar listado y selección autorizada de sucursal.
- [ ] Implementar `POST /api/v1/session/branch`.
- [ ] Implementar `POST /api/v1/branches` sin secretos en el DTO.
- [ ] Implementar estados `PROVISIONING`, `ACTIVE` y `FAILED`.
- [ ] Crear base operacional, aplicar schema, copiar catálogos e inicializar en cero.
- [ ] Probar reintentos, compensación y límites del plan.

---

## Fase 5 — personal ⏳ PENDIENTE

- [ ] Implementar usuarios y perfiles centrales.
- [ ] Implementar `UserBranchRole` y asignaciones.
- [ ] Asignar propietario al crear sucursal.
- [ ] Implementar pantalla y flujo `+ Asignar personal`.

---

## Fase 6 — platillos ⏳ PENDIENTE

- [ ] Implementar categorías y platillos.
- [ ] Implementar `+ Nuevo platillo`.
- [ ] Guardar imágenes externamente y sólo `imageUrl` en PostgreSQL.
- [ ] Permitir ingredientes como texto libre, sin receta obligatoria.

---

## Fase 7 — inventario y compras ⏳ PENDIENTE

- [ ] Implementar tipos, unidades y catálogo de inventario.
- [ ] Implementar proveedores, compras y movimientos transaccionales.
- [ ] Inicializar existencias y costos en cero al copiar plantilla.
- [ ] Implementar consulta periódica de 15 o 30 segundos.

---

## Fase 8 — clientes y mesas ⏳ PENDIENTE

- [ ] Implementar clientes y reservaciones en la base de sucursal.
- [ ] Implementar mesas, estados, búsqueda, filtros y paginación.

---

## Fase 9 — pedidos ⏳ PENDIENTE

- [ ] Implementar pedidos con varios platillos.
- [ ] Conservar snapshots de nombre y precio.
- [ ] Integrar mesas, clientes y personal autorizado.

---

## Fase 10 — facturación ⏳ PENDIENTE

- [ ] Generar factura interna desde el pedido.
- [ ] Leer tasa activa desde `TaxConfiguration`.
- [ ] Proteger secuencia mediante transacción.
- [ ] Implementar historia, filtros, paginación y archivo lógico.
- [ ] Mantener explícitamente fuera del MVP la autorización SRI.

---

## Fase 11 — frontend comercial ⏳ PENDIENTE

- [ ] Implementar login y tarjetas de sucursales.
- [ ] Implementar selección de sucursal y navegación protegida.
- [ ] Implementar pantallas de personal, platillos, inventario, clientes, pedidos y facturas.
- [ ] Implementar estados de carga, vacío y error accesibles.

---

## Fase 12 — reportes, calidad y despliegue ⏳ PENDIENTE

- [ ] Crear colección Postman y evidencia académica.
- [ ] Completar unitarias, E2E, integración, seguridad y rendimiento.
- [ ] Implementar reportes y vistas SQL adicionales justificadas.
- [ ] Configurar HTTPS, secretos, backups, observabilidad y CI/CD.
- [ ] Validar usabilidad con usuarios y documentar resultados.
# Fase 3

- [x] Login multirrestaurante y bcrypt
- [x] Access/Refresh JWT, rotación, revocación y logout
- [x] JwtStrategy, JwtAuthGuard, CurrentUser, Roles y Permissions
- [x] Selección segura de sucursal y respuestas 401/403
- [x] Postman y frontend mínimo de login/selección
- [ ] Registro público, CRUD administrativo y módulos comerciales
