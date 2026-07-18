# Autenticación y autorización

GastroFlow autentica identidad en Core Service y autoriza cada petición HTTP en API Gateway. El login combina `restaurantSlug`, correo normalizado y contraseña para impedir ambigüedad entre restaurantes.

Las contraseñas se verifican con bcrypt (12 rondas configurables). Core emite un Access Token HS256 de 15 minutos y un Refresh Token HS256 de 7 días, con secretos distintos, `issuer` y `audience` obligatorios. El access token viaja en `Authorization: Bearer`; el refresh sólo en cookie HttpOnly con alcance `/api/v1/auth`. Nunca se almacena el refresh completo: la base conserva SHA-256 y cada uso lo revoca y reemplaza dentro de una transacción.

Passport y `JwtStrategy` validan access tokens. `JwtAuthGuard`, `RolesGuard` y `PermissionsGuard` aplican deny-by-default; `@Public()` excluye login, refresh, logout y health. `@CurrentUser()` toma la identidad validada, no datos de autoridad enviados por el cliente. Un 401 significa autenticación ausente o inválida; un 403 significa identidad válida sin autorización.

Los roles globales salen de `UserRole`; los roles por sucursal de `UserBranchRole`; los permisos se resuelven mediante `RolePermission` y se deduplican. La selección exige restaurante, suscripción, sucursal ACTIVE y `UserBranch.isActive`. Nunca acepta roles o permisos del frontend.

La cookie HttpOnly reduce el robo por JavaScript/XSS, aunque XSS todavía permite acciones en nombre del usuario. `SameSite=lax`, CORS restringido y métodos no idempotentes reducen CSRF; producción debe usar HTTPS y `Secure=true`. El Refresh Token no se guarda en localStorage porque cualquier script inyectado podría extraerlo y mantener una sesión duradera. El Access Token se conserva sólo en memoria.
