# Arquitectura de Microservicios — GastroFlow SaaS

Este documento describe la estructura y comunicación entre los diferentes microservicios independientes que componen el backend de GastroFlow.

## Componentes del Backend

GastroFlow está diseñado como un conjunto de tres aplicaciones NestJS independientes:

1. **api-gateway** (Puerto `3000`): Entrada HTTP y traducción HTTP-TCP.
2. **core-service** (Puerto `3001` TCP): Base para la futura lógica de negocio; actualmente expone salud.
3. **audit-service** (Puerto `3002` TCP): Base para la futura auditoría; actualmente expone salud.

```
                  ┌──────────────┐
                  │ api-gateway  │
                  └──────┬───────┘
                         │
            ┌────────────┴────────────┐
        TCP │                     TCP │
            ▼                         ▼
   ┌────────────────┐        ┌─────────────────┐
   │  core-service  │        │  audit-service  │
   └────────────────┘        └─────────────────┘
```

## Comunicación TCP

- **Transporte TCP**: La comunicación interna usa el transporte TCP de `@nestjs/microservices`, manteniendo los servicios sin endpoints HTTP públicos.
- **Patrones de Mensajes**: En lugar de rutas HTTP tradicionales, los microservicios responden a patrones o comandos basados en objetos JSON. Por ejemplo:
  - `{ cmd: 'health.core' }`
  - `{ cmd: 'health.audit' }`

## Manejo de Fallos (Resiliencia)

- **Aislamiento**: Si un servicio secundario como `audit-service` se apaga, el sistema puede seguir operando en modo **degradado** (el Gateway sigue respondiendo `ok` para las funciones principales, pero marca la auditoría como `down`).
- **Caída Crítica**: Si el `core-service` no está disponible, el Gateway responde con `503 Service Unavailable`.
- **Timeouts**: Cada llamada TCP interna tiene un timeout máximo de `2000 ms` gestionado por RxJS para evitar que las peticiones se queden colgadas indefinidamente.

## Ventajas y desventajas

La separación permite desplegar, probar y evolucionar cada proceso de forma independiente, y aísla la caída de Audit para que el Gateway pueda informar un estado degradado. A cambio, introduce comunicación de red, configuración distribuida y más procesos que observar. Por eso la fase inicial limita el alcance a contratos de salud comprobables antes de incorporar persistencia o negocio.
