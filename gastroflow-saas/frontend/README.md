# Frontend

Cliente técnico de GastroFlow creado con React, TypeScript y Vite. En Fase 1 muestra el estado real de API Gateway, Core Service y Operations Service; todavía no es el panel administrativo completo.

## Puerto y API

- Desarrollo: `http://localhost:5173`
- Consulta actual: `GET /api/v1/health`, resuelta contra la base configurada en `VITE_API_BASE_URL`.

## Variables de entorno

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Copiar `.env.example` a `.env` para desarrollo local. Vite expone al navegador las variables con prefijo `VITE_`, por lo que no deben contener secretos.

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Este proyecto no tiene una suite automatizada configurada todavía; `lint` y `build` son las verificaciones actuales.

## Estado actual

Existe una pantalla técnica en español con actualización manual, hora y errores entendibles. El cliente Axios centralizado usa timeout de 5000 ms y sólo se comunica con API Gateway. No hay autenticación, RBAC ni módulos de inventario, pedidos o pagos.
