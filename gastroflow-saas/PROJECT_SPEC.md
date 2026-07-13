# GastroFlow SaaS — Especificaciones del Proyecto

## Problema

Las empresas de restauración con múltiples sucursales carecen de un sistema unificado que aísle los datos operativos por sucursal, gestione roles y permisos específicos por ubicación, y proporcione auditoría centralizada de seguridad.

## Objetivo General

Desarrollar un sistema SaaS para la administración integral de restaurantes con múltiples sucursales, aplicando los conocimientos adquiridos durante el ciclo académico en: HTTP, APIs RESTful, microservicios, bases de datos relacionales, autenticación, autorización y desarrollo frontend moderno.

## Objetivos Específicos

1. Implementar una arquitectura de microservicios con comunicación TCP.
2. Aplicar el patrón de base de datos independiente por sucursal (database-per-tenant).
3. Implementar autenticación JWT con bcrypt y Passport.
4. Implementar RBAC con roles: OWNER, MANAGER, WAITER, CASHIER, INVENTORY_MANAGER.
5. Gestionar inventario con trazabilidad de movimientos.
6. Implementar transacciones ACID para pedidos y pagos.
7. Documentar la API con Swagger.
8. Desarrollar un frontend React con diseño profesional.

## Alcance

### Incluido
- Gestión de empresas y sucursales
- Autenticación y autorización (RBAC)
- Gestión de productos y categorías
- Gestión de mesas y reservaciones
- Gestión de pedidos y pagos
- Control de inventario y proveedores
- Auditoría de seguridad
- Panel de administración React

### Excluido
- Aplicación móvil
- Integración con pasarelas de pago reales
- Sistema de fidelización de clientes
- Módulo de contabilidad avanzada

## Actores del Sistema

| Actor | Descripción |
|-------|-------------|
| Platform Admin | Administrador de la plataforma SaaS |
| Owner | Dueño de la empresa restaurantera |
| Manager | Gerente de sucursal |
| Waiter | Mesero (toma pedidos) |
| Cashier | Cajero (procesa pagos) |
| Inventory Manager | Responsable de inventario |

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE                                │
│              React + Vite + TypeScript                      │
│                     Puerto 5173                             │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     API GATEWAY                              │
│              NestJS + Swagger + ValidationPipe               │
│                     Puerto 3000                              │
└────────────────────┬─────────────────┬───────────────────────┘
                     │ TCP             │ TCP (health only)
                     ▼                 ▼
┌────────────────────────┐   ┌──────────────────────┐
│     CORE SERVICE       │   │    AUDIT SERVICE      │
│  NestJS + Prisma +     │──▶│  NestJS + Prisma     │
│  JWT + RBAC            │   │                      │
│  Puerto 3001 (TCP)     │   │  Puerto 3002 (TCP)   │
└────────┬───────────────┘   └──────────┬───────────┘
         │                              │
         ▼                              ▼
┌────────────────────┐      ┌───────────────────────┐
│ gastroflow_control │      │  gastroflow_audit     │
│ gastroflow_centro  │      └───────────────────────┘
│ gastroflow_norte   │
└────────────────────┘
```

## Requisitos Funcionales

### RF-01: Autenticación
- Login por `branchCode` + `email` + `password`
- JWT de acceso y refresh token
- Logout con invalidación de refresh token

### RF-02: Gestión de Usuarios
- CRUD de usuarios por sucursal
- Asignación de roles
- Un usuario puede tener múltiples roles

### RF-03: Gestión de Productos
- CRUD de categorías y productos
- Precios con decimales
- Disponibilidad por producto

### RF-04: Gestión de Mesas
- CRUD de mesas por sucursal
- Estados: AVAILABLE, OCCUPIED, RESERVED, OUT_OF_SERVICE
- Reservaciones con confirmación

### RF-05: Gestión de Pedidos
- Crear pedido asociado a mesa
- Agregar/modificar/eliminar ítems
- Flujo: OPEN → IN_PREPARATION → READY → DELIVERED → PAID

### RF-06: Gestión de Pagos
- Múltiples métodos: CASH, CARD, TRANSFER
- Estados: PENDING, COMPLETED, FAILED, REFUNDED
- Cierre automático de pedido al pagar

### RF-07: Inventario
- Registro de ingredientes y unidades de medida
- Movimientos: PURCHASE_ENTRY, SALE_CONSUMPTION, WASTE, ADJUSTMENT
- Stock mínimo con alertas
- Gestión de proveedores y compras

### RF-08: Auditoría
- Registro de eventos de seguridad (login, logout, accesos denegados)
- Registro de operaciones importantes (creación/eliminación de usuarios)

## Requisitos No Funcionales

| Código | Descripción |
|--------|-------------|
| RNF-01 | Cada sucursal usa una base de datos PostgreSQL independiente |
| RNF-02 | Las contraseñas se almacenan con bcrypt (factor 10) |
| RNF-03 | Los JWT expiran en 15 minutos; refresh token en 7 días |
| RNF-04 | La API responde en menos de 500ms en condiciones normales |
| RNF-05 | Ninguna credencial de base de datos se expone en respuestas HTTP |
| RNF-06 | El código no usa `any` sin justificación documentada |

## Módulos Previstos

| Módulo | Servicio | Estado |
|--------|---------|--------|
| Health | api-gateway, core, audit | ✅ Completo |
| Auth | core-service | 🔜 Fase 3 |
| Companies & Branches | core-service | 🔜 Fase 2 |
| Users & Roles | core-service | 🔜 Fase 3 |
| Products | core-service | 🔜 Fase 4 |
| Tables | core-service | 🔜 Fase 4 |
| Orders | core-service | 🔜 Fase 4 |
| Payments | core-service | 🔜 Fase 4 |
| Inventory | core-service | 🔜 Fase 4 |
| Audit Logs | audit-service | 🔜 Fase 2 |
| Frontend Dashboard | frontend | 🔜 Fase 5 |

## Bases de Datos

| Base | Servicio | Contenido |
|------|---------|-----------|
| `gastroflow_control` | core-service | Empresas, sucursales, planes, suscripciones |
| `gastroflow_audit` | audit-service | Logs de auditoría y eventos de seguridad |
| `gastroflow_demo_centro` | core-service (dyn) | Datos operativos Sucursal Centro |
| `gastroflow_demo_norte` | core-service (dyn) | Datos operativos Sucursal Norte |

## Fases del Proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Estructura base y comunicación entre microservicios | ✅ Completo |
| 2 | Bases de datos, Prisma ORM y multi-tenancy | 🔜 Siguiente |
| 3 | Autenticación JWT, RBAC y Guards | ⬜ Pendiente |
| 4 | Módulos de negocio completos | ⬜ Pendiente |
| 5 | Frontend React completo | ⬜ Pendiente |
| 6 | Pruebas completas y documentación Swagger | ⬜ Pendiente |
