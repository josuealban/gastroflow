# Separación de bases

Este documento sustituye la propuesta anterior de tres bases globales por dominio.

La decisión vigente es:

- una base central `gastroflow_control`, administrada por Core;
- una base operacional por sucursal, administrada dinámicamente por Operations;
- un solo schema operacional aplicado a todas las sucursales;
- sin `branchId` repetido en las tablas operacionales.

Consulte [Estrategia de bases](DATABASE_STRATEGY.md) y [Modelo de sucursales](BRANCH_MODEL.md). Los schemas `personal`, `customers` y `operations` presentes en el árbol son legado no confirmado que Fase 2 debe rediseñar.
