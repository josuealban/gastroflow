# Informe de Fase 1

Fecha de verificación: 2026-07-15.

## 1. Objetivo

Estabilizar los cuatro proyectos independientes, su configuración y la comunicación HTTP/TCP, sin implementar persistencia definitiva ni funcionalidad de negocio.

## 2. Estado inicial

La rama `refactor/arquitectura-definitiva` estaba limpia y sincronizada con `origin/refactor/arquitectura-definitiva`. Node.js era `v24.14.1` y npm `11.11.0`. Los cuatro proyectos y health checks básicos existían.

## 3. Problemas encontrados

- El frontend todavía esperaba `audit` y usaba `VITE_API_URL`.
- Operations fallaba como degradado con HTTP 200 en lugar de 503 integral.
- El timeout TCP estaba fijo en 2000 ms.
- Los tokens de clientes eran strings repetidos.
- Faltaban versionamiento URI real, `ValidationPipe`, apagado ordenado y validación de host/CORS/timeout.
- Core y Operations importaban Prisma provisional en `AppModule`, lo que podía exigir PostgreSQL sólo para health.
- Los builds de Core/Operations incluían Prisma externo a `src`, desplazando `main.js` y rompiendo `start:prod`.
- Faltaban `.gitattributes` y `.editorconfig`.
- Los scripts raíz incluían la arquitectura provisional de tres bases globales.

## 4. Archivos creados

- `.gitattributes`, `.editorconfig`.
- Gateway: `configuration.ts`, `configuration.spec.ts`, `configure-http-app.ts`, `injection-tokens.ts`, `service-contracts.ts`.
- Core y Operations: `configuration.ts` y `configuration.spec.ts`.
- `docs/PHASE_1_REPORT.md`.

## 5. Archivos modificados

`package.json` y lockfiles; configuración y health de los tres proyectos; pruebas unitarias/E2E; `.env.example`; `tsconfig.build.json`; pantalla y cliente HTTP del frontend; README y documentación académica solicitada.

Los antiguos `parse-port.ts` se sustituyeron por validadores de configuración completos.

## 6. Referencias de audit-service eliminadas

Se retiraron las referencias funcionales del frontend. No existen variables, scripts, paquetes ni patrones TCP activos con ese nombre. Sólo permanece una mención histórica explícita en `PHASE_0_REPORT.md`.

## 7. Configuración de puertos

| Proyecto | Transporte | Variable | Valor local |
| --- | --- | --- | ---: |
| API Gateway | HTTP | `PORT` | 3000 |
| Core | TCP | `CORE_SERVICE_PORT` | 3001 |
| Operations | TCP | `OPERATIONS_SERVICE_PORT` | 3002 |
| Frontend | HTTP | Vite | 5173 |

Puertos inválidos producen un error claro antes de iniciar.

## 8. Variables de entorno

Gateway incorpora `CORS_ORIGIN`, hosts/puertos TCP y `MICROSERVICE_TIMEOUT_MS=3000`. Frontend usa `VITE_API_BASE_URL`. Las URLs Prisma provisionales se conservaron sólo en los servicios que aún contienen ese legado; no se añadieron secretos reales.

## 9. Patrones TCP

- Core: `{ cmd: 'core.health' }`.
- Operations: `{ cmd: 'operations.health' }`.

Cada respuesta incluye `service`, `status: 'ok'`, `transport: 'tcp'` y timestamp ISO-8601. El Gateway valida esa estructura.

## 10. Endpoints HTTP

`GET /api/v1/health` es el único endpoint público funcional de Fase 1. Las rutas sin versión devuelven 404. API Gateway no contiene endpoints de negocio.

## 11. Ejemplo de request

```http
GET /api/v1/health HTTP/1.1
Host: localhost:3000
Accept: application/json
```

## 12. Ejemplo de response

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "status": "ok",
  "services": {
    "apiGateway": { "status": "ok" },
    "coreService": { "status": "ok" },
    "operationsService": { "status": "ok" }
  },
  "timestamp": "ISO-8601"
}
```

## 13. Resultado de CORS

PASS. E2E confirmó `Access-Control-Allow-Origin: http://localhost:5173` y HTTP 204 en preflight. Los orígenes son configurables y validados como HTTP(S) sin ruta ni credenciales.

