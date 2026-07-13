# Frontend

Cliente temporal de GastroFlow creado con React, TypeScript y Vite. En esta fase muestra el estado del Gateway, Core y Audit; todavía no es el panel administrativo completo.

## Puerto y API

- Desarrollo: `http://localhost:5173`
- Consulta actual: `GET /health`, resuelta contra la base configurada en `VITE_API_URL`.

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000/api/v1
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

Existe una pantalla temporal en español y un cliente Axios centralizado con timeout de 5000 ms. No hay autenticación, RBAC ni módulos de inventario, pedidos o pagos.
