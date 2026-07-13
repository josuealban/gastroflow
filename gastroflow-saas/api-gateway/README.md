# api-gateway

Puerta de enlace HTTP del sistema GastroFlow SaaS. Es el único punto de entrada HTTP para todos los clientes (frontend, Postman, integraciones externas).

## Responsabilidades

- Exponer la API REST en `http://localhost:3000/api/v1`
- Validar requests con DTOs y `ValidationPipe`
- Enrutar solicitudes a `core-service` vía TCP
- Convertir errores RPC a códigos HTTP apropiados
- Documentar la API con Swagger en `/api/docs`
- Gestionar CORS

## Puerto

```
HTTP: 3000
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/health` | Estado de salud del sistema |

## Variables de Entorno

```env
PORT=3000
CORE_SERVICE_HOST=127.0.0.1
CORE_SERVICE_PORT=3001
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
CORS_ORIGIN=*
```

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
Frontend/Postman → HTTP → api-gateway → TCP → core-service
                                      → TCP → audit-service (health only)
```

No se conecta directamente a ninguna base de datos PostgreSQL.
