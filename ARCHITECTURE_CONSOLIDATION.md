# Consolidación arquitectónica

## Alcance y criterio

Esta consolidación cubre `User`, `Product`, `Buy`, `Payment`, `Question` y `Notification`. Se compartieron únicamente mecanismos con contratos equivalentes. No se modificaron endpoints, rutas, middleware, respuestas, status HTTP, consultas, filtros ni validaciones.

Los archivos locales que ya formaban parte de la arquitectura pública de cada módulo se mantienen como fachadas. Esto conserva todos los paths de importación existentes.

## Duplicaciones encontradas

| Duplicación | Módulos | Resultado |
| --- | --- | --- |
| Delegación de métodos Mongoose (`find`, `aggregate`, `update`, etc.) | Los seis módulos | Extraída a `BaseMongoRepository` |
| Conversión `mongoose.Types.ObjectId` | Product, Buy, Payment | Extraída a `MongoObjectId` compartido |
| Gateway legacy de archivos | Buy, Payment | Extraído a un gateway compartido |
| Gateway legacy de reputación con `info`/`infoBuyer` | Buy, Payment | Extraído a un gateway compartido |
| Copia defensiva legacy de `req.body` | Los seis módulos | Extraída a `LegacyRequestDto` |
| Cálculo legacy de páginas y offset | Product | Movido a Shared y conservado mediante fachada local |

El gateway de reputación de Product no se consolidó: su contrato es `calculate(id)`, distinto del contrato `info(id)`/`infoBuyer(id)` de Buy y Payment.

## Componentes compartidos creados

- `src/shared/infrastructure/mongoose/BaseMongoRepository.js`: crea adaptadores con una lista explícita de operaciones. La opción `callableCreate` preserva el uso legacy de `Model(data)` en `MessageRepository`; los demás repositorios conservan `new Model(data)`.
- `src/shared/infrastructure/mongoose/MongoObjectId.js`: conserva la llamada exacta `Types.ObjectId(value)`.
- `src/shared/infrastructure/gateways/LegacyFileGateway.js`: único adaptador de `fileCtrl.uploadImage`.
- `src/shared/infrastructure/gateways/LegacyReputationGateway.js`: único adaptador de `record.info` y `record.infoBuyer`.
- `src/shared/presentation/dto/LegacyRequestDto.js`: conserva `Object.assign({}, body)`.
- `src/shared/pagination/LegacyPagination.js`: conserva literalmente las fórmulas legacy de páginas y offset.

## Repositorios consolidados

Usan `BaseMongoRepository`: `UserRepository`, `UserTempRepository`, `CodeRepository`, `IncrementRepository`, `MarketplaceRepository`, `ProductRepository`, `ProductIncrementRepository`, `BuyRepository`, `BuyIncrementRepository`, `MessageRepository`, `PaymentRepository`, `QuestionRepository` y `NotificationRepository`.

Cada repositorio sigue exponiendo exactamente las mismas claves y delegando los mismos argumentos al mismo modelo. Los repositorios de relaciones no se fusionaron porque sus modelos y operaciones permitidas difieren por módulo.

## Imports simplificados y compatibilidad

Los DTOs, gateways, adaptadores ObjectId y Pagination locales ahora son fachadas de Shared. Sus rutas anteriores siguen siendo válidas, por lo que no fue necesario modificar controllers ni casos de uso.

Las fachadas legacy `src/<module>/<module>Ctrl.js` y `src/<module>/<module>Router.js` no fueron modificadas y continúan exportando sus controllers y routers modulares.

## Constantes

Se detectó repetición de valores primitivos como `STATUS_ACTIVE: 1`, pero no equivalencia de conceptos. Un estado de Product, Buy, Payment, Question o Notification pertenece a un ciclo de vida diferente. Centralizar esos valores produciría acoplamiento entre bounded contexts; por seguridad se mantienen sus constantes locales.

