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

Estado: pendiente.

- Incorporar Prisma.
- Diseñar las bases de control, auditoría y sucursales.
- Definir migraciones y datos iniciales de desarrollo.

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

Prisma, JWT, RBAC, inventario, pedidos, pagos y las garantías ACID no forman parte de la implementación actual.
