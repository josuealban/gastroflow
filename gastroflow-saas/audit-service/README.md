# Audit Service

Microservicio TCP reservado para la auditoría de GastroFlow. En la fase inicial únicamente ofrece una señal de salud; el almacenamiento de eventos corresponde a una fase posterior.

## Puerto y patrón actual

- TCP: `127.0.0.1:3002`
- `{ cmd: 'health.audit' }`: responde `{ "status": "ok", "service": "audit-service" }`.

## Variables de entorno

```env
AUDIT_SERVICE_HOST=127.0.0.1
AUDIT_SERVICE_PORT=3002
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

## Estado actual

El servicio carga variables con `@nestjs/config`, valida su puerto y escucha mediante TCP. Todavía no persiste registros, no usa Prisma y no implementa eventos de seguridad.
