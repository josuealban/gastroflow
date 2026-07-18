# Informe de Fase 3

## Objetivo y arquitectura

Rama inicial: `codex/fase-2-prisma-sucursales`. Se implementó autenticación TCP en Core, exposición HTTP en Gateway y demostración React. Gateway no usa Prisma; Operations Service no administra autenticación. No se creó `POST /branches` ni CRUD comercial.

## Implementación

- Migración central `add_restaurant_slug_for_auth`: slug global y hash de refresh único.
- Login multirrestaurante, bcrypt, JWT HS256 separados, cookies HttpOnly, rotación transaccional, revocación y logout idempotente.
- Passport, JwtStrategy, CurrentUser y guards globales para autenticación, roles y permisos.
- Selección segura y listado acotado de sucursales; OWNER conserva Norte y los demás usuarios sólo Principal.
- Rate limit de login: 5 solicitudes por 60 segundos.
- Frontend con login, restauración por cookie, selector de sucursal, sesión y logout. Access Token sólo en memoria.
- Colección Postman sin secretos ni tokens reales.

## Validación

Los resultados definitivos de lint, unit, E2E, builds, integración PostgreSQL, health y prueba manual se registran al cierre de la fase. Un estado no ejecutado no se considera exitoso ni evidenciado.

## Límites y riesgos

No existe registro público, CRUD de sucursales, personal ni módulos comerciales. Producción requiere secretos aleatorios, HTTPS, `COOKIE_SECURE=true`, política CSRF acorde al dominio y observabilidad de reutilización. No se hizo commit ni push.
