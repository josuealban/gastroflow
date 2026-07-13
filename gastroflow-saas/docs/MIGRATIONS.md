# Migraciones Prisma

La base de datos se mantiene mediante scripts que envuelven los comandos nativos de Prisma.

## Migración de Control
Ubicación: `core-service/prisma/control/schema.prisma`
Comandos:
- `npm run prisma:control:migrate` (Aplica y crea migraciones en desarrollo).
- `npm run prisma:control:deploy` (Despliega a producción).

## Migración de Auditoría
Ubicación: `audit-service/prisma/schema.prisma`
Comandos:
- `npm run prisma:migrate`
- `npm run prisma:deploy`

## Migraciones de Sucursal (Branch Template)
Ubicación de la plantilla: `core-service/prisma/branch/schema.prisma`
Dado que existen N bases de datos de sucursales, no se ejecuta un simple `migrate`. En desarrollo, se especificaron comandos de ejemplo para las bases Demo:
- `npm run prisma:branch:migrate:centro`
- `npm run prisma:branch:migrate:norte`
- `npm run prisma:branch:deploy:centro`
- `npm run prisma:branch:deploy:norte`

## Migración de TODAS las sucursales
Para propagar cambios en la estructura operacional a todas las bases activas, se utiliza:
`npm run branches:migrate-all` (script interno automatizado).

## Rollback y Limitaciones
- Prisma Migrate actualmente no ofrece una función de `--down` o "rollback" out-of-the-box. En caso de fallos graves, se requiere recuperar un snapshot físico de la DB o crear una nueva migración manual para revertir los esquemas.
