# Estrategia de migraciones

## Objetivo

Mantener dos historiales conceptuales:

- schema central para `gastroflow_control`;
- schema operacional canónico, desplegado en cada base de sucursal.

La creación de una sucursal debe aplicar todas las migraciones operacionales antes de copiar catálogos. Las actualizaciones deberán descubrir sucursales activas, verificar versión, aplicar cambios con reintentos controlados y registrar resultados sin secretos.

## Seguridad operacional

- Respaldar y probar restauración antes de cambios incompatibles.
- Preferir migraciones compatibles hacia adelante.
- Evitar una activación de sucursal con schema incompleto.
- Definir qué ocurre si algunas bases migran y otras fallan.
- No usar `migrate dev` en ambientes compartidos.

## Estado de Parte 0

No se creó ni ejecutó ninguna migración. Las tres migraciones visibles para bases globales son artefactos previos y no deben aplicarse como arquitectura definitiva. Los comandos exactos se definirán en Fase 2, después de aprobar los schemas.
