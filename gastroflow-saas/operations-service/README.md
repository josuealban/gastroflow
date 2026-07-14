# Operations Service

Microservicio TCP en `127.0.0.1:3002`. Responde `{ cmd: 'health.operations' }` y administra exclusivamente `gastroflow_operaciones` mediante `operations-client`.

```env
OPERATIONS_SERVICE_HOST=127.0.0.1
OPERATIONS_SERVICE_PORT=3002
OPERATIONS_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastroflow_operaciones?schema=public
```

El schema prepara categorías, platos, mesas, pedidos, pagos, configuración tributaria académica, comprobantes internos, inventario, proveedores y compras. Todos los registros de negocio incluyen `restaurantId`.

`npm run verify:tenant-isolation` comprueba el aislamiento junto con las bases administradas por Core. Pagos funcionales, PDF e integración tributaria no están implementados.
