# Database Model

## Control Model
- **Company**: Representa una empresa cliente.
- **Branch**: Representa una sucursal física de la empresa, y contiene la configuración (Host, nombre, etc.) para conectar a su base de datos propia.
- **Plan**: Planes de suscripción disponibles.
- **Subscription**: La suscripción activa de una empresa.
- **PlatformAdmin**: Administradores del SaaS (superusuarios).
- **GlobalOutboxEvent**: Mensajes a emitir por el sistema central.

## Branch Model
Cada sucursal posee su base de datos aislada con las siguientes tablas:
- **User, Role, Permission**: Sistema RBAC.
- **Category, Product, Recipe, InventoryItem**: Menú e inventario.
- **RestaurantTable, Customer, Reservation**: Manejo de espacio físico y clientes.
- **Order, OrderItem, Payment**: Gestión de ventas.
- **Supplier, Purchase, InventoryMovement**: Adquisiciones de stock.
- **OutboxEvent**: Comunicación desde la sucursal al resto del sistema.

## Audit Model
- **AuditLog**: Eventos del negocio.
- **SecurityEvent**: Inicios de sesión fallidos o intentos de intrusión.
- **IntegrationError**: Registro de errores técnicos al integrar microservicios.

## Relaciones principales
- Company 1:N Branch
- Role N:M Permission
- User N:M Role
- Order 1:N OrderItem
- Recipe N:M InventoryItem

## Enums
Usados en Control (`SubscriptionStatus`), Auditoría (`AuditSeverity`), y Sucursal (`OrderStatus`, `TableStatus`, `PaymentMethod`, etc.).

## Decisiones de Normalización
Se decidió separar por completo el catálogo operacional (Productos, Pedidos, Usuarios de Restaurante) de la gestión administrativa del SaaS. Los decimales se usan para manejar finanzas e inventario evitando imprecisiones numéricas de punto flotante.
