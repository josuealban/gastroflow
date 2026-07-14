# Visión de titulación

## Título provisional

“Diseño e implementación de una plataforma SaaS basada en microservicios para la gestión operativa, inventario y facturación interna de restaurantes con múltiples sucursales”.

## Problema

Restaurantes con varias sucursales suelen fragmentar catálogos, personal, inventario, pedidos y comprobantes entre herramientas manuales o sistemas aislados. Esto dificulta controlar accesos, mantener información consistente y abrir nuevas ubicaciones sin copiar errores o datos históricos sensibles.

## Pregunta de investigación

¿Cómo puede una arquitectura SaaS basada en servicios y aislamiento operacional por sucursal mejorar la trazabilidad, el control y la capacidad de crecimiento de restaurantes con múltiples ubicaciones?

## Objetivo general

Diseñar, implementar y evaluar una plataforma SaaS que centralice identidad y administración, aísle la operación de cada sucursal y soporte inventario, pedidos y facturación interna mediante una arquitectura mantenible.

## Objetivos específicos

1. Modelar restaurantes, sucursales, personal y acceso en una base central.
2. Diseñar un schema operacional reutilizable con una base independiente por sucursal.
3. Implementar comunicación HTTP/TCP entre frontend, Gateway y servicios.
4. Desarrollar módulos de catálogo, inventario, clientes, pedidos y comprobantes internos.
5. Evaluar aislamiento, consistencia, usabilidad y rendimiento con pruebas reproducibles.

## Justificación

El proyecto integra arquitectura de software, bases de datos, seguridad, protocolos, pruebas y experiencia de usuario en un caso realista. La separación por sucursal permite estudiar aislamiento y provisionamiento, mientras que la base central permite analizar control de acceso y administración SaaS.

## Beneficiarios

- Propietarios y administradores de restaurantes.
- Personal operativo de sucursales.
- Clientes atendidos con procesos más consistentes.
- Estudiantes e investigadores que evalúen arquitecturas SaaS aplicadas.

## MVP académico

Entrega funcional para la asignatura: estructura de servicios, autenticación y RBAC, gestión básica de sucursales, personal, catálogo, inventario, clientes, mesas, pedidos y comprobantes internos, con pruebas y documentación. No equivale a un producto comercial ni a un sistema tributario autorizado.

## Evolución de titulación

Extiende el MVP con investigación formal, validación con usuarios, fortalecimiento de seguridad, backups y recuperación, observabilidad, rendimiento, accesibilidad, usabilidad, despliegue estable e investigación de integración tributaria futura.

## Alcance académico

- Aplicación de HTTP, REST, TCP y arquitectura de servicios.
- Persistencia PostgreSQL y ORM.
- Migraciones, transacciones, aislamiento y RBAC.
- Pruebas unitarias, E2E e integración.
- Evaluación con métricas y evidencia reproducible.

## Alcance futuro

Alta disponibilidad, despliegue multi-región, analítica avanzada, aplicación móvil, integraciones contables, firma electrónica y conexión con proveedores autorizados, sujetos a evaluación técnica y legal.

## Limitaciones

- Recursos de infraestructura y tiempo académico.
- Ausencia inicial de integración tributaria legal.
- Dependencia de conectividad para una plataforma web.
- Complejidad operacional al mantener muchas bases.
- Muestra de usuarios limitada durante validación temprana.

## Variables e indicadores preliminares

| Variable | Indicadores |
| --- | --- |
| Eficiencia operativa | tiempo de registro de pedido, tiempo de consulta, pasos por tarea |
| Integridad | inconsistencias detectadas, transacciones revertidas, duplicados |
| Aislamiento | intentos de acceso cruzado bloqueados, fugas detectadas |
| Usabilidad | SUS, tasa de éxito, errores por tarea, satisfacción |
| Rendimiento | latencia p50/p95, throughput, consumo de recursos |
| Mantenibilidad | cobertura, complejidad, tiempo de cambio, defectos por módulo |

## Metodología preliminar

Investigación aplicada con desarrollo iterativo. Se realizará revisión de literatura, levantamiento de requisitos, diseño arquitectónico, prototipado, implementación incremental, pruebas técnicas y evaluación mixta con métricas cuantitativas y retroalimentación cualitativa.

## Validación con usuarios

Se definirán tareas representativas para propietarios y personal: seleccionar sucursal, asignar empleado, crear platillo, registrar compra, tomar pedido y consultar comprobante. Se medirán éxito, tiempo, errores y percepción; se solicitará consentimiento y se evitará usar datos personales reales sin necesidad.

## Riesgos

- Fuga de datos por selección incorrecta de base.
- Pérdida de secretos o registro accidental de credenciales.
- Migraciones parciales entre sucursales.
- Alcance excesivo frente al calendario.
- Confusión entre comprobante académico y factura legal.
- Datos de prueba insuficientes para conclusiones válidas.

## Trabajo futuro

Automatizar respaldos y restauración, incorporar trazas y métricas, probar concurrencia, endurecer secretos y red, ampliar la muestra de usuarios, estudiar costos operativos y evaluar requisitos regulatorios antes de cualquier integración con SRI.
