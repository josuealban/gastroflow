# Estrategia de migraciones

## Objetivo

Mantener dos historiales conceptuales:

- schema central para `gastroflow_control`;
- schema operacional canónico, desplegado en cada base de sucursal.

La creación de una sucursal debe aplicar todas las migraciones operacionales antes de copiar catálogos. Las actualizaciones deberán descubrir sucursales activas, verificar versión, aplicar cambios con reintentos controlados y registrar resultados sin secretos.

## Seguridad operacional

- Respaldar y probar restauración antes de cambios incompatibles.
- Preferir migraciones compatibles hacia adelante.
- Evitar una activación de sucursal con schema incompleto.
- Definir qué ocurre si algunas bases migran y otras fallan.
- No usar `migrate dev` en ambientes compartidos.

## Estado de Fase 2

Existe un historial central en `core-service/prisma/control/migrations` y uno operacional reutilizable en `operations-service/prisma/branch/migrations`. La segunda migración operacional crea `vw_low_stock`, `vw_daily_sales`, `vw_invoice_summary`, `vw_top_selling_products` y `vw_inventory_movements_summary`.

`branches:migrate-all` obtiene sucursales activas mediante Core, continúa ante fallos y presenta un resumen sanitizado. `migrate dev` queda reservado al desarrollo y `migrate deploy` distribuye cambios.
