# core-service

Microservicio TCP principal de GastroFlow SaaS. Contiene toda la lógica de negocio, gestiona la autenticación y administra la conexión dinámica a las bases de datos de cada sucursal.

## Responsabilidades

- Recibir mensajes TCP desde `api-gateway`
- Lógica de autenticación (JWT, bcrypt)
- Gestión de usuarios, roles y permisos (RBAC)
- Conexión dinámica a bases de datos por sucursal
- Gestión de productos, mesas, pedidos, pagos e inventario
- Envío de eventos a `audit-service` vía TCP

## Puerto

```
TCP: 3001
```

## Patrones TCP

| Patrón | Descripción |
|--------|-------------|
| `{ cmd: 'health.core' }` | Estado de salud del servicio |

## Variables de Entorno

```env
PORT=3001
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=3001
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
```

## Bases de Datos Gestionadas

- `gastroflow_control` — Base de control (empresas, sucursales, planes)
- `gastroflow_demo_centro` — Base operacional Sucursal Centro
- `gastroflow_demo_norte` — Base operacional Sucursal Norte

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
api-gateway → TCP → core-service → TCP → audit-service
core-service → SQL → gastroflow_control
core-service → SQL → gastroflow_{branch_name}
```
