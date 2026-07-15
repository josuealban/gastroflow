# Fases del proyecto

## Parte 0 — congelación ✅

Inspeccionar, resolver contradicciones en documentación, congelar decisiones y construir la hoja de ruta. No modifica lógica ni persistencia.

## Fase 1 — estructura base ✅

Estado: completada y verificada el 2026-07-15.

Se estabilizaron los cuatro proyectos, transportes HTTP/TCP, health checks, configuración validada, timeout, CORS, scripts, pantalla técnica y contratos mínimos. Lint, unitarias, E2E, builds y comunicación manual aprobaron sin PostgreSQL. Consulte `PHASE_1_REPORT.md`.

## Fase 2 — Prisma y persistencia por sucursal ✅

Estado: completada técnicamente el 2026-07-15.

Implementados: `gastroflow_control` con schema central completo, schema operacional único sin discriminadores de tenant, bases `gastroflow_demo_principal` y `gastroflow_demo_norte`, migraciones coordinadas, seeds de desarrollo, 5 vistas SQL, cifrado AES-256-GCM, resolución TCP segura de credenciales, factoría de Prisma Clients dinámicos y caché por `branchId`. Prueba de aislamiento físico verificada con PostgreSQL real.

Los archivos `branch-connection.controller.ts` y `branch-connection-resolver.service.ts` fueron reparados de corrupción UTF-16. Todos los builds, lint y tests pasan. Consulte `PHASE_2_REPORT.md`.

Limitaciones activas: caché sin TTL, sin límite de clientes, sin invalidación automática ante cambio de credenciales.

## Fase 3 — autenticación ⏳

Implementar bcrypt, JWT, Passport, refresh tokens con rotación y revocación, Guards, `CurrentUser` y RBAC con roles por sucursal. No iniciada.

## Fase 4 — sucursales ⏳

Implementar alta de sucursal, límites de plan, estados `PROVISIONING`/`ACTIVE`/`FAILED`, creación automatizada de base operacional, copia selectiva de plantilla, asignación de propietario y selección de sucursal activa.

## Fase 5 — personal ⏳

Implementar perfiles centrales, asignaciones `UserBranchRole`, roles por sucursal y experiencia de administración de personal.

## Fase 6 — platillos ⏳

Implementar categorías, tarjetas de platillos, alta/edición, descripción libre e imágenes por URL externa.

## Fase 7 — inventario y compras ⏳

Implementar artículos, proveedores, compras y movimientos transaccionales. La plantilla copia catálogo, pero inicia cantidades y costos en cero.

## Fase 8 — clientes y mesas ⏳

Implementar clientes, reservaciones y mesas dentro de la base operacional seleccionada.

## Fase 9 — pedidos ⏳

Implementar ciclo del pedido, múltiples platillos, estados, pagos y snapshots históricos.

## Fase 10 — facturación ⏳

Implementar comprobante interno desde pedido, tasa configurable, secuencia transaccional, historia, filtros y archivo lógico. No incluye autorización SRI.

## Fase 11 — frontend comercial ⏳

Completar autenticación, selección por tarjetas, navegación protegida y módulos funcionales consumiendo sólo el Gateway.

## Fase 12 — reportes, calidad y despliegue ⏳

Completar Postman, reportes adicionales, pruebas de seguridad/rendimiento, observabilidad, backups, HTTPS, CI/CD, despliegue y evidencia académica.

---

Cada fase exige criterios de aceptación verificables y evidencia registrada antes de marcar tareas como completadas.
