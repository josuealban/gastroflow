# Estrategia de bases de datos

## Decisión

GastroFlow utilizará una base central y una base operacional por sucursal.

| Tipo | Nombre | Dueño | Contenido |
| --- | --- | --- | --- |
| Central | `gastroflow_control` | Core Service | Restaurantes, sucursales, planes, suscripciones, usuarios, personal y acceso |
| Operacional | nombre generado por sucursal | Operations Service | Clientes, catálogo, mesas, inventario, compras, pedidos, pagos, facturas e historial |

Ejemplos de nombres operacionales: `gastroflow_restaurante_demo_principal` y `gastroflow_restaurante_demo_norte`. El nombre real debe sanearse, evitar colisiones y mantenerse interno.

## Schema operacional único

Todas las bases de sucursal aplicarán exactamente el mismo historial de migraciones. Las tablas no requieren `branchId`: la base ya identifica la sucursal. Tampoco se crearán bases independientes por módulo.

Modelos previstos: `Customer`, `Reservation`, `Category`, `Product`, `RestaurantTable`, `Order`, `OrderItem`, `Payment`, `Invoice`, `InvoiceItem`, `InvoiceSequence`, `TaxConfiguration`, `InventoryItem`, `InventoryMovement`, `Supplier`, `Purchase`, `PurchaseItem` y `OutboxEvent`.

## Conexión dinámica

Operations necesitará un resolvedor con estas propiedades:

1. recibe un `branchId` ya autorizado;
2. obtiene de Core o de un almacén seguro la referencia de conexión;
3. valida estado y versión de schema;
4. reutiliza conexiones con límites y expiración;
5. cierra conexiones en apagado y ante invalidación;
6. nunca escribe secretos en logs o respuestas.

La caché y el cifrado se diseñarán después de decidir el proveedor de secretos y el modelo de amenazas.

## Migraciones

Fase 2 deberá definir un schema central y un schema operacional canónico. Un orquestador aplicará migraciones a nuevas sucursales y actualizará las existentes con control de versión, reintentos, telemetría y estrategia de respaldo. No se ejecutó ninguna migración durante Parte 0.

## Datos de plantilla

La creación de una base no restaura un respaldo completo. Aplica schema limpio, copia catálogos permitidos y crea configuración inicial. Esta separación evita duplicar PII, comprobantes, movimientos y eventos.

## Legado detectado

## Estado implementado en Fase 2

El legado global fue retirado. `gastroflow_control` contiene identidad, suscripción, personal y metadatos cifrados. `gastroflow_demo_principal` y `gastroflow_demo_norte` recibieron el mismo historial operacional. Operations obtiene credenciales mediante el contrato TCP interno de Core; el Gateway nunca conoce URLs de PostgreSQL.

Norte representa una copia de plantilla: comparte estructura y datos maestros con IDs propios, pero inicia sin clientes, pedidos, pagos, facturas, compras ni movimientos.
