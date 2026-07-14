# RBAC — Control de Acceso Basado en Roles

GastroFlow implementa RBAC (Role-Based Access Control) a nivel de sucursal. Cada usuario dentro de una sucursal puede tener uno o más roles que determinan sus permisos.

## Roles

| Rol                 | Descripción                                               |
| ------------------- | --------------------------------------------------------- |
| `OWNER`             | Dueño con acceso total a la sucursal                      |
| `MANAGER`           | Gerente, puede gestionar todo excepto eliminar la empresa |
| `WAITER`            | Mesero, puede crear y gestionar pedidos                   |
| `CASHIER`           | Cajero, puede procesar pagos                              |
| `INVENTORY_MANAGER` | Gestiona inventario, proveedores y compras                |

## Modelo de Datos

```
User ─────── UserRole ─────── Role ─────── RolePermission ─────── Permission
```

- Un `User` puede tener múltiples `Role` (a través de `UserRole`).
- Un `Role` tiene múltiples `Permission` (a través de `RolePermission`).
- Las relaciones son N:M en ambos casos.

## Permisos (Ejemplos)

| Permiso            | Descripción           |
| ------------------ | --------------------- |
| `users:read`       | Ver lista de usuarios |
| `users:create`     | Crear usuarios        |
| `users:update`     | Actualizar usuarios   |
| `users:delete`     | Eliminar usuarios     |
| `products:read`    | Ver productos         |
| `products:create`  | Crear productos       |
| `orders:read`      | Ver pedidos           |
| `orders:create`    | Crear pedidos         |
| `orders:update`    | Actualizar pedidos    |
| `payments:process` | Procesar pagos        |
| `inventory:read`   | Ver inventario        |
| `inventory:manage` | Gestionar inventario  |

## Implementación con Guards

Se usará `@nestjs/passport` con JWT Strategy y Guards personalizados:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'MANAGER')
@Get('users')
findAll() { ... }
```

## Flujo de Autorización

1. Frontend envía `Authorization: Bearer <token>`.
2. `api-gateway` valida el JWT en la cabecera.
3. El payload del JWT incluye `userId`, `branchId`, `roles`.
4. El `RolesGuard` verifica que el usuario tenga el rol necesario.
5. Si no tiene permiso → HTTP 403 Forbidden.
