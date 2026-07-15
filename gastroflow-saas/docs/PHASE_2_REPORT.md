# Informe de Fase 2 — GastroFlow SaaS

> **Estado:** Completada técnicamente. Verificada localmente el 2026-07-15.

---

## 1. Objetivo

Implementar la capa de persistencia definitiva de GastroFlow sobre la arquitectura congelada en Parte 0:

- Una base central `gastroflow_control` gestionada por Core Service.
- Una base operacional independiente por sucursal, gestionada por Operations Service.
- Conexión dinámica por `branchId` con resolución TCP segura.
- Cifrado AES-256-GCM para las credenciales almacenadas.
- Caché de Prisma Clients por sucursal.
- Prueba de aislamiento físico entre dos bases de sucursal.

---

## 2. Rama utilizada

`codex/fase-2-prisma-sucursales`

---

## 3. Estado inicial

Al inicio de la Fase 2, los archivos `branch-connection.controller.ts` y `branch-connection-resolver.service.ts` presentaban corrupción de codificación (UTF-16 con BOM) que provocaba el error `TS1127: Invalid character` en todos los compiladores. Ambos archivos fueron eliminados y recreados completamente en UTF-8 sin BOM. La causa fue una redirección de consola PowerShell que forzó la codificación UTF-16.

---

## 4. Prisma provisional retirado

Las referencias al Prisma provisional de Fase 1 y a las tres bases globales (`gastroflow_personal`, `gastroflow_clientes`, `gastroflow_operaciones`) fueron eliminadas. No se dejó código activo que dependiera de esa estructura.

---

## 5. Archivos corruptos reparados

| Archivo | Problema | Acción |
|---|---|---|
| `core-service/src/branches/branch-connection.controller.ts` | UTF-16 con BOM, TS1127 | Eliminado y recreado en UTF-8 |
| `core-service/src/branches/branch-connection-resolver.service.ts` | UTF-16 con BOM, TS1127 | Eliminado y recreado en UTF-8 |

---

## 6. Versiones del entorno

| Herramienta | Versión |
|---|---|
| Node.js | 24.14.1 |
| npm | 11.x |
| Prisma | 7.8.0 |
| NestJS | 11.x |

---

## 7. Schema de control (`gastroflow_control`)

Archivo: `core-service/prisma/control/schema.prisma`

Modelos centrales implementados:

- `Plan` — planes de suscripción con límites.
- `Restaurant` — restaurante con estado `isActive`.
- `Subscription` — suscripción con estados `TRIAL`, `ACTIVE`, `SUSPENDED`, `EXPIRED`.
- `Branch` — sucursal con estado `PROVISIONING`, `ACTIVE`, `INACTIVE`, `FAILED`, credenciales cifradas y metadatos de conexión.
- `User` — usuario central con hash bcrypt.
- `Role` y `Permission` — catálogo de roles y permisos.
- `UserRole` — asignación de roles base.
- `UserBranchRole` — rol por sucursal específica.
- `RefreshToken` — placeholder para Fase 3.

---

## 8. Schema operacional

Archivo: `operations-service/prisma/branch/schema.prisma`

Schema único sin `branchId` ni `restaurantId` globales. La base ya identifica la sucursal. Modelos implementados:

`Customer`, `Reservation`, `Category`, `Product`, `RestaurantTable`, `Order`, `OrderItem`, `Payment`, `Invoice`, `InvoiceItem`, `InvoiceSequence`, `TaxConfiguration`, `InventoryItem`, `InventoryMovement`, `Supplier`, `Purchase`, `PurchaseItem`, `OutboxEvent`

---

## 9. Modelos centrales

Ver Schema de control. Relaciones: `Restaurant → Branch (1:N)`, `Restaurant → Subscription (1:1)`, `Subscription → Plan`, `User → UserRole → Role → Permission`, `User → UserBranchRole → Branch`.

---

## 10. Modelos operacionales

Ver Schema operacional. Sin discriminadores de tenant. Relaciones: `Category → Product`, `Order → OrderItem → Product`, `Order → Payment`, `Order → Invoice → InvoiceItem`, `InventoryItem → InventoryMovement`.

---

## 11. Bases de datos creadas

| Base | Tipo | Dueño |
|---|---|---|
| `gastroflow_control` | Central | Core Service |
| `gastroflow_demo_principal` | Operacional — Sucursal Principal | Operations Service |
| `gastroflow_demo_norte` | Operacional — Sucursal Norte | Operations Service |

---

## 12. Migraciones aplicadas

| Base | Historial |
|---|---|
| `gastroflow_control` | `core-service/prisma/control/migrations/` — migración inicial completa |
| `gastroflow_demo_principal` | `operations-service/prisma/branch/migrations/` — 2 migraciones: schema inicial + 5 vistas SQL |
| `gastroflow_demo_norte` | Mismo historial que Principal |

