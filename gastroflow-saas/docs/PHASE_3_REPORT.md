# Informe de cierre de la Fase 3

## Objetivo, rama y estado inicial

La correcciÃ³n se realizÃ³ sobre `codex/fase-2-prisma-sucursales`. El Ã¡rbol comenzÃ³ limpio, con autenticaciÃ³n implementada pero sin E2E HTTP completo, protecciÃ³n atÃ³mica contra refresh concurrente, verificaciÃ³n de secretos ni documentaciÃ³n coherente.

## Arquitectura y autenticaciÃ³n

Frontend consume HTTP del Gateway; Gateway valida Access JWT y traduce a TCP sin Prisma; Core firma tokens y usa `gastroflow_control`; Operations no participa en autenticaciÃ³n. El login combina `restaurantSlug`, correo normalizado y bcrypt. Access y Refresh Token usan HS256, secretos separados, issuer, audience y jti. El Refresh Token sÃ³lo viaja en cookie HttpOnly y la base conserva su hash SHA-256.

La cookie configura name, path `/api/v1`, secure, sameSite, domain opcional y maxAge desde `REFRESH_TOKEN_TTL`. Logout revoca de forma idempotente y limpia la cookie con los mismos atributos.

## RotaciÃ³n, revocaciÃ³n y concurrencia

`RefreshTokenService.rotate` ejecuta una transacciÃ³n con `updateMany` condicionado por id, `revokedAt: null` y `expiresAt > now`. SÃ³lo crea el reemplazo cuando la revocaciÃ³n afecta exactamente una fila. Refresh y selecciÃ³n de sucursal usan esta operaciÃ³n. Dos solicitudes simultÃ¡neas producen exactamente un Ã©xito, un Unauthorized, un reemplazo y el original revocado; dos pruebas unitarias lo verifican sin delays.

## Passport, autorizaciÃ³n y sucursales

JwtStrategy valida HS256, issuer, audience y `tokenType=access`. JwtAuthGuard respeta `@Public`; RolesGuard y PermissionsGuard aplican RBAC; `@CurrentUser` expone el payload validado. El listado contiene sÃ³lo asignaciones activas. La selecciÃ³n exige restaurante, sucursal ACTIVE y UserBranch activo. OWNER puede administrar RBAC; WAITER recibe 403. Los E2E cubren 401, 403 y el 429 configurable aplicado sÃ³lo a login.

## Frontend y Postman

El frontend conserva Access Token en memoria, usa cookies con credenciales, intenta una restauraciÃ³n inicial, nunca almacena Refresh Token, permite cambiar sucursal y limpia el estado al cerrar sesiÃ³n. Postman incluye health, OWNER/WAITER, refresh, me, sucursales, selecciones, RBAC y logout; la cookie se administra en el cookie jar.

## Resultados reales

- Prisma control validate: aprobado en la verificaciÃ³n previa y parte de `phase3:verify`.
- Unitarias finales: Gateway 16, Core 38 y Operations 20 aprobadas.
- E2E finales: Gateway 15, Core 1 y Operations 1 aprobadas.
- Auth Core: 8 aprobadas, incluidas dos pruebas concurrentes.
- Lint aprobado en los cuatro proyectos; frontend conserva una advertencia no bloqueante de Fast Refresh.
- Builds de Gateway, Core, Operations y frontend aprobados.
- `phase3:verify`, comprobación de secretos y `git diff --check`: aprobados.
- Integración PostgreSQL: creada e intentada, pero falló con PostgreSQL `28P01` por credenciales locales rechazadas; Docker no está disponible para recrear el entorno.
- Health real y prueba manual: no ejecutados. No se declaran aprobados.

## Limitaciones y riesgos

Quedan pendientes evidencia visual/manual e integraciÃ³n PostgreSQL hasta disponer de Docker/PostgreSQL. ProducciÃ³n requiere HTTPS, `COOKIE_SECURE=true`, secretos aleatorios y observabilidad. Antes de Fase 4 se debe ejecutar `phase3:verify:integration` y el recorrido manual.

Gateway no usa Prisma. Operations no administra auth. No se creÃ³ `POST /api/v1/branches`, aprovisionamiento ni CRUD comercial. No se modificÃ³ el schema operacional. Durante esta ejecuciÃ³n de cierre no se hizo commit ni push.
