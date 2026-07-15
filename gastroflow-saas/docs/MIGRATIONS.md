# Estrategia de migraciones

## Migraciones

Fase 2 definió un schema central (`gastroflow_control`) y un schema operacional canónico aplicado a cada base de sucursal. Las migraciones fueron aplicadas a Principal y Norte. `branches:migrate-all` obtiene sucursales activas mediante Core, continúa ante fallos y presenta un resumen sanitizado. `migrate dev` queda reservado al desarrollo y `migrate deploy` distribuye cambios.

Un orquestador completo (descubrimiento de sucursales, reintentos, telemetría y estrategia de respaldo) pertenece a Fase 4.

## Seguridad operacional

- Respaldar y probar restauración antes de cambios incompatibles.
- Preferir migraciones compatibles hacia adelante.
- Evitar una activación de sucursal con schema incompleto.
- Definir qué ocurre si algunas bases migran y otras fallan.
- No usar `migrate dev` en ambientes compartidos.

## Estado de Fase 2

Existe un historial central en `core-service/prisma/control/migrations` y uno operacional reutilizable en `operations-service/prisma/branch/migrations`. La segunda migración operacional crea `vw_low_stock`, `vw_daily_sales`, `vw_invoice_summary`, `vw_top_selling_products` y `vw_inventory_movements_summary`.

`branches:migrate-all` obtiene sucursales activas mediante Core, continúa ante fallos y presenta un resumen sanitizado. `migrate dev` queda reservado al desarrollo y `migrate deploy` distribuye cambios.