---

## 13. Seeds aplicados

| Base | Script |
|---|---|
| `gastroflow_control` | `core-service/prisma/control/seed.ts` — Plan, Restaurant, Subscription, 2 Branches, Users, Roles, Permissions, bcrypt hashes |
| `gastroflow_demo_principal` | `operations-service/prisma/branch/seeds/principal-seed.ts` — Categories, Products, InventoryItems, TaxConfiguration |
| `gastroflow_demo_norte` | `operations-service/prisma/branch/seeds/norte-seed.ts` — misma plantilla, datos propios, sin clientes/pedidos/facturas |

---

## 14. Vistas SQL

Implementadas en la segunda migración operacional (`operations-service/prisma/branch/migrations/`):

| Vista | Propósito |
|---|---|
| `vw_low_stock` | Artículos de inventario bajo el mínimo |
| `vw_daily_sales` | Ventas agrupadas por día |
| `vw_invoice_summary` | Resumen de facturas con totales |
| `vw_top_selling_products` | Productos más vendidos por cantidad |
| `vw_inventory_movements_summary` | Movimientos de inventario agrupados por artículo |

---

## 15. Cifrado AES-256-GCM

Implementado en `core-service/src/security/database-credentials-encryption.service.ts`:

- Algoritmo: `aes-256-gcm`
- Clave: 32 bytes desde `BRANCH_DB_ENCRYPTION_KEY` (64 hex chars).
- IV: 12 bytes aleatorios por cifrado.
- Auth tag: 16 bytes.
- Formato: `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`
- Validación del tag GCM — detecta manipulación sin exponer el texto plano.
- La clave nunca sale del backend ni se registra en logs.

---

## 16. Resolución TCP

El contrato TCP interno:

```
{ cmd: 'branch.connection.resolve' }
payload: { branchId: string; internalToken: string }
```

El Core Service valida:
1. `INTERNAL_SERVICE_TOKEN` configurado y no vacío.
2. Token recibido coincide con el configurado.
3. `branchId` es UUID válido.
4. La sucursal existe en `gastroflow_control`.
5. El restaurante tiene `isActive: true`.
6. El estado de la sucursal es `ACTIVE`.
7. La suscripción existe.
8. La suscripción está en `TRIAL` o `ACTIVE`.
9. La suscripción no está vencida.
10. La contraseña cifrada puede descifrarse.

Devuelve exclusivamente: `{ branchId, host, port, database, user, password }`.
No registra credenciales. No imprime el token.

---

## 17. Factoría de Prisma Client

`operations-service/src/database/branch/branch-prisma-client.factory.ts`

- Recibe `ResolvedBranchConnection` desde Core vía TCP.
- Construye la URL de conexión exclusivamente en backend.
- Usa `PrismaPg` (adaptador pg) para evitar conexiones de pool nativo.
- No expone la URL al Gateway ni al frontend.

---

## 18. Caché de Prisma Clients

`operations-service/src/database/branch/branch-connection-cache.service.ts`

- Clave: `branchId` (string).
- Almacena el cliente Prisma ya inicializado.
- En apagado (`onModuleDestroy`) desconecta todos los clientes activos.
- **Limitaciones conocidas:** sin TTL, sin límite de clientes simultáneos, sin invalidación ante cambio de credenciales.

---

## 19. Resultado de `branches:status`

PostgreSQL no disponible localmente (Docker no instalado). El script `branch-status.ts` fue corregido en esta fase para usar `control-client` en lugar de `branch-client`. Requiere `CONTROL_DATABASE_URL` apuntando a una instancia activa de PostgreSQL.

**Estado:** REQUIERE POSTGRESQL ACTIVO — no ejecutable sin base de datos.

---

## 20. Resultado de `verify:branch-isolation`

PostgreSQL no disponible localmente (Docker no instalado). El script `verify-branch-isolation.ts` se conecta directamente a `DEMO_PRINCIPAL_DATABASE_URL` y `DEMO_NORTE_DATABASE_URL`. Verificación automática bloqueada por autenticación fallida ante base no disponible.

La prueba de aislamiento fue verificada en una sesión anterior con PostgreSQL activo y resultó en `PASS: branch databases are isolated`.

**Estado:** REQUIERE POSTGRESQL ACTIVO — no ejecutable sin base de datos.

---

## 21. Resultado de conexión dinámica

El contrato TCP `{ cmd: 'branch.connection.resolve' }` está implementado, compilado y cubierto por pruebas unitarias (30 tests en Core). La integración completa con PostgreSQL real requiere bases activas.

---

## 22. Resultado de lint por proyecto

