# Modelo de datos previsto

## Central — `gastroflow_control`

`Restaurant` agrupa sucursales, suscripción y usuarios. `Branch` representa una ubicación y su estado de provisionamiento. `User` puede tener `EmployeeProfile`; `UserBranch` registra pertenencia y `UserBranchRole` asigna roles en una sucursal. `RolePermission` compone permisos. `RefreshToken` soportará sesiones futuras.

Modelos previstos: `Restaurant`, `Branch`, `Plan`, `Subscription`, `User`, `EmployeeProfile`, `Role`, `Permission`, `UserRole`, `RolePermission`, `UserBranch`, `UserBranchRole` y `RefreshToken`.

## Operacional — una base por sucursal

- Clientes y reservaciones: `Customer`, `Reservation`.
- Catálogo y salón: `Category`, `Product`, `RestaurantTable`.
- Venta: `Order`, `OrderItem`, `Payment`.
- Facturación interna: `Invoice`, `InvoiceItem`, `InvoiceSequence`, `TaxConfiguration`.
- Abastecimiento: `InventoryItem`, `InventoryMovement`, `Supplier`, `Purchase`, `PurchaseItem`.
- Integración confiable: `OutboxEvent`.

La base ya identifica a la sucursal; sus tablas no necesitan `branchId`. Los UUID de usuarios centrales pueden guardarse como referencias externas sin foreign key entre bases, con validación previa por servicio.

Los importes y cantidades sensibles a precisión usarán Decimal. Items de pedido y factura guardarán snapshots de nombres y precios para conservar historia.

## Estado

Diseño `DOCUMENTED`. Los schemas actuales del repositorio modelan otra arquitectura y no son la implementación de este documento.
