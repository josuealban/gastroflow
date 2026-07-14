# Arquitectura Cliente-Servidor — GastroFlow SaaS

Este documento describe la base del modelo cliente-servidor aplicado en GastroFlow.

## Modelo Conceptual

El modelo cliente-servidor consiste en dos partes que se comunican mediante una red:

1. **Cliente**: El iniciador de la petición (request). Solicita recursos o servicios.
2. **Servidor**: El proveedor del servicio. Procesa la petición y devuelve una respuesta (response).

```
┌─────────┐                Request (HTTP)               ┌─────────┐
│ Cliente │ ──────────────────────────────────────────▶ │Servidor │
│ (React) │ ◀────────────────────────────────────────── │(Gateway)│
└─────────┘                Response (JSON)              └─────────┘
```

## Implementación en GastroFlow

### El Cliente (React)

- Corre en el navegador del usuario en el puerto `5173`.
- Inicia el flujo enviando peticiones usando el cliente Axios (`apiClient`).
- Ejemplos de peticiones:
  - `GET /api/v1/health` para consultar el estado del sistema.
- Es responsable de mostrar una interfaz amigable (UI) y manejar los mensajes de error sin exponer detalles internos al usuario.

### El Servidor HTTP (api-gateway)

- Corre en NestJS en el puerto `3000`.
- Es la única puerta de entrada HTTP expuesta para el cliente.
- Recibe peticiones HTTP y traduce las consultas actuales a mensajes TCP para los microservicios correspondientes.
- Devuelve las respuestas en formato **JSON** estructurado con códigos de estado HTTP semánticos (ej: `200 OK`, `503 Service Unavailable`).

En esta fase sólo está disponible el endpoint de salud. La autenticación, autorización y los módulos de negocio pertenecen a fases posteriores.