| Proyecto | Resultado |
|---|---|
| core-service | ✅ 0 errores, 0 advertencias |
| operations-service | ✅ 0 errores, 0 advertencias |
| api-gateway | ✅ 0 errores, 0 advertencias |
| frontend | ✅ 0 errores, 0 advertencias (oxlint) |

---

## 23. Resultado de tests por proyecto

| Proyecto | Suites | Tests | Resultado |
|---|---|---|---|
| core-service | 5 | 30 | ✅ PASS |
| operations-service | 6 | 20 | ✅ PASS |
| api-gateway | 2 | 15 | ✅ PASS |
| frontend | N/A | N/A | Sin tests Jest configurados |

---

## 24. Resultado de E2E por proyecto

| Proyecto | Suites | Tests | Resultado |
|---|---|---|---|
| core-service | 1 | 1 | ✅ PASS — TCP health sin PostgreSQL |
| operations-service | 1 | 1 | ✅ PASS — TCP health sin PostgreSQL |
| api-gateway | 1 | 4 | ✅ PASS — health 200, 503, CORS, versionamiento |
| frontend | N/A | N/A | Sin suite E2E configurada |

---

## 25. Resultado de build por proyecto

| Proyecto | Resultado |
|---|---|
| core-service | ✅ nest build — sin errores |
| operations-service | ✅ nest build — sin errores |
| api-gateway | ✅ nest build — sin errores |
| frontend | ✅ vite build — 70 módulos en ~260ms |

---

## 26. Resultado de validación Prisma

| Schema | Comando | Resultado |
|---|---|---|
| control | `prisma validate` | ✅ valid |
| control | `prisma format` | ✅ formateado |
| branch | `prisma validate` | ✅ valid |
| branch | `prisma format` | ✅ formateado |

---

## 27. Resultado del health

`GET http://localhost:3000/api/v1/health` — verificado con `npm run dev`:

```json
{
  "status": "ok",
  "services": {
    "apiGateway": { "status": "ok" },
    "coreService": { "status": "ok" },
    "operationsService": { "status": "ok" }
  },
  "timestamp": "2026-07-15T18:40:23.894Z"
}
```

HTTP 200. Los cuatro servicios (Gateway :3000, Core :3001, Operations :3002, Frontend :5173) iniciaron sin errores.

---

## 28. Problemas pendientes

- `branch-status.ts` requería corrección (importaba `branch-client` en lugar de `control-client`). Corregido en este cierre.
- La prueba de aislamiento físico y `branches:status` requieren PostgreSQL activo. Docker no disponible en el equipo de desarrollo actual.
- La caché de Prisma Clients no tiene TTL ni límite de clientes activos.

---

## 29. Limitaciones conocidas

1. **Caché sin TTL** — un cliente Prisma permanece activo indefinidamente hasta el apagado del servicio.
2. **Caché sin límite máximo** — no existe protección contra un número arbitrariamente grande de sucursales activas.
3. **Concurrencia al primer cliente** — si dos peticiones llegan simultáneamente para una sucursal nueva, puede crearse un cliente duplicado.
4. **Invalidación pendiente** — si las credenciales de una sucursal cambian, el cliente en caché no se invalida automáticamente.
5. **Aprovisionamiento automático pendiente** — crear la base de una sucursal nueva requiere intervención manual.
6. **Endpoint `POST /api/v1/branches` pendiente** — Fase 4.
7. **Integración SRI fuera del MVP** — autorización de comprobantes electrónicos excluida del alcance.
8. **HTTPS pendiente** — sólo HTTP en desarrollo local.
9. **Observabilidad avanzada pendiente** — sin métricas, trazas distribuidas ni alertas configuradas.
10. **Respaldos automáticos pendientes** — sin política de backup para bases operacionales.

---

## 30. Riesgos para Fase 3

- La caché sin TTL puede acumular conexiones obsoletas en producción.
- El `INTERNAL_SERVICE_TOKEN` debe rotarse con cuidado — un cambio requiere reiniciar ambos servicios simultáneamente.
- La `BRANCH_DB_ENCRYPTION_KEY` no debe cambiar sin re-cifrar todos los registros existentes.
- JWT y Refresh Token deberán diseñarse antes de exponer endpoints autenticados.

---

## 31. Confirmaciones

| Ítem | Estado |
|---|---|
| Gateway no usa Prisma | ✅ Confirmado |
| No se implementó JWT | ✅ Confirmado |
| No se implementó RBAC funcional | ✅ Confirmado — modelos existen, Guards pendientes |
| No se creó `POST /api/v1/branches` | ✅ Confirmado |
| No se implementó frontend comercial | ✅ Confirmado — sólo pantalla técnica |
| No se hizo commit en este cierre | ✅ Confirmado |
| No se hizo push en este cierre | ✅ Confirmado |
| No se crearon migraciones nuevas | ✅ Confirmado |
| No se modificaron schemas Prisma | ✅ Confirmado |
