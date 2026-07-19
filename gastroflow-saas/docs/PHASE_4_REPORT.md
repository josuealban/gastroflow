# Informe de Fase 4

## 1. Objetivo, rama y estado inicial

La administración y el aprovisionamiento persistente de sucursales se recuperaron en `codex/fase-4-sucursales`. Al iniciar la tarea de cierre, el trabajo estaba limpio y publicado en `2e2567af`; se auditó y completó sin avanzar a Fase 5.

## 2. Persistencia central

La migración `20260718100000_add_branch_provisioning_jobs` añade `BranchProvisioningJob` y `ProvisioningJobStatus`. El trabajo registra sucursal, plantilla, solicitante, clave idempotente, hash SHA-256, intentos, fechas y errores sanitizados. La clave es única por restaurante. La creación usa una transacción `Serializable`, cuenta `PROVISIONING`, `ACTIVE` e `INACTIVE` dentro de ella y reintenta conflictos Prisma `P2034` de forma limitada.

## 3. API y autorización

Gateway expone listado, detalle, creación `202`, edición, estado, progreso, reintento y personal asignable. `PermissionsGuard` exige `branches.read`, `branches.create`, `branches.update`, `branches.deactivate` o `branches.retry-provisioning`. OWNER recibe todos; MANAGER solo lectura y edición. El DTO rechaza campos de infraestructura y valida longitudes, coordenadas, UUID y código alfanumérico con guiones. La clave `Idempotency-Key` es un UUID obligatorio; misma clave y cuerpo reutiliza la sucursal, mientras un cuerpo diferente devuelve 409.

## 4. Credenciales y procesador

Core genera nombres PostgreSQL seguros de hasta 63 caracteres y una contraseña de alta entropía mediante `crypto.randomBytes`. La contraseña se cifra con AES-256-GCM; host y puerto provienen de configuración. El procesador reclama trabajos mediante `updateMany`, incrementa intentos, recupera trabajos abandonados, aplica timeout y termina en `ACTIVE/COMPLETED`, `PENDING` o `FAILED`. Los errores persistidos y las respuestas no contienen credenciales.

## 5. Operations y PostgreSQL

El patrón `{ cmd: 'branch.provision' }` valida token, UUID de sucursal, host, puerto e identificadores SQL con `^[a-z][a-z0-9_]{1,62}$`. El rol y la base se crean idempotentemente y se ejecuta `prisma migrate deploy`. No se usa `migrate dev`, no se acepta infraestructura desde el frontend y `POSTGRES_ADMIN_URL` no se devuelve.

## 6. Plantilla y verificación

La copia transaccional crea categorías con IDs nuevos, remapea productos con IDs nuevos y `isAvailable=false`, y crea inventario con stock, costo, dañados y perdidos en cero. Copia la configuración tributaria activa o usa el valor predeterminado, y siempre crea `InvoiceSequence.currentNumber=0`. Antes de responder éxito se comprueban impuesto activo, secuencia cero, productos no disponibles, inventario cero y ausencia de clientes, reservaciones, mesas, pedidos, pagos, facturas, proveedores, compras y movimientos. No se copian ventas, historial, PDFs ni datos transaccionales.

## 7. Propietario, personal y estados

El solicitante activo del restaurante queda asignado automáticamente con sus roles. `initialStaff` valida usuarios y roles activos del mismo restaurante, duplicados y `maxUsersPerBranch`; no crea usuarios ni copia el personal de la plantilla. Las transiciones administrativas permitidas son `ACTIVE → INACTIVE` e `INACTIVE → ACTIVE`; no se desactiva la principal ni la única activa. Retry solo acepta `FAILED`, reutiliza sucursal y credenciales y vuelve a `PROVISIONING`. `{ cmd: 'branch.connection.invalidate' }` es idempotente y se solicita después de cambios de estado.

## 8. Frontend y Postman

La sección Sucursales muestra identificación, ciudad, principal, estado, fecha y acciones por permiso. El formulario contiene nombre, código, descripción, dirección, ciudad, teléfono, coordenadas, plantilla y personal inicial con rol. Usa `crypto.randomUUID()`, conserva la clave ante fallo incierto y consulta cada cuatro segundos hasta un máximo de 30 ciclos. Incluye abrir, editar, activar, desactivar y reintentar. La colección y el ambiente Postman contienen los recorridos y variables de Fase 4.

