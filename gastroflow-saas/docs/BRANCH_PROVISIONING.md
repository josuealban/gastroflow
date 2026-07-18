# Aprovisionamiento de sucursales

`POST /api/v1/branches` valida RBAC, plan e idempotencia dentro de una transacción Serializable, crea Branch `PROVISIONING` y un trabajo persistente, y responde 202. La misma clave y cuerpo devuelve el mismo trabajo; un cuerpo diferente devuelve 409.

Core genera nombres PostgreSQL limitados a 63 caracteres y una contraseña aleatoria cifrada con AES-256-GCM. Un procesador reclama jobs PENDING mediante actualización condicional, recupera jobs abandonados y ordena por TCP a Operations crear rol/base, ejecutar `prisma migrate deploy` y verificar datos. No se usa `migrate dev` ni una cola en memoria como autoridad.

Con plantilla se copian categorías, productos con IDs nuevos e `isAvailable=false`, e inventario maestro con stock/costos/pérdidas en cero. No se copian clientes, mesas, pedidos, pagos, facturas, compras ni movimientos. Sin plantilla se inicializan configuración tributaria configurable y secuencia en cero.

Los estados son PENDING/PROCESSING/COMPLETED/FAILED para el job y PROVISIONING/ACTIVE/FAILED para Branch. Los reintentos reutilizan Branch, credenciales y base. Operations valida token, host, puerto e identificadores SQL, y nunca expone credenciales. Para producción se recomienda una cola persistente especializada, HTTPS, observabilidad y compensación operativa.
