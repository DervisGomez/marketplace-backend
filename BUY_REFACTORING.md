# Buy — Structural Modernization

La modernización distribuye el controller legacy en capacidades y encapsula persistencia/integraciones sin cambiar comportamiento observable.

## Capacidades identificadas

### Checkout

- `PurchaseUseCases`: `createIncrement`, `new`.
- `BalanceUseCases`: `availability`, `balance`, `available`, `queryPayment`.
- `WithdrawalUseCases`: retiros y procesamiento/listado administrativo de pagos.

### Orders

- `OrderQueryUseCases`: detalle, compras y ventas del usuario.
- `PublicOrderUseCases`: reputación pública por órdenes y búsqueda de ventas.
- `MessagingUseCases`: crear, responder y listar mensajes de una compra.

### Qualification

- `QualificationUseCases`: calificar comprador/vendedor y agregados de calificación.
- `ReputationUseCases`: read models de reputación propia.
- `PendingQualificationUseCases`: pendientes, bloqueos y listados sin calificar.

### Reporting

- `OperationReportingUseCases`: cantidad, ganancias y serie anual.
- `ReportUseCases`: reportes de operaciones y handler legacy `paymentYear`.

No se añadieron casos de uso: las 39 rutas y los 41 handlers proceden del controller original.

## Repositorios

- `BuyRepository`
- `PaymentRepository`
- `MessageRepository`
- `BuyIncrementRepository`
- `MongoObjectId`

Solo estos adaptadores importan los schemas Buy. Conservan el retorno de queries Mongoose para mantener exactamente `populate`, `sort`, `skip` y `limit`.

## Gateways

- `BuyRelationsGateway`: Product, User, Question, Account, Bank y Authorized.
- `LegacyReputationGateway`: encapsula `src/product/record.js`.
- `LegacyFileGateway`: encapsula `File.uploadImage`.

Notification no es consumido por el controller original; no se creó una dependencia inexistente.

## Fachadas legacy

- `src/buy/buyCtrl.js` reexporta el controller modular.
- `src/buy/buyRouter.js` reexporta las rutas modulares.
- `src/router.js` y consumidores actuales no requieren cambios.

## Compatibilidad validada

- 41 cuerpos de handlers comparados con la versión anterior.
- 39 rutas, métodos, paths y middleware comparados.
- Conteos de respuestas HTTP, `populate` y agregaciones comparados.
- Controller legacy y controller modular comparten identidad de módulo.
- Presentation y Application no importan Mongoose, schemas ni modelos.
- Sintaxis y carga completa verificadas con variables ficticias de formato válido.

## TODO(v2)

- Corregir únicamente en una fase funcional los bugs documentables del código legacy.
- Mover reputación a su contexto definitivo.
- Reemplazar DTOs permisivos por contratos explícitos solo después de pruebas de caracterización.
- Introducir políticas de dominio únicamente cuando puedan probarse contra el comportamiento vigente.

Esta fase conserva intencionalmente status HTTP, mensajes, consultas, filtros, mutaciones de request y respuestas heterogéneas existentes.
