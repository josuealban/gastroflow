# Fases del proyecto — GastroFlow SaaS

La hoja de ruta conserva cuatro aplicaciones independientes. Una fase sólo debe marcarse como implementada después de superar sus verificaciones.

## Fase 1 — Estructura y comunicación

Estado: implementada.

- Estructura independiente de Gateway, Core, Audit y Frontend.
- Configuración local mediante variables de entorno.
- Comunicación HTTP entre React y el Gateway.
- Comunicación TCP del Gateway con Core y Audit.
- Health check con estados operativo, degradado y no disponible.
- Pruebas unitarias, de integración y e2e del alcance actual.

## Fase 2 — Persistencia con Prisma

Estado: implementada en código, pendiente de verificación PostgreSQL.

- Prisma 7 con clientes separados para control, sucursal y auditoría.
- Bases independientes de control, auditoría, Centro y Norte.
- Migraciones, seeds, cifrado, selección dinámica y caché de conexiones.
- Scripts de alta, migración, estado y aislamiento.
- Pendiente ejecutar migraciones, seeds y aislamiento en PostgreSQL de desarrollo.

## Fase 3 — Autenticación y autorización

Estado: pendiente.

- Autenticación de usuarios.
- Tokens JWT.
- Roles y permisos mediante RBAC.

## Fase 4 — Abastecimiento

Estado: pendiente.

- Inventario.
- Proveedores y compras.
- Operaciones transaccionales con garantías ACID.

## Fase 5 — Operación del restaurante

Estado: pendiente.

- Productos y mesas.
- Clientes.
- Pedidos y pagos.

## Fase 6 — Frontend completo

Estado: pendiente.

- Navegación y experiencia administrativa.
- Pantallas de los módulos habilitados.
- Manejo de sesión, formularios y estados remotos.

## Fase 7 — Entrega y documentación de API

Estado: pendiente.

- Swagger y colección de Postman.
- Ampliación de pruebas.
- Preparación de la presentación y entrega.

Los modelos de Prisma para fases futuras ya existen. JWT, RBAC funcional, endpoints de inventario, pedidos, pagos y sus garantías transaccionales siguen pendientes.
