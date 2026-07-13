# Database Per Branch Architecture

## Diferencia entre base compartida y base por sucursal
En vez de utilizar un modelo de tenant (base de datos única para todos los clientes añadiendo un `branchId` a cada tabla), GastroFlow emplea un enfoque multi-tenant físico: una base de datos PostgreSQL separada para cada sucursal (ej. `gastroflow_demo_centro` y `gastroflow_demo_norte`).

## Por qué usamos bases separadas
- **Aislamiento de Datos**: Garantiza que un error o ataque en una sucursal no comprometa datos de otras.
- **Rendimiento predecible**: Una sucursal muy ocupada no saturará la base de datos de las demás.
- **Manejo legal de la información**: Permite a una sucursal realizar respaldos físicos directos sin filtrar información a otros.

## Selección de Conexión
La selección se realiza en `core-service` mediante el `BranchDatabaseService`. Al recibir un token que incluye el `branchId` o `branchCode`, este servicio consulta la base de Control (`gastroflow_control`) para recuperar el nombre, host, usuario y clave cifrada de la BD de esa sucursal. 

## Seguridad de Credenciales
Bajo ninguna circunstancia se envía el `databaseUrl` o credenciales crudas al Frontend, ni siquiera encriptadas. Todo el enrutamiento es server-side.

## Caché de Clientes
Crear una instancia de Prisma (`PrismaClient`) es costoso. Se utiliza `BranchConnectionCacheService` para guardar en memoria instancias activas de los clientes Prisma de cada sucursal, evitando sobrecargar PostgreSQL con nuevas conexiones.

## Proceso de Nueva Sucursal
1. Validar la compañía y límite de plan.
2. Crear la base de datos PostgreSQL.
3. Aplicar migraciones (`prisma migrate deploy`).
4. Registrar los datos en la base de Control (encriptando la contraseña).
5. Ejecutar los seeds iniciales.

## Ventajas y Desventajas
- **Ventajas**: Aislamiento total, escalabilidad sencilla, copias de seguridad dedicadas.
- **Desventajas**: Mayor consumo de memoria para múltiples PrismaClients, migraciones más complejas (aplicables a cientos de BD en un futuro).
