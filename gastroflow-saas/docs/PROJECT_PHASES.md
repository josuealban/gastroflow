# Fases del Proyecto — GastroFlow SaaS

Este documento detalla la planificación paso a paso para el desarrollo completo de GastroFlow SaaS.

---

## Fase 1: Estructura Base y Health Check (Estado: Completado ✅)
- Inicialización de los 4 proyectos independientes (`api-gateway`, `core-service`, `audit-service`, `frontend`).
- Limpieza de Git y configuración correcta del `.gitignore` raíz.
- Configuración de variables de entorno con `@nestjs/config`.
- Implementación de la comunicación interna TCP.
- Endpoint de monitoreo `/api/v1/health` funcional con estados `ok`, `degraded`, e `unavailable`.
- Integración de Axios en el frontend para monitorear la salud del backend en español.

---

## Fase 2: Bases de Datos, Prisma y Multi-Tenancy (Estado: Próxima Fase 🔜)
- Configuración de base de datos de control (`gastroflow_control`).
- Configuración de base de datos de auditoría (`gastroflow_audit`).
- Modelado dinámico de base de datos por sucursal (ej: `gastroflow_demo_centro`).
- Creación de factorías y cachés de clientes Prisma dinámicos.
- Implementación de migraciones e inyección de datos semilla (seeds).

---

## Fase 3: Autenticación, JWT y RBAC (Estado: Pendiente ⬜)
- Cifrado de contraseñas con `bcrypt`.
- Emisión y validación de tokens JWT de acceso y renovación (refresh tokens).
- Estrategias de Passport.
- Guards personalizados para control de accesos basados en roles (RBAC) a nivel de sucursal.

---

## Fase 4: Módulos de Negocio Core (Estado: Pendiente ⬜)
- CRUD de Productos y Categorías.
- Administración de Mesas y Reservaciones.
- Gestión de Pedidos (`Order` y `OrderItem`) con estados en tiempo real.
- Control de Inventario, Proveedores y Compras con movimientos de insumos.
- Transacciones SQL robustas que garanticen consistencia (ACID).

---

## Fase 5: Desarrollo del Frontend Dashboard (Estado: Pendiente ⬜)
- Implementación de la UI completa usando Tailwind CSS y shadcn/ui.
- Enrutamiento estructurado con React Router.
- Manejo de estado de red con TanStack Query y formularios con Zod y React Hook Form.
- Gráficos estadísticos con Recharts.

---

## Fase 6: Pruebas e2e y Documentación (Estado: Pendiente ⬜)
- Cobertura de pruebas automatizadas unitarias y de integración de extremo a extremo.
- Documentación interactiva de todas las rutas HTTP con Swagger expuesta en `/api/docs`.