## 9. Pruebas, lint, builds y seguridad

La verificación aislada incluye schemas Prisma, lint, pruebas unitarias de los tres servicios, E2E Gateway, pruebas específicas de sucursales e identificadores de aprovisionamiento, cuatro builds, búsqueda de secretos y `git diff --check`. Los resultados finales exactos se registran en el commit de cierre y en el informe entregado al finalizar esta tarea.

## 10. Integración, health y limitaciones

La integración PostgreSQL real y el recorrido health/manual están **NO EJECUTADOS** porque Docker no está disponible y las credenciales PostgreSQL/demo locales no están configuradas de forma válida. El intento del 17 de julio de 2026 terminó por ese preflight, sin crear ni borrar bases. Por ello no se afirma evidencia física de creación de rol/base, migración, aislamiento ni compensación. El código de esos flujos queda implementado y validado por compilación/pruebas aisladas, pero no asciende a evidencia de infraestructura real. Antes de Fase 5 debe ejecutarse `phase4:verify:integration` en un entorno desechable y limpiar exclusivamente recursos `gf_test_*`.

## 11. Riesgos y seguridad

El principal riesgo pendiente es probar compensación de DDL PostgreSQL ante fallos intermedios, dado que `CREATE DATABASE` no participa en una transacción ordinaria. No se añadieron `.env`, tokens, contraseñas, URLs administrativas, builds, cobertura, logs ni bases. Gateway continúa sin Prisma, el schema operacional compartido no fue modificado y ninguna credencial llega al frontend.

## 12. Cierre de verificación — 18 de julio de 2026

Se ejecutaron desde `gastroflow-saas`:

- `npm run phase4:runner:test`: 16/16 pruebas aprobadas, incluyendo Windows con `node` + `npm-cli.js`, Linux, errores de spawn/señal/status, polling terminal/máximo y política de `Idempotency-Key`.
- `npm run phase4:verify`: aprobado con schemas Control y operacional válidos, lint sin errores, 16 pruebas Gateway, 38 Core y 29 Operations (83 unitarias backend), 20 E2E Gateway, 11 específicas Core y 9 específicas Operations. Los cuatro builds aprobaron y el control de secretos y `git diff --check` finalizaron correctamente. Frontend conserva una advertencia no bloqueante preexistente de Fast Refresh en `AuthContext.tsx`.
- `npm run phase4:verify:integration`: **NO EJECUTADO**; el preflight terminó con `spawnSync docker ENOENT` porque Docker Desktop no está instalado o no está disponible en `PATH`.
- La búsqueda de marcadores de corrupción solicitada solo encontró los conectores de árbol intencionales de `docs/SAAS_MODEL.md`. El mojibake real detectado en documentación y frontend fue corregido.

La prueba aislada de Operations ejecutó dos veces el aprovisionamiento sobre el mismo estado persistente simulado. Confirmó que retry reutiliza el destino y no duplica categoría, producto, inventario, configuración tributaria ni secuencia; además confirmó IDs distintos a la plantilla, `categoryId` remapeado, conteos esperados, productos deshabilitados, inventario cero y Outbox/transacciones vacíos.

No se crearon realmente rol ni base PostgreSQL en este cierre; tampoco se ejecutaron físicamente `migrate deploy`, copia de maestros, aislamiento, retry real, limpieza de `gf_test_*`, health ni recorrido manual. Esos puntos permanecen **NO VERIFICADOS** hasta ejecutar la suite con Docker Desktop iniciado y variables válidas. No se declara aprobada ninguna de esas evidencias.

## 13. Limpieza final e idempotencia HTTP

Se eliminó del repositorio `Fase4_b949488.patch` mediante `git rm` y también se retiró el parche accidental no rastreado `Fase4_correcciones_actuales.patch`. `git ls-files "*.patch"` no devuelve archivos.

Frontend conserva la misma clave idempotente ante error sin respuesta, timeout, HTTP 408, 425 y cualquier 5xx. La descarta ante respuestas HTTP deterministas —incluidos 400 y 409—, creación confirmada o cancelación explícita. Las pruebas automatizadas confirman red sin respuesta, 408, 425, 500, 502, 503, 504, 400, 409, éxito y cancelación. La integración PostgreSQL continúa **NO EJECUTADA** porque Docker no está disponible.
