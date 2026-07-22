# Refactorización incremental del módulo User

La migración mantiene las 34 rutas, los 35 handlers exportados, consultas, efectos externos, códigos HTTP y cuerpos JSON existentes. Los archivos `src/user/userCtrl.js` y `src/user/userRouter.js` son fachadas de compatibilidad para consumidores actuales.

## Commit lógico 1 — Estructura y compatibilidad

**Resumen:** se crea `src/modules/user` y se convierten controller y router legacy en fachadas.

**Archivos:** `src/user/userCtrl.js`, `src/user/userRouter.js`, `src/modules/user/presentation/**`.

**Motivación:** permitir migración incremental sin modificar `src/router.js`, endpoints ni imports existentes.

**Riesgos:** resolución incorrecta de rutas relativas o pérdida de algún export.

**Validación:** comparar las 34 declaraciones de rutas y 35 nombres de handlers antes/después; cargar ambas fachadas y comprobar identidad del controller.

## Commit lógico 2 — Repositorios

**Resumen:** las operaciones Mongoose se encapsulan en repositorios de User, UserTemp, Code, Increment y modelos externos usados por reportes.

**Archivos:** `src/modules/user/application/repositories/**` y los servicios de capacidad en `src/modules/user/application/services/**`.

**Motivación:** impedir que presentación y servicios dependan de modelos Mongoose y conservar exactamente las consultas legacy mediante adaptadores equivalentes.

**Riesgos:** romper el chaining de queries (`sort`, `skip`, `limit`) o las opciones legacy de Mongoose.

**Validación:** búsqueda estática de imports/model queries en presentación y servicios; pruebas de caracterización con MongoDB sobre cada endpoint.

## Commit lógico 3 — Servicios de aplicación

**Resumen:** los casos de uso se agrupan en Registration, Authentication, PasswordRecovery, Profile, Referral y Reporting.

**Archivos:** `src/modules/user/application/services/**`.

**Motivación:** ofrecer límites de responsabilidad claros y distribuir cada handler directamente en el servicio de su capacidad de negocio.

**Riesgos:** asignar un handler al servicio incorrecto o perder su contexto.

**Validación:** cargar los seis servicios, comprobar que todos los métodos son funciones y ejecutar pruebas HTTP de caracterización.

## Commit lógico 4 — DTOs, dominio, mappers y constantes

**Resumen:** se desacopla la entrada de Express, se crean entidades/mappers y se nombran constantes repetidas sin alterar sus valores.

**Archivos:** `application/dtos/**`, `domain/entities/**`, `infrastructure/mongoose/mappers/**`, `infrastructure/validators/**`, `shared/constants/**`.

**Motivación:** preparar límites de Clean Architecture sin cambiar la forma de los documentos ni las respuestas actuales.

**Riesgos:** filtrar campos legacy de forma prematura cambiaría contratos; por eso el DTO conserva todas las propiedades en esta versión.

**Validación:** comparar requests/responses completos y documentos persistidos antes/después. Incorporar allowlists queda como trabajo `TODO(v2)` respaldado por pruebas.

## Commit lógico 5 — Controlador delgado

**Resumen:** el controller solo copia la entrada a DTO, selecciona el servicio y delega.

**Archivos:** `src/modules/user/presentation/controllers/user.controller.js`.

**Motivación:** eliminar reglas, consultas y dependencias de infraestructura de la capa HTTP.

**Riesgos:** diferencias en mutación de `req.body`; la copia conserva claves y valores pero evita entregar el objeto original de Express.

**Validación:** pruebas contractuales para status, JSON y efectos secundarios de los 34 endpoints.

## TODO(v2)

No se corrigieron comportamientos sospechosos existentes, incluidos códigos HTTP inconsistentes, límites de bloqueo y el cálculo del período `monthly`. Deben abordarse únicamente después de incorporar pruebas de caracterización y aprobar explícitamente el cambio funcional.
