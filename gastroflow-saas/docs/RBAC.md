# RBAC por sucursal

La identidad y el personal se almacenan en `gastroflow_control`. Un usuario puede pertenecer a varias sucursales mediante `UserBranch` y tener roles diferentes en cada una mediante `UserBranchRole`.

## Flujo futuro

1. bcrypt verifica credenciales.
2. Core carga usuario, restaurante y membresías activas.
3. El usuario selecciona una sucursal.
4. Core verifica la pertenencia y roles de esa sucursal.
5. Un JWT puede contener `userId`, `restaurantId`, `branchId`, roles y permisos.
6. Guards validan autenticación, sucursal y permiso antes de ejecutar el caso de uso.

El `branchId` del token es contexto autorizado, no un filtro que el frontend pueda elegir libremente. Operations recibe sólo una sucursal ya validada.

## Estado

`DOCUMENTED`. Login, JWT, Passport, refresh tokens, Guards y RBAC funcional no están implementados bajo esta arquitectura. El modelo actual por `restaurantId` se rediseñará en Fases 2 y 3.
# Aplicación en Fase 3

Los guards calculan autoridad desde `UserRole`, `UserBranchRole` y `RolePermission`. `settings.manage` protege los listados administrativos: OWNER está autorizado y WAITER recibe 403.
