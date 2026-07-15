# Core Service

Microservicio NestJS TCP en `127.0.0.1:3001`. En Fase 1 responde al patrón `{ cmd: 'core.health' }` con nombre de servicio, estado, transporte y timestamp ISO-8601.

Variables de arranque: `CORE_SERVICE_HOST` y `CORE_SERVICE_PORT`. Host y puerto se validan y el proceso activa apagado ordenado. No expone HTTP.

```bash
npm install
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

Los módulos Prisma de personal/clientes y sus variables permanecen como legado provisional, pero no se importan en `AppModule` ni se conectan durante health. Serán reemplazados por `gastroflow_control` en Fase 2.
