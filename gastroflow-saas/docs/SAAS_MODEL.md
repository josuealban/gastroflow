# Modelo SaaS

## Jerarquía

```text
Plataforma GastroFlow
└── Restaurante (tenant comercial)
    ├── Sucursal principal
    ├── Sucursal norte
    └── Otras sucursales
```

Un restaurante mantiene identidad, suscripción y usuarios en la base central. Cada sucursal mantiene su operación en una base propia. Separar físicamente las operaciones evita depender de un filtro `branchId` en cada consulta, pero exige resolver conexiones, proteger credenciales, aplicar el mismo schema y operar migraciones de forma coordinada.

## Planes y suscripciones

El plan determinará límites como número de sucursales, usuarios y capacidades. La creación de una sucursal deberá validar la suscripción antes de provisionar recursos. Los límites exactos se definirán al diseñar el schema central en Fase 2.

## Ciclo de una sucursal

Los estados mínimos previstos son `PROVISIONING`, `ACTIVE` y `FAILED`. Una sucursal no será operable hasta que su base exista, tenga migraciones aplicadas, datos iniciales válidos, conexión verificada y propietario asignado.

## Aislamiento

- Central: las relaciones `Restaurant` y `Branch` delimitan propiedad y acceso.
- Operacional: una conexión seleccionada apunta a la base de una única sucursal.
- Aplicación: Core comprueba pertenencia antes de aceptar la selección.
- Secretos: las credenciales se generan y almacenan en backend; nunca vienen del frontend.

## Plantillas

Una sucursal existente puede servir como fuente de catálogos. La plantilla no se clona: se crea una base vacía con el schema vigente, se copian sólo datos maestros y se inicializan contadores y existencias en cero.

## Estado de implementación

`DOCUMENTED`. El árbol actual contiene un enfoque diferente de tenancy lógica mediante `restaurantId`; no debe considerarse implementación de este modelo.
