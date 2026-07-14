# Migraciones

Hay tres historiales independientes:

- Control: `core-service/prisma/control/migrations`.
- Plantilla operacional: `core-service/prisma/branch/migrations`.
- Auditoría: `audit-service/prisma/migrations`.

## Comandos

```bash
# Control
cd core-service
npm run prisma:control:validate
npm run prisma:control:generate
npm run prisma:control:deploy
npm run prisma:control:seed

# Centro y Norte usan el mismo historial
npm run prisma:branch:validate
npm run prisma:branch:generate
npm run prisma:branch:deploy:centro
npm run prisma:branch:deploy:norte
npm run prisma:branch:seed:centro
npm run prisma:branch:seed:norte

# Todas las sucursales registradas
npm run branches:migrate-all
npm run branches:status

# Auditoría
cd ../audit-service
npm run prisma:validate
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
```

`migrate dev` se reserva para crear una nueva migración en desarrollo. Centro y Norte reciben `migrate deploy`; nunca se crea un historial distinto por sucursal.

## Rollback

Prisma Migrate no genera rollback automático seguro. En producción se prefieren migraciones compatibles hacia adelante y una migración correctiva. Un rollback manual requiere respaldo probado y SQL revisado. `npm run db:reset` elimina el volumen local completo: es destructivo y nunca debe usarse con datos reales.
