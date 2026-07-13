# Modelo de Datos — GastroFlow SaaS

## Bases de Datos

GastroFlow utiliza tres dominios de almacenamiento independientes.

---

## 1. Base de Control (`gastroflow_control`)

Administrada por `core-service`. Gestiona la estructura multi-empresa del SaaS.

### Company
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador único |
| name | String | Nombre comercial |
| legalName | String? | Razón social |
| taxId | String? | RFC / NIT / RUC |
| email | String | Correo de contacto |
| phone | String? | Teléfono |
| isActive | Boolean | Estado activo |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Fecha de actualización |

### Branch
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador único |
| companyId | UUID (FK) | Empresa propietaria |
| name | String | Nombre de la sucursal |
| code | String (unique) | Código de acceso (ej. DEMO-CENTRO) |
| address | String? | Dirección |
| phone | String? | Teléfono |
| databaseName | String | Nombre de la base de datos |
| databaseHost | String | Host PostgreSQL |
| databasePort | Int | Puerto PostgreSQL |
| databaseUser | String | Usuario PostgreSQL |
| encryptedDatabasePassword | String | Contraseña cifrada |
| isActive | Boolean | Estado activo |
| createdAt | DateTime | — |
| updatedAt | DateTime | — |

### Plan
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | — |
| name | String | Nombre del plan |
| description | String? | Descripción |
| price | Decimal | Precio mensual |
| maxBranches | Int | Máximo de sucursales |
| maxUsersPerBranch | Int | Máximo de usuarios por sucursal |
| maxTablesPerBranch | Int | — |
| maxProductsPerBranch | Int | — |
| isActive | Boolean | — |

### Subscription
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | — |
| companyId | UUID (FK) | — |
| planId | UUID (FK) | — |
| status | SubscriptionStatus | TRIAL, ACTIVE, EXPIRED, SUSPENDED |
| startDate | DateTime | — |
| endDate | DateTime | — |

### PlatformAdmin
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | — |
| name | String | — |
| email | String (unique) | — |
| passwordHash | String | bcrypt hash |
| isActive | Boolean | — |

---

## 2. Base de Auditoría (`gastroflow_audit`)

Administrada exclusivamente por `audit-service`.

### AuditLog
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | — |
| externalEventId | String (unique) | ID de evento externo |
| companyId | String? | — |
| branchId | String? | — |
| userId | String? | — |
| userName | String? | — |
| action | String | Acción realizada |
| entity | String | Entidad afectada |
| entityId | String? | ID de la entidad |
| severity | String | INFO, WARNING, ERROR, CRITICAL |
| metadata | JSON? | Datos adicionales |
| ipAddress | String? | IP del cliente |
| userAgent | String? | User-Agent |
| createdAt | DateTime | — |

### SecurityEvent
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | — |
| externalEventId | String (unique) | — |
| type | String | LOGIN_SUCCESS, LOGIN_FAILED, etc. |
| email | String? | — |
| branchCode | String? | — |
| ipAddress | String? | — |
| success | Boolean | — |
| details | JSON? | — |
| createdAt | DateTime | — |

---

## 3. Base Operacional por Sucursal

Cada sucursal tiene su propia base de datos PostgreSQL con el mismo esquema.

Bases iniciales:
- `gastroflow_demo_centro`
- `gastroflow_demo_norte`

### Modelos

- **User** — Usuarios de la sucursal
- **Role** — Roles del sistema (OWNER, MANAGER, WAITER, CASHIER, INVENTORY_MANAGER)
- **Permission** — Permisos individuales
- **UserRole** — Relación N:M User ↔ Role
- **RolePermission** — Relación N:M Role ↔ Permission
- **RefreshToken** — Tokens de renovación JWT
- **Category** — Categorías de productos
- **Product** — Productos del menú
- **RestaurantTable** — Mesas del restaurante
- **Customer** — Clientes registrados
- **Reservation** — Reservaciones de mesas
- **Order** — Pedidos
- **OrderItem** — Ítems de pedido
- **Payment** — Pagos
- **InventoryItem** — Ingredientes/insumos
- **Supplier** — Proveedores
- **Purchase** — Órdenes de compra
- **PurchaseItem** — Ítems de compra
- **InventoryMovement** — Movimientos de inventario
- **Recipe** — Recetas de productos
- **RecipeItem** — Ingredientes por receta
- **OutboxEvent** — Eventos pendientes de envío a audit-service
