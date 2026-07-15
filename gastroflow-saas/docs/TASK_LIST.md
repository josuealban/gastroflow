# Lista de tareas

`[x]` significa que existe evidencia en el repositorio o en el informe de la fase. No implica que una implementación heredada y contradictoria sea válida.

## Parte 0 — congelación

- [x] Capturar rama, estado, historial, diff, archivos y versiones.
- [x] Inspeccionar proyectos, HTTP/TCP, health, entornos, Docker, Prisma, scripts, docs y pruebas.
- [x] Congelar arquitectura, estrategia de bases, sucursales, personal, inventario y facturación.
- [x] Crear matriz académica y visión de titulación.
- [x] Inventariar contradicciones sin borrar código masivamente.
- [x] Validar documentación, secretos y artefactos ignorados.

## Fase 1 — estructura base

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
- [x] Desacoplar Prisma provisional del arranque técnico sin modificar sus modelos.
- [x] Retirar scripts raíz de las tres bases globales.
- [x] Crear scripts reales de inicio, desarrollo, lint, test y build.
- [x] Corregir los cuatro `.env.example` sin añadir secretos.
- [x] Implementar la pantalla técnica de estado y actualización real.
- [x] Ejecutar lint sin errores ni advertencias en los cuatro proyectos.
- [x] Ejecutar 41 pruebas unitarias y 6 pruebas E2E correctamente.
- [x] Compilar los cuatro proyectos desde la raíz.
- [x] Verificar manualmente health 200, degradación 503 y frontend real.
- [x] Documentar HTTP, cliente-servidor y microservicios.

## Fase 2 — Prisma

- [ ] Diseñar schema central `gastroflow_control`.
- [ ] Incluir `Restaurant`, `Branch`, acceso y RBAC por sucursal.
- [ ] Diseñar un único schema operacional sin `branchId` global.
- [ ] Rediseñar/eliminar de forma revisada los schemas globales por dominio.
- [ ] Diseñar resolvedor seguro de conexión dinámica en Operations.
- [ ] Definir migración coordinada de todas las bases de sucursal.
- [ ] Crear seeds de desarrollo compatibles con la nueva estrategia.
- [ ] Probar aislamiento físico entre dos sucursales.

## Fase 3 — autenticación

- [ ] Implementar bcrypt, login y DTO validados.
- [ ] Implementar JWT, Passport, `CurrentUser` y Guards.
- [ ] Implementar refresh token con rotación y revocación.
- [ ] Implementar RBAC y autorización por sucursal.

## Fase 4 — sucursales

- [ ] Implementar listado y selección autorizada de sucursal.
- [ ] Implementar `POST /api/v1/session/branch`.
- [ ] Implementar `POST /api/v1/branches` sin secretos en el DTO.
- [ ] Implementar estados `PROVISIONING`, `ACTIVE` y `FAILED`.
- [ ] Crear base, aplicar schema, copiar catálogos e inicializar en cero.
- [ ] Probar reintentos, compensación y límites del plan.

## Fase 5 — personal

- [ ] Implementar usuarios y perfiles centrales.
- [ ] Implementar `UserBranch` y `UserBranchRole`.
- [ ] Asignar propietario al crear sucursal.
- [ ] Implementar pantalla y flujo `+ Asignar personal`.

## Fase 6 — platillos

- [ ] Implementar categorías y platillos.
- [ ] Implementar `+ Nuevo platillo`.
- [ ] Guardar imágenes externamente y sólo `imageUrl` en PostgreSQL.
- [ ] Permitir ingredientes como texto libre, sin receta obligatoria.

## Fase 7 — inventario y compras

- [ ] Implementar tipos, unidades y catálogo de inventario.
- [ ] Implementar proveedores, compras y movimientos transaccionales.
- [ ] Inicializar existencias y costos en cero al copiar plantilla.
- [ ] Implementar consulta periódica de 15 o 30 segundos.

## Fase 8 — clientes y mesas

- [ ] Implementar clientes y reservaciones en la base de sucursal.
- [ ] Implementar mesas, estados, búsqueda, filtros y paginación.

## Fase 9 — pedidos

- [ ] Implementar pedidos con varios platillos.
- [ ] Conservar snapshots de nombre y precio.
- [ ] Integrar mesas, clientes y personal autorizado.

## Fase 10 — facturación

- [ ] Generar factura interna desde el pedido.
- [ ] Leer tasa activa desde `TaxConfiguration`.
- [ ] Proteger secuencia mediante transacción.
- [ ] Implementar historia, filtros, paginación y archivo lógico.
- [ ] Mantener explícitamente fuera del MVP la autorización SRI.

## Fase 11 — frontend

- [ ] Implementar login y tarjetas de sucursales.
- [ ] Implementar selección de sucursal y navegación protegida.
- [ ] Implementar pantallas de personal, platillos, inventario, clientes, pedidos y facturas.
- [ ] Implementar estados de carga, vacío y error accesibles.

## Fase 12 — reportes, calidad y despliegue

- [ ] Crear colección Postman y evidencia académica.
- [ ] Completar unitarias, E2E, integración, seguridad y rendimiento.
- [ ] Implementar reportes y vistas SQL justificadas.
- [ ] Configurar HTTPS, secretos, backups, observabilidad y CI/CD.
- [ ] Validar usabilidad con usuarios y documentar resultados.
