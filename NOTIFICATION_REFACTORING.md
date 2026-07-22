# Notification — Structural Modernization

## Resumen

Notification fue distribuido en tres capacidades sin cambiar sus endpoints ni cuerpos funcionales. Presentation delega a Application y toda persistencia se ejecuta mediante `NotificationRepository`.

## Capacidades identificadas

### Notifications

- `list`: agrega conteo por estado y lista hasta 20 notificaciones del usuario con estado `1` o `2`.

### Read

- `view`: actualiza todas las notificaciones con estado `1` a estado `2`.

### Management

- `find`: actualiza por `_id` a estado `3`.

El controller no implementa creación, eliminación física, limpieza ni mantenimiento adicional; no se inventaron esos casos de uso.

## Repositorio

- `NotificationRepository`: encapsula `aggregate`, `find` y `update` del modelo Mongoose legacy.

Las queries conservan exactamente filtros, operadores, límite y retorno Mongoose.

## Gateways

No se crearon gateways externos. El controller legacy no consulta User, Product, Buy, Question o Payment. `infrastructure/gateways/index.js` documenta explícitamente esta frontera vacía.

La creación de notificaciones desde Question permanece encapsulada en el gateway del módulo Question y no forma parte de los endpoints Notification actuales.

## Fachadas legacy

- `src/notification/notificationCtrl.js` reexporta el controller modular.
- `src/notification/notificationRouter.js` reexporta las rutas modulares.
- `src/router.js` y todos los imports existentes siguen funcionando.

## Estructura creada

`src/modules/notification` contiene Presentation, Application, Domain, Infrastructure y Shared conforme al estándar aplicado en User, Product, Buy, Payment y Question.

## Validaciones ejecutadas

- Tres cuerpos de handlers comparados literalmente.
- Tres rutas, métodos, paths y middleware Auth comparados.
- Conteos de respuestas HTTP, consultas y agregaciones comparados.
- Contratos JSON preservados mediante equivalencia de cuerpos completos.
- Presentation/Application sin imports de Mongoose, schemas o modelos.
- Repository como único acceso a persistencia.
- Controller y router legacy verificados como fachadas con identidad de módulo.
- Sintaxis y carga completa verificadas.

## TODO(v2)

- Revisar el alcance global de los updates de `view` únicamente como cambio funcional versionado.
- Revisar el conteo global frente al listado por usuario solo con pruebas de caracterización.
- Reemplazar DTO permisivo, estados numéricos y política documental después de caracterizar contratos.
- Mantener sin corrección nombres legacy como `find` y el nombre de colección/modelo `nofication`.

## Compatibilidad

No se cambiaron endpoints, Auth, status HTTP, mensajes, filtros, queries, agregaciones, límite ni formas JSON.