## 14. Resultado del timeout

PASS. `MICROSERVICE_TIMEOUT_MS` se valida entre 1 y 60000 ms. La prueba unitaria fuerza un observable sin respuesta y confirma HTTP 503 controlado.

## 15. Resultado de lint

| Proyecto | Resultado |
| --- | --- |
| API Gateway | PASS, sin advertencias |
| Core Service | PASS |
| Operations Service | PASS |
| Frontend | PASS |
| Script raíz `npm run lint` | PASS |

## 16. Resultado de tests

| Proyecto | Suites | Pruebas | Resultado |
| --- | ---: | ---: | --- |
| API Gateway | 2 | 15 | PASS |
| Core Service | 5 | 14 | PASS |
| Operations Service | 4 | 12 | PASS |
| Total raíz | 11 | 41 | PASS |

El frontend no incorpora suite compleja en Fase 1.

## 17. Resultado E2E

| Proyecto | Pruebas | Resultado |
| --- | ---: | --- |
| API Gateway | 4 | PASS |
| Core Service | 1 | PASS |
| Operations Service | 1 | PASS |

Las pruebas E2E usan dobles controlados y no requieren PostgreSQL.

## 18. Resultado de build

API Gateway, Core, Operations y frontend: PASS individualmente y mediante `npm run build`. Vite 8.1.4 transformó 70 módulos. Core y Operations vuelven a generar `dist/main.js` compatible con `start:prod`.

## 19. Resultado de prueba manual

PASS.

1. Se iniciaron Core, Operations, Gateway y frontend.
2. `GET http://localhost:3000/api/v1/health` devolvió HTTP 200 con los tres estados `ok`.
3. `http://localhost:5173` renderizó GastroFlow, el texto académico y los tres servicios disponibles.
4. El botón `Actualizar estado` renovó la hora y conservó datos reales.
5. Al detener Operations, el health devolvió HTTP 503 `degraded` y el frontend mostró Operations no disponible con un mensaje entendible.
6. Los procesos restantes se cerraron y los logs temporales se eliminaron. Ningún puerto 3000, 3001, 3002 o 5173 quedó escuchando.

Comandos utilizados: builds con npm, ejecución temporal de `node dist/main.js` para los servicios, Vite en 5173, solicitudes HTTP a `/api/v1/health` y validación visual local.

## 20. Problemas pendientes

- No existen endpoints funcionales aparte de health.
- No hay autenticación ni autorización.
- La persistencia provisional no corresponde a la arquitectura definitiva.
- Docker no fue necesario ni validado en esta fase.

## 21. Limitaciones

HTTP local no sustituye HTTPS de producción. Los E2E de Core y Operations validan el contrato del controlador sin abrir sockets reales; la prueba manual sí validó TCP entre procesos. No se guardaron capturas académicas, por lo que ningún requisito se marca `EVIDENCED`.

## 22. Código Prisma provisional detectado

Core conserva schemas/clientes de personal y clientes; Operations conserva un schema/cliente operacional global. Sus módulos continúan disponibles, pero no se importan desde los `AppModule` de health. No se validaron, generaron, migraron ni ejecutaron seeds.

## 23. Tareas para Fase 2

- Diseñar `gastroflow_control` con sucursales y acceso.
- Diseñar un schema operacional único sin `branchId` global.
- Sustituir de forma revisada schemas, clientes, migraciones y seeds provisionales.
- Diseñar resolución segura de conexión por sucursal.
- Probar aislamiento con dos bases físicas.

## 24. Confirmación JWT

No se implementó JWT, Passport, refresh tokens ni RBAC funcional.

## 25. Confirmación de migraciones

No se creó ni ejecutó ninguna migración, seed, `db push` o script de aislamiento.

## 26. Confirmación de commit

No se realizó commit.

## 27. Confirmación de push

No se realizó push.
