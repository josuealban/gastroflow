# Prisma en GastroFlow

GastroFlow usa Prisma 7.8.0 con dos clientes generados y no versionados:

- Core: `prisma/control/schema.prisma` genera `src/generated/control-client` y accede sólo a `gastroflow_control`.
- Operations: `prisma/branch/schema.prisma` genera `src/generated/branch-client` y se conecta dinámicamente a cada base de sucursal.

`ControlPrismaService` encapsula el cliente central. En Operations, `BranchConnectionResolverClient` solicita la conexión a Core por `{ cmd: 'branch.connection.resolve' }`; la factoría construye la URL exclusivamente en backend y la caché reutiliza y desconecta clientes por `branchId`.

Los clientes se regeneran después de instalar dependencias y antes de compilar. Nunca se editan manualmente ni se envían URLs desde Gateway o frontend.

Comandos: `npm run prisma:generate`, `npm run prisma:migrate:control`, `npm run prisma:migrate:principal`, `npm run prisma:migrate:norte` y `npm run verify:branch-isolation`.
