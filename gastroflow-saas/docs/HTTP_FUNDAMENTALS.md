# HTTP Fundamentals

The API Gateway is the only HTTP entry point of GastroFlow SaaS, exposing RESTful endpoints.

## Methods Used

- **GET**: To retrieve resources (e.g. `GET /api/v1/health`)
- **POST**: To create new resources (e.g. `POST /api/v1/orders`)
- **PUT**: To replace existing resources.
- **PATCH**: To partially update resources.
- **DELETE**: To remove resources.

## Status Codes

- `200 OK`: Successful operation.
- `201 Created`: Resource created.
- `400 Bad Request`: Validation errors (caught by `ValidationPipe`).
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: RBAC restriction.
- `404 Not Found`: Resource doesn't exist.
- `500 Internal Server Error`: Unhandled errors.
