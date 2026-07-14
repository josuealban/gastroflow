# Base de datos por sucursal

Una base compartida separaría tenants con `branchId` en cada tabla. GastroFlow usa una base PostgreSQL por sucursal: `gastroflow_demo_centro` y `gastroflow_demo_norte` tienen la misma estructura, pero almacenamiento y conexiones independientes.

## Selección segura

1. Core recibe internamente un `branchId` o `branchCode`.
2. Consulta la sucursal en `gastroflow_control`.
3. Valida empresa, sucursal, suscripción y vencimiento.
4. Descifra la contraseña con AES-256-GCM.
5. Construye la URL exclusivamente en backend.
6. Reutiliza el cliente guardado en caché por `branchId`.

Controllers y frontend nunca proporcionan `databaseUrl`. La caché elimina conexiones fallidas y desconecta todos los clientes al apagar Core.

## Alta de una sucursal

`npm run branches:create -- --companyId <uuid> --branchName <nombre> --branchCode <CODIGO> --databaseName <nombre_seguro>` valida identificadores y límite del plan, crea la base, despliega migraciones, ejecuta el seed inicial y sólo entonces registra la sucursal activa. Si falla, intenta eliminar la base parcial.

## Ventajas y costes

Ventajas: aislamiento fuerte, restauración individual, menor riesgo de consultas entre sucursales y escalamiento independiente. Desventajas: más conexiones, migraciones coordinadas, observabilidad distribuida y mayor trabajo operativo. `branches:migrate-all` y `branches:status` reducen ese coste sin revelar credenciales.
