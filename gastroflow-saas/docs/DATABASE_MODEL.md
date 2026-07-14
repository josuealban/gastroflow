# Modelo de datos

GastroFlow separa la administración global, la auditoría y la operación de cada sucursal en bases PostgreSQL diferentes.

## Base de control

- `Company` agrupa sucursales y tiene una suscripción.
- `Branch` registra código, nombre de base y credenciales cifradas. No contiene datos operativos.
- `Plan` define límites y precio `Decimal`; `Subscription` relaciona una empresa con un plan.
- `PlatformAdmin` reserva administradores globales con `passwordHash`.
- `GlobalOutboxEvent` prepara publicación confiable de eventos futuros.

Relaciones: Company 1:N Branch, Company 1:1 Subscription y Plan 1:N Subscription. Las relaciones críticas usan `Restrict`, no cascadas destructivas. `SubscriptionStatus` y `OutboxStatus` modelan sus ciclos de vida.

## Base operacional por sucursal

- Seguridad futura: `User`, `Role`, `Permission`, `UserRole`, `RolePermission` y `RefreshToken`.
- Catálogo: `Category`, `Product`, `Recipe` y `RecipeItem`.
- Sala y clientes: `RestaurantTable`, `Customer` y `Reservation`.
- Venta futura: `Order`, `OrderItem` y `Payment`.
- Abastecimiento: `InventoryItem`, `Supplier`, `Purchase`, `PurchaseItem` e `InventoryMovement`.
- Integración futura: `OutboxEvent`.

User y Role, y Role y Permission, son relaciones N:M explícitas. Recipe es única por Product y relaciona ingredientes mediante RecipeItem. Los productos con historial, ingredientes con movimientos y entidades financieras usan relaciones restrictivas.

Los estados de mesas, reservas, pedidos, pagos, compras, inventario y outbox se expresan mediante enums. Importes y cantidades usan `Decimal`; fechas de consulta frecuente, estados y claves foráneas tienen índices.

No existe `branchId` en las tablas operacionales: Centro y Norte son bases físicas distintas con el mismo schema de plantilla.

## Base de auditoría

- `AuditLog` registra acciones con severidad y `externalEventId` único.
- `SecurityEvent` reserva eventos de autenticación y seguridad.
- `IntegrationError` registra fallos de integración y su resolución.

Los identificadores externos permiten idempotencia. `AuditSeverity` diferencia INFO, WARNING, ERROR y CRITICAL. Audit no tiene relaciones directas con las otras bases para conservar independencia.

## Normalización

El control no duplica datos operativos; cada sucursal normaliza sus relaciones internas; Audit conserva referencias externas sin claves foráneas distribuidas. Esta decisión evita un acoplamiento transaccional imposible entre bases y deja la propagación futura a los outbox.