No se encontró un conjunto de constantes técnicas idéntico y reutilizable que pudiera centralizarse sin mezclar semántica de dominio.

## DTOs reutilizables

Los seis DTOs existentes implementaban el mismo contrato: crear una copia superficial de `req.body` y conservar todas sus propiedades. Ahora delegan en `LegacyRequestDto`. No se introdujeron DTOs tipados o restrictivos porque eso alteraría los contratos HTTP legacy.

## Paginación

Solo Product tenía una utilidad explícita de paginación. Se ubicó su implementación en Shared para que futuras capacidades reutilicen el mismo contrato y se mantuvo `modules/product/shared/pagination/LegacyPagination.js` como fachada. No se cambiaron el `parseInt`, la fórmula ni sus resultados límite.

## Código muerto detectado (no eliminado)

El análisis estático no encontró consumidores productivos para:

- Puertos documentales: `ProductGateway` y `UserGateway` de Buy; `AccountGateway` y `BankGateway` de Payment; `ProductNumberRepository` y `ProductReadRepository` de Product; `NotificationGateway` y `UserGateway` de Question.
- Mappers: `BuyMapper`, `MessageMapper`, la fachada `buy/PaymentMapper`, `NotificationMapper`, `ProductMapper`, `QuestionMapper`, `CodeMapper`, `IncrementMapper`, `UserMapper` y `UserTempMapper`. `PaymentMapper` solo es referenciado por la fachada del mapper de Buy.
- Las entidades de dominio son consumidas principalmente por esos mappers; varias no participan todavía en los casos de uso runtime.
- `modules/notification/infrastructure/gateways/index.js` exporta un objeto vacío por diseño, dado que Notification no consume integraciones externas.

Estos archivos se conservan porque eliminarlos excedería el alcance y podría romper consumidores no detectables estáticamente.

## Reducción de código

Se reemplazaron implementaciones repetidas en 13 repositorios, 6 DTOs, 4 fachadas de gateways, 3 adaptadores ObjectId y 1 utilidad de paginación. La reducción se concentra en módulos; Shared añade una sola implementación por contrato y mantiene adaptadores locales de una línea para compatibilidad.

## Módulos afectados

- User: repositorios y DTO.
- Product: repositorios, DTO, ObjectId y paginación.
- Buy: repositorios, DTO, ObjectId, archivos y reputación.
- Payment: repositorio, DTO, ObjectId, archivos y reputación.
- Question: repositorio y DTO.
- Notification: repositorio y DTO.

## Validaciones ejecutadas

- Sintaxis de todos los `.js` de `src/modules` y `src/shared`: correcta.
- Contratos de los 12 repositorios directos: mismas claves exportadas y mismo orden contractual.
- Identidad de las 6 fachadas DTO con el contrato compartido: validada.
- Identidad de las 3 fachadas ObjectId: validada.
- Identidad de gateways compartidos de Buy/Payment: validada.
- Identidad de la fachada Pagination: validada.
- Imports prohibidos en Presentation: 0.
- Imports directos de Mongoose/schemas en casos de uso: 0.
- Las 12 fachadas legacy de controller/router permanecen sin cambios y apuntan a las mismas rutas modulares.
- La carga completa sin configuración externa queda limitada por el comportamiento preexistente de Twilio en User (`username is required`). Los módulos y contratos modificados sí fueron cargados individualmente; no se añadieron nuevas dependencias ambientales.

Las advertencias de dependencias circulares emitidas por Mongoose/Cloudinary durante la carga son preexistentes y no representan fallos de sintaxis o de esta consolidación.

## Confirmación de compatibilidad

No se cambió lógica de casos de uso ni presentación. BaseMongoRepository delega argumentos sin transformarlos; los gateways invocan los mismos controllers legacy; ObjectId, DTO y Pagination conservan literalmente sus implementaciones. Los imports locales anteriores continúan funcionando mediante fachadas, y la persistencia permanece encapsulada.
