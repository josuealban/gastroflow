# Servicios de GastroFlow

GastroFlow mantiene tres aplicaciones NestJS independientes y un frontend React/Vite:

1. API Gateway: HTTP 3000, única entrada pública, sin Prisma.
2. Core Service: TCP 3001, dueño de `gastroflow_control`.
3. Operations Service: TCP 3002, dueño del schema y conexiones operacionales por sucursal.
4. Frontend: 5173, consumidor exclusivo del Gateway.

Las sucursales son registros, no microservicios. Añadir una sucursal crea datos centrales y una base operacional; no crea procesos, proyectos o frontends.

Los health checks TCP `health.core` y `health.operations` ya existen. Los contratos funcionales, manejo uniforme de errores, autenticación y observabilidad pertenecen a fases posteriores.
