# Fases del proyecto

## Parte 0 — congelación

Inspeccionar, resolver contradicciones en documentación, congelar decisiones y construir la hoja de ruta. No modifica lógica ni persistencia.

## Fase 1 — estructura base

Estabilizar los cuatro proyectos, transportes HTTP/TCP, health checks, configuración y contratos mínimos. Retirar referencias operativas a la arquitectura descartada sin instalar Prisma ni migrar datos.

## Fase 2 — Prisma

Diseñar e implementar `gastroflow_control`, el schema operacional único, provisionamiento técnico, conexiones dinámicas y migraciones coordinadas. Probar dos bases de sucursales aisladas.

## Fase 3 — autenticación

Implementar bcrypt, JWT, Passport, refresh tokens, Guards, `CurrentUser` y RBAC con pertenencia y roles por sucursal.

## Fase 4 — sucursales

Implementar alta, límites de plan, estados, creación de base, copia selectiva de plantilla, asignación de propietario y selección de sucursal activa.

## Fase 5 — personal

Implementar perfiles centrales, asignaciones `UserBranch`, roles por sucursal y experiencia de administración de personal.

## Fase 6 — platillos

Implementar categorías, tarjetas de platillos, alta/edición, descripción libre e imágenes por URL externa.

## Fase 7 — inventario y compras

Implementar artículos, proveedores, compras y movimientos transaccionales. La plantilla copia catálogo, pero inicia cantidades y costos en cero.

## Fase 8 — clientes y mesas

Implementar clientes, reservaciones y mesas dentro de la base operacional seleccionada.

## Fase 9 — pedidos

Implementar ciclo del pedido, múltiples platillos, estados, pagos y snapshots históricos.

## Fase 10 — facturación

Implementar comprobante interno desde pedido, tasa configurable, secuencia transaccional, historia, filtros y archivo lógico. No incluye autorización SRI.

## Fase 11 — frontend

Completar autenticación, selección por tarjetas, navegación y módulos funcionales consumiendo sólo el Gateway.

## Fase 12 — reportes, calidad y despliegue

Completar Postman, reportes, pruebas, seguridad, rendimiento, observabilidad, backups, HTTPS, CI/CD, despliegue y evidencia académica.

Cada fase exige criterios de aceptación y evidencia antes de marcar tareas como completadas.
