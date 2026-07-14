# Prisma — diseño pendiente de Fase 2

Prisma será el ORM para PostgreSQL, con un schema central y un schema operacional reutilizable. Core tendrá un cliente de control. Operations necesitará crear o reutilizar clientes según la sucursal activa, sin aceptar URL de base desde el frontend.

El ciclo de conexión deberá cubrir inicialización, límites de caché, expiración, invalidación, cierre y errores sanitizados. Los clientes se generarán sólo desde schemas aprobados y nunca se editarán manualmente.

## Estado observado

El repositorio ya contiene Prisma 7.8.0, schemas, clientes generados, migrations y seeds para tres bases globales. Esos artefactos provienen del trabajo anterior y contradicen la decisión actual. Parte 0 no instaló Prisma, no generó clientes y no ejecutó migraciones.

Fase 2 debe decidir rutas y comandos definitivos, reemplazar el legado de forma revisada y demostrar aislamiento con dos bases físicas de sucursal.
