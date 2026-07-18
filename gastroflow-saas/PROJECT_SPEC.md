# GastroFlow SaaS — Especificación congelada

## Estado alcanzado en Fase 2

Quedaron implementados el modelo central, el schema operacional por sucursal, migraciones, seeds, cinco vistas SQL, cifrado AES-256-GCM, resolución TCP interna y caché dinámica. La prueba física concluye con `PASS: branch databases are isolated`.

No forman parte de esta fase: login, JWT, guards, RBAC ejecutable, endpoints comerciales, `POST /branches`, botón Nueva sucursal, pedidos/pagos funcionales, factura, PDF o frontend comercial.

## Objetivo general

Construir una plataforma SaaS basada en servicios independientes para gestionar restaurantes, sus sucursales y la operación aislada de cada sucursal.

## Alcance organizacional

- Una plataforma atiende varios restaurantes.
- Cada restaurante puede tener una o varias sucursales.
- Una sucursal es una entidad de negocio dentro de la plataforma.
- Un usuario puede pertenecer a varias sucursales y tener roles diferentes en cada una.
- La selección de sucursal activa delimitará las operaciones visibles.

## Proyectos definitivos

| Proyecto | Transporte | Puerto | Responsabilidad |
| --- | --- | ---: | --- |
| `api-gateway` | HTTP | 3000 | Entrada del frontend y Postman; futura API `/api/v1` |
| `core-service` | TCP | 3001 | Control central, identidad, personal y acceso a sucursales |
| `operations-service` | TCP | 3002 | Datos operacionales de la base correspondiente a la sucursal activa |
| `frontend` | HTTP hacia Gateway | 5173 | Experiencia web React/Vite |

Cada proyecto conserva su propio `package.json`. No se usará Nx, carpeta `apps` ni monorepo NestJS.

## Persistencia definitiva

### Base central

`gastroflow_control` contendrá `Restaurant`, `Branch`, `Plan`, `Subscription`, `User`, `EmployeeProfile`, `Role`, `Permission`, `UserRole`, `RolePermission`, `UserBranch`, `UserBranchRole` y `RefreshToken`.

### Bases operacionales

Cada sucursal tendrá una base PostgreSQL propia creada desde el mismo schema operacional. La base representa a la sucursal; por ello, las tablas operacionales no necesitan `branchId`.

El schema operacional incluirá clientes, reservaciones, categorías, platillos, mesas, inventario, proveedores, compras, pedidos, pagos, facturas, configuración tributaria, secuencia y `OutboxEvent`.

## Alta futura de una sucursal

`POST /api/v1/branches` recibirá sólo datos de negocio y una plantilla opcional. El backend validará propietario, restaurante, suscripción y límites del plan; creará la sucursal en `PROVISIONING`; generará internamente el nombre y las credenciales; creará la base; aplicará migraciones; copiará catálogos; inicializará operaciones en cero; asignará al propietario; verificará conexión y cambiará a `ACTIVE` o `FAILED`.

Nunca se enviarán desde el frontend nombres, hosts, puertos, usuarios, contraseñas, URL de base ni claves de cifrado.

## Copia desde plantilla

Se copiarán categorías, platillos y catálogo de inventario. `currentStock`, costos, daños, pérdidas, secuencia de factura, ventas y dashboard iniciarán en cero. No se copiarán clientes, reservaciones, pedidos, pagos, facturas, historial, compras, movimientos, PDF ni eventos operacionales.

## Funcionalidad futura

- Selección de sucursal: `POST /api/v1/session/branch`, después de verificar pertenencia.
- Platillos con imagen externa por `imageUrl`; ingredientes opcionales como texto libre; sin recetas obligatorias.
- Inventario `INGREDIENT`, `CONSUMABLE` y `UTENSIL`, con movimientos auditables y sin WebSockets en el MVP.
- Personal centralizado y asignado mediante `UserBranch` y `UserBranchRole`.
- Pedidos con varios platillos y snapshots históricos.
- Facturas internas generadas desde pedidos, sin borrado físico, con filtros, paginación, archivo lógico y tasa tomada de `TaxConfiguration`.

## Fuera de la Parte 0

Prisma definitivo, migraciones, bases, seeds, endpoints funcionales, JWT, Passport, RBAC operativo, registro de sucursales, CRUD de negocio, PDF, despliegue e integración legal con SRI.

## Estado de la especificación

Esta especificación reemplaza arquitecturas anteriores. El código Prisma actual de tres bases globales es legado no confirmado y deberá tratarse mediante una migración planificada, nunca como cumplimiento de este documento.

## Decisiones definitivas

1. GastroFlow es SaaS.
2. Puede atender varios restaurantes.
3. Cada restaurante puede tener varias sucursales.
4. Las sucursales no son microservicios.
5. Existe una base central `gastroflow_control`.
6. Cada sucursal tiene su propia base operacional.
7. Todas utilizan el mismo schema operacional.
8. API Gateway no usa Prisma.
9. Core Service administra datos centrales.
10. Operations Service administra bases operacionales.
11. Las tablas operacionales no requieren `branchId`.
12. La nueva sucursal copia catálogos, no historial.
13. El stock nuevo comienza en cero.
14. Los platillos pueden copiarse desde una plantilla.
15. También pueden crearse mediante `Nuevo platillo`.
16. Las imágenes se almacenan mediante URL.
17. El personal se almacena centralmente.
18. Un empleado puede estar en varias sucursales.
19. Las facturas se generan desde pedidos.
20. La tarifa tributaria es configurable.
21. Las facturas se conservan mediante historial.
22. La integración legal con SRI queda fuera del MVP.
23. El proyecto debe poder evolucionar a titulación.

Estas decisiones no se cambiarán sin una orden explícita del usuario.
# Estado de Fase 3

La identidad se resuelve mediante `restaurantSlug + email + password`. La autoridad de roles, permisos y sucursales es exclusivamente `gastroflow_control`; Gateway valida Access Tokens con Passport y nunca consulta Prisma.
# Administración de sucursales

La creación es asíncrona (202), idempotente y limitada por plan. Core orquesta y Operations aprovisiona una base operacional independiente sin exponer credenciales.
