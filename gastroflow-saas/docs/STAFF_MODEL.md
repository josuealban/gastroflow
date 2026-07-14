# Modelo de personal

## Fuente de verdad

El personal vive centralmente en `gastroflow_control`. Las bases operacionales no duplican usuarios ni empleados.

## Relaciones previstas

```text
Restaurant 1---N Branch
Restaurant 1---N User
User 1---0..1 EmployeeProfile
User N---M Branch          mediante UserBranch
UserBranch N---M Role      mediante UserBranchRole
Role N---M Permission      mediante RolePermission
```

Un empleado puede trabajar en varias sucursales y desempeñar roles distintos en cada una. `UserBranch` registra pertenencia, estado y fecha de asignación; `UserBranchRole` asigna los roles válidos dentro de esa membresía.

## Experiencia futura

La pantalla Personal de la sucursal activa mostrará foto opcional, nombre, correo, teléfono, cargo, rol, estado y fecha de asignación. `+ Asignar personal` permitirá seleccionar un empleado existente o crear el flujo correspondiente, siempre bajo permisos.

Al crear una sucursal se asignará al propietario. No se copiará todo el personal de la plantilla. Los demás empleados se seleccionarán explícitamente y recibirán relaciones nuevas.

## Seguridad futura

La pertenencia se comprobará antes de seleccionar sucursal. Roles y permisos no se aceptarán desde datos libres del frontend. JWT, Passport, Guards, `CurrentUser`, refresh tokens y bcrypt se implementarán y probarán en Fase 3.

## Estado

`DOCUMENTED`. El schema actual no tiene `Branch`, `UserBranch` ni `UserBranchRole` compatibles con esta decisión; el RBAC existente por `restaurantId` es legado pendiente de rediseño.
