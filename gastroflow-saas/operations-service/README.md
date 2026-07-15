# Operations Service

Microservicio NestJS TCP en `127.0.0.1:3002`. En Fase 1 responde al patrón `{ cmd: 'operations.health' }` con nombre `operations-service`, estado, transporte y timestamp ISO-8601.

Variables de arranque: `OPERATIONS_SERVICE_HOST` y `OPERATIONS_SERVICE_PORT`. Host y puerto se validan y el proceso activa apagado ordenado. No expone HTTP ni selecciona todavía bases por sucursal.

```bash
npm install
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

El módulo Prisma operacional y su variable de conexión permanecen como legado provisional, pero no se importan en `AppModule` ni se conectan durante health. Fase 2 los reemplazará por el schema operacional por sucursal.
