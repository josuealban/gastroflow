# Arquitectura de GastroFlow

GastroFlow conserva cuatro proyectos independientes: React/Vite, API Gateway HTTP, Core TCP y Audit TCP. Cada uno mantiene package, build y configuración propios.

```mermaid
flowchart TD
  F["Frontend :5173"] -->|"HTTP /api/v1"| G["API Gateway :3000"]
  G -->|"TCP"| C["Core :3001"]
  G -->|"TCP health"| A["Audit :3002"]
  C --> CONTROL[("gastroflow_control")]
  C --> CENTRO[("gastroflow_demo_centro")]
  C --> NORTE[("gastroflow_demo_norte")]
  A --> AUDIT[("gastroflow_audit")]
```

El Gateway no depende de Prisma. Core consulta Control para seleccionar una base operacional y mantiene un cliente cacheado por sucursal. Audit sólo accede a su propia base. Las bases pueden vivir en un servidor PostgreSQL de desarrollo, pero son bases lógicas y físicas distintas.

La Fase 2 define modelos de usuarios, productos, inventario, pedidos y pagos para evolución futura; no expone aún sus endpoints ni afirma que esa lógica esté implementada.
