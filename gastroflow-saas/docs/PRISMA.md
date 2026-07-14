# Prisma en GastroFlow

La Fase 2 usa Prisma ORM 7.8.0, el generador `prisma-client`, salida explícita y `@prisma/adapter-pg`.

## Schemas y clientes

- Control: `core-service/prisma/control/schema.prisma` → `src/generated/control-client`.
- Sucursal: `core-service/prisma/branch/schema.prisma` → `src/generated/branch-client`.
- Audit: `audit-service/prisma/schema.prisma` → `src/generated/audit-client`.

Los clientes no se generan en `node_modules`. Cada Prisma Config define schema, migraciones, seed y datasource para el CLI. En ejecución, el adaptador recibe la cadena de conexión desde variables o desde la selección segura de sucursal.

`ControlPrismaService` y el `PrismaService` de Audit conectan y desconectan con el ciclo de vida Nest. La factory de sucursales crea clientes; la caché evita un pool por solicitud y los cierra al apagar.

## Cuidados

- Convertir `Decimal` explícitamente al responder por una API futura; no tratar dinero como `number` sin decisión de precisión.
- No registrar URLs, claves ni contraseñas.
- Regenerar clientes después de cambiar un schema.
- Desplegar primero migraciones compatibles y después código consumidor.
- No aceptar conexiones desde payloads HTTP.
