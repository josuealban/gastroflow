# Audit Service

Microservicio TCP reservado para la auditoría de GastroFlow. En la fase inicial únicamente ofrece una señal de salud; el almacenamiento de eventos corresponde a una fase posterior.

## Puerto y patrón actual

- TCP: `127.0.0.1:3002`
- `{ cmd: 'health.audit' }`: responde `{ "status": "ok", "service": "audit-service" }`.

## Variables de entorno

```env
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
AUDIT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastroflow_audit?schema=public
```

Copiar `.env.example` a `.env` para desarrollo local. Los ejemplos no deben contener secretos.

## Comandos

```bash
npm install
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

Las pruebas actuales validan la respuesta del patrón de salud sin requerir otros servicios.

## Persistencia de Fase 2

El schema `prisma/schema.prisma` genera un cliente exclusivo para `gastroflow_audit`. `PrismaModule` conecta y desconecta con el ciclo de vida Nest. Los modelos son `AuditLog`, `SecurityEvent` e `IntegrationError`.

Comandos disponibles: `prisma:format`, `prisma:validate`, `prisma:generate`, `prisma:deploy` y `prisma:seed`.

## Estado actual

Prisma está configurado y el servicio mantiene su contrato de salud TCP. Los handlers completos para registrar eventos todavía no están implementados.
