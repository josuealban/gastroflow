# Informe de Fase 2

## Objetivo

Preparar persistencia separada para control, auditoría y cada sucursal sin implementar todavía endpoints de autenticación o negocio.

## Implementado

- PostgreSQL de desarrollo con cuatro bases y health check en Docker Compose.
- Tres schemas y clientes Prisma separados.
- Migraciones SQL iniciales e historiales separados.
- Seeds de control, Centro, Norte y Audit.
- Cifrado AES-256-GCM de contraseñas de sucursales.
- Selección por id/código, validación de suscripción y caché de clientes.
- CLI para crear, migrar, inspeccionar y verificar aislamiento.
- Pruebas unitarias de cifrado, caché, disponibilidad y cierre.
- Pruebas de integración preparadas para PostgreSQL real.

## Estado de verificación

Schemas, generación de clientes, lint, pruebas unitarias y builds se verifican sin PostgreSQL. En el equipo de implementación Docker no está instalado y el PostgreSQL local no acepta las credenciales de desarrollo, por lo que migraciones, seeds y aislamiento real siguen pendientes de ejecución. La Fase 2 no se marca como completada hasta superar esos pasos.

## Datos exclusivamente de desarrollo

El seed de Centro prepara `owner@demo.com`, `manager@demo.com`, `waiter@demo.com`, `cashier@demo.com` e `inventory@demo.com`. Norte sólo prepara `owner@demo.com`. Las contraseñas de desarrollo son, respectivamente, `Owner123*`, `Manager123*`, `Waiter123*`, `Cashier123*` e `Inventory123*`; se almacenan únicamente como hashes bcrypt y deben cambiarse fuera del entorno local.

Centro contiene Encebollado, cinco mesas, cliente, arroz y proveedor propios. Norte contiene Bolón, tres mesas, otro cliente, plátano y otro proveedor. Estos datos diferentes sirven para comprobar el aislamiento.

## Siguiente fase

Después de validar PostgreSQL: autenticación por sucursal con bcrypt, JWT y RBAC utilizando los modelos ya creados, sin enviar credenciales de base al cliente.
