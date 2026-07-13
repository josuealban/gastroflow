# Architecture

GastroFlow SaaS is structured using a Microservices Architecture on the backend and a Single Page Application (SPA) on the frontend.

## Diagram

```mermaid
graph TD
    Client[Frontend / React] -->|HTTP/REST| API_Gateway[API Gateway :3000]
    API_Gateway -->|TCP| Core_Service[Core Service :3001]
    Core_Service -->|TCP| Audit_Service[Audit Service :3002]

    Core_Service -->|SQL| ControlDB[(Control DB)]
    Core_Service -->|SQL| BranchDB[(Branch DB)]
    Audit_Service -->|SQL| AuditDB[(Audit DB)]
```

- **api-gateway**: Validates and routes HTTP requests.
- **core-service**: Contains the main business logic and manages multi-tenancy.
- **audit-service**: Receives events to store securely in its own database.
