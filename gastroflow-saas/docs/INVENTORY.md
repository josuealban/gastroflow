# Inventario

## Estado de Fase 2

El schema operacional implementa `InventoryItem`, `InventoryMovement`, sus enums, índices y `vw_low_stock`. Principal contiene datos académicos; Norte copia el catálogo con stock, costo, dañados y perdidos en cero. Todavía no existen CRUD, descuento automático ni transacción de recepción.

## Catálogo

Cada base operacional contiene su propio inventario. Los tipos son:

- `INGREDIENT`: carne, arroz, queso o aceite.
- `CONSUMABLE`: servilletas, envases o vasos desechables.
- `UTENSIL`: platos, cucharas, tenedores u ollas.

Una plantilla puede aportar nombre, descripción, tipo, unidad y stock mínimo. En una sucursal nueva, `currentStock`, `costPerUnit`, `damagedQuantity` y `lostQuantity` empiezan en cero.

## Movimientos futuros

`PURCHASE_ENTRY`, `MANUAL_ENTRY`, `MANUAL_EXIT`, `ADJUSTMENT`, `WASTE`, `DAMAGED`, `LOST` y `RETURN` registrarán el motivo, cantidad, existencias anterior/nueva, actor, referencia y fecha. Las mutaciones de stock deberán ejecutarse dentro de transacciones.

## Platillos e inventario

`Product` tendrá nombre, descripción, precio Decimal, `imageUrl`, categoría y disponibilidad. La descripción puede contener ingredientes como texto libre. No habrá receta estructurada obligatoria ni descuento automático de inventario al crear un platillo.

## Actualización del frontend

El MVP podrá consultar inventario cada 15 o 30 segundos. WebSockets quedan fuera del alcance inicial.

## Estado

`DOCUMENTED`. Los modelos presentes en el árbol usan una base global y `restaurantId`; no constituyen la implementación definitiva por sucursal.
