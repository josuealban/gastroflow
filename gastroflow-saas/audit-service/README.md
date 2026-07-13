# audit-service

Microservicio TCP de auditoría de GastroFlow SaaS. Registra eventos de seguridad y operaciones importantes en una base de datos completamente aislada.

## Responsabilidades

- Recibir eventos de auditoría desde `core-service`
- Registrar `AuditLog` (operaciones importantes)
- Registrar `SecurityEvent` (intentos de login, accesos denegados)
- Mantener su propia base `gastroflow_audit` aislada

## Puerto

```
TCP: 3002
```

## Patrones TCP

| Patrón | Descripción |
|--------|-------------|
| `{ cmd: 'health.audit' }` | Estado de salud del servicio |

## Variables de Entorno

```env
PORT=3002
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
```

## Base de Datos

- `gastroflow_audit` — Base de auditoría exclusiva de este servicio

## Comandos

```bash
npm run start:dev   # Modo desarrollo
npm run build       # Compilación
npm run test        # Pruebas unitarias
npm run test:e2e    # Pruebas e2e
npm run lint        # Linter
```

## Comunicación

```
core-service → TCP → audit-service → SQL → gastroflow_audit
```

Este servicio no contiene lógica de productos, pedidos, mesas ni pagos. Solo auditoría.
