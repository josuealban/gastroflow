# Microservicios de GastroFlow

## Motivo de la elección

GastroFlow separa entrada pública, control central y operación para que cada responsabilidad evolucione con límites claros. La arquitectura también permite estudiar comunicación distribuida en el MVP académico.

## Proyectos independientes

| Proyecto | Puerto | Transporte | Responsabilidad de Fase 1 |
| --- | ---: | --- | --- |
| `api-gateway` | 3000 | HTTP | Única entrada pública y composición de health |
| `core-service` | 3001 | TCP | Health del futuro dominio central |
| `operations-service` | 3002 | TCP | Health del futuro dominio operacional |
| `frontend` | 5173 | HTTP hacia Gateway | Pantalla técnica de estado |

Cada proyecto mantiene su propio `package.json`. No hay Nx, carpeta `apps` ni una aplicación por sucursal.

## Comunicación

El Gateway conserva dos clientes TCP reutilizables, inyectados mediante `CORE_SERVICE_CLIENT` y `OPERATIONS_SERVICE_CLIENT`. Los contratos de Fase 1 son `{ cmd: 'core.health' }` y `{ cmd: 'operations.health' }`. Todas las consultas tienen timeout configurable.

## Ventajas

- límites de responsabilidad explícitos;
- despliegue y evolución potencialmente independientes;
- Gateway como política única de entrada;
- fallos y pruebas aislables mediante contratos.

## Desventajas y complejidad distribuida

- más procesos, configuración y observabilidad;
- latencia y fallos parciales de red;
- versionamiento de contratos TCP;
- diagnóstico y despliegue más exigentes;
- persistencia distribuida futura sin transacciones globales sencillas.

Fase 1 cubre estructura y health. Autenticación, datos centrales, selección de bases operacionales y CRUD siguen pendientes.
