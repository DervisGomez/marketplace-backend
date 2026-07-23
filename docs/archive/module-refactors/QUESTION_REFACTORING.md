# Question — Structural Modernization

## Resumen

El controller Question fue distribuido por capacidades sin cambiar sus ocho endpoints ni cuerpos funcionales. Presentation delega a Application; Question usa un repositorio propio y gateways para User y Notification.

## Capacidades identificadas

### Questions

- `new`: crear pregunta y notificación.
- `product`: listar preguntas de un producto.
- `user`: preguntas pendientes recibidas por el vendedor.
- `client`: preguntas realizadas por el usuario autenticado.
- `productClient`: historial público por producto/cliente/fecha.

### Answers

- `answer`: responder y cambiar estado/fecha de respuesta.

### Moderation

- `lock`: ocultar pregunta y registrar complaint en User.
- `delete`: ocultar pregunta mediante estado `0`.

### Reporting

No existe reporting en el controller actual. `ReportingUseCases.js` documenta la ausencia sin crear comportamiento.

## Repositorio

- `QuestionRepository`: encapsula creación, conteo, búsqueda y actualización del schema Question.

El repositorio conserva queries Mongoose para mantener exactamente `populate`, `skip`, `limit` y `sort`.

## Gateways

- `QuestionRelationsGateway.User`: actualización de complaints.
- `QuestionRelationsGateway.Notification`: creación de la notificación de nueva pregunta.

No se crearon gateways Product, Buy o Payment porque el controller no consulta directamente esos modelos; Product solo aparece como referencia/populate de Question.

## Fachadas legacy

- `src/question/questionCtrl.js` reexporta el controller modular.
- `src/question/questionRouter.js` reexporta las rutas modulares.
- `src/router.js` y todos los imports existentes permanecen compatibles.

## Estructura

La implementación vive en `src/modules/question` y contiene Presentation, Application, Domain, Infrastructure y Shared siguiendo el estándar de User, Product, Buy y Payment.

## Validaciones ejecutadas

- Ocho cuerpos de handlers comparados con la versión anterior.
- Ocho rutas, métodos, paths y middleware comparados.
- Conteos de respuestas HTTP, consultas, `populate` y agregaciones comparados.
- Contratos JSON preservados por equivalencia de cuerpos completos.
- Presentation y Application sin Mongoose, schemas o modelos.
- Repositorio y gateways como únicos adaptadores de persistencia/integraciones.
- Controller/router legacy verificados como fachadas con identidad de módulo.
- Sintaxis y carga completa verificadas.

## TODO(v2)

- Mantener sin corrección las variables globales accidentales y fórmulas de paginación legacy.
- Revisar autorización de objeto, estados y semántica de delete/lock únicamente con pruebas de caracterización.
- Convertir DTOs permisivos y políticas documentales en contratos ejecutables solo en una versión funcional posterior.
- Cualquier cambio al bloque de agregación comentado requiere una decisión funcional explícita.

## Compatibilidad

No se cambiaron endpoints, Auth, status HTTP, mensajes, validaciones Mongoose, filtros, queries, populate, orden, paginación ni formas JSON.
