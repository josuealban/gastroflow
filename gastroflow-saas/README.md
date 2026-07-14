# GastroFlow SaaS

GastroFlow es una plataforma SaaS para la gestión de restaurantes con múltiples sucursales. Este repositorio contiene cuatro proyectos independientes; no es un monorepo NestJS ni usa Nx.

## Arquitectura congelada

```text
frontend :5173
    |
    | HTTP/JSON
    v
api-gateway :3000
    | TCP                 | TCP
    v                     v
core-service :3001    operations-service :3002
    |                     |
    v                     v
gastroflow_control    una base PostgreSQL por sucursal
                      (un mismo schema operacional)
```

- `api-gateway`: única entrada HTTP futura bajo `/api/v1`; no usa Prisma ni PostgreSQL.
- `core-service`: datos centrales de restaurantes, sucursales, planes, suscripciones, usuarios, personal y acceso.
- `operations-service`: seleccionará dinámicamente la base de la sucursal activa y gestionará sus operaciones.
- `frontend`: React con Vite; se comunica únicamente con el Gateway.

Una sucursal es un registro administrado por la plataforma. No es un microservicio, frontend, Gateway ni despliegue independiente.

## Estado real al cerrar la Parte 0

La estructura HTTP/TCP, los puertos y los health checks ya existen. El árbol de trabajo también contiene una implementación Prisma no confirmada basada en tres bases globales por dominio y `restaurantId`. Esa persistencia contradice la arquitectura congelada y queda inventariada para rediseño, no como funcionalidad válida.

En la Parte 0 no se instalaron dependencias, no se ejecutaron migraciones y no se implementaron endpoints ni lógica funcional.

## Documentación principal

- [Especificación](PROJECT_SPEC.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Modelo SaaS](docs/SAAS_MODEL.md)
- [Modelo de sucursales](docs/BRANCH_MODEL.md)
- [Estrategia de bases](docs/DATABASE_STRATEGY.md)
- [Modelo de personal](docs/STAFF_MODEL.md)
- [Requisitos académicos](docs/ACADEMIC_REQUIREMENTS.md)
- [Visión de titulación](docs/THESIS_VISION.md)
- [Lista de tareas](docs/TASK_LIST.md)
- [Informe de Parte 0](docs/PHASE_0_REPORT.md)

## Herramientas observadas

- Node.js `v24.14.1`.
- npm `11.11.0`.
- Docker y Docker Compose no están disponibles en el equipo inspeccionado.

Los comandos de instalación, generación y migración pertenecen a fases posteriores y deben ejecutarse sólo después de retirar o rediseñar el legado contradictorio.
