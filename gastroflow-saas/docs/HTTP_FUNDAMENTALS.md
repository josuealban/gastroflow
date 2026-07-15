# Fundamentos HTTP aplicados en GastroFlow

## Qué es HTTP

HTTP es el protocolo de aplicación usado por un cliente para enviar una solicitud (`request`) a un servidor y recibir una respuesta (`response`). En Fase 1, el navegador o Postman actúan como clientes y API Gateway es el único servidor HTTP público.

Una solicitud contiene:

- método, por ejemplo `GET`;
- URL, por ejemplo `/api/v1/health`;
- headers, como `Accept: application/json`;
- body opcional. Un `GET` de health no necesita body.

Una respuesta contiene un código de estado, headers y, en este caso, un body JSON.

## Versiones del protocolo

- HTTP/1.1 define mensajes de texto, conexiones persistentes y el header `Host`.
- HTTP/2 incorpora multiplexación y compresión de headers.
- HTTP/3 transporta HTTP sobre QUIC/UDP.

GastroFlow se verifica localmente con HTTP. Fase 1 no afirma configurar HTTP/2 o HTTP/3 directamente en NestJS. Un proxy inverso o una plataforma administrada podrá terminar HTTPS y negociar versiones modernas en el despliegue futuro.

## HTTP frente a HTTPS

HTTPS es HTTP protegido con TLS: cifra el tráfico, autentica al servidor y ayuda a detectar alteraciones. `http://localhost` es aceptable para desarrollo local. Un despliegue real deberá exponer HTTPS; esta configuración pertenece a Fase 12.

## Métodos y JSON

Fase 1 implementa únicamente `GET /api/v1/health`. `POST`, `PUT`, `PATCH` y `DELETE` se usarán en recursos futuros, pero todavía no existen endpoints de negocio. JSON es la representación del body de respuesta y su header es `Content-Type: application/json`.

## Códigos relevantes

- `200 OK`: health integral saludable.
- `400 Bad Request`: solicitud futura rechazada por validación.
- `404 Not Found`: ruta inexistente o sin versión.
- `500 Internal Server Error`: fallo no controlado; no debe filtrar stack trace.
- `503 Service Unavailable`: uno o ambos microservicios requeridos no están disponibles.

## Ejemplo saludable

```http
GET /api/v1/health HTTP/1.1
Host: localhost:3000
Accept: application/json
```

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
  "timestamp": "2026-07-15T00:00:00.000Z"
}
```

## Ejemplo degradado

```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json; charset=utf-8

{
  "status": "degraded",
  "services": {
    "apiGateway": { "status": "ok" },
    "coreService": { "status": "ok" },
    "operationsService": { "status": "unavailable" }
  },
  "timestamp": "2026-07-15T00:00:00.000Z"
}
```

El Gateway transforma errores TCP y timeouts en una respuesta estable; no devuelve credenciales, URLs de base ni stack traces.
