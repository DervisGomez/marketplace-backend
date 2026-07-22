# Payment — Structural Modernization

## Resumen

Payment no tenía controller/router propios: su schema y diez handlers estaban integrados en Buy bajo `/api/buy`. La modernización extrae esas capacidades a `src/modules/payment` y mantiene el montaje HTTP existente mediante `BuyUseCaseRegistry`. No se añadió ningún endpoint al router raíz.

Se crearon `src/payment/paymentCtrl.js` y `src/payment/paymentRouter.js` como fachadas de compatibilidad solicitadas. El router Payment reproduce las rutas relativas existentes, pero deliberadamente no se monta en `src/router.js`; las URLs públicas continúan siendo exclusivamente las actuales de Buy.

## Capacidades identificadas

### Balances

- `availability`
- `balance`
- `available`

### Transactions

- `queryPayment`

### Withdrawals

- `withdrawals`
- `listWithdrawals`
- `listWithdrawals2` (handler legacy sin ruta)

### Deposits / administración de pagos

- `pendingPayments`
- `pendingExecuted`
- `processPayments`

### Reporting

No existen handlers propios de reporting Payment. `ReportingUseCases.js` lo documenta sin inventar comportamiento.

## Persistencia

- `PaymentRepository`: único adaptador nuevo que importa `src/buy/paymentSchema.js`.
- `MongoObjectId`: encapsula la conversión Mongoose usada por balances/retiros.

El antiguo repositorio Payment de Buy permanece como fachada hacia el repositorio Payment canónico.

## Gateways

- `PaymentRelationsGateway`: Buy, Question, Account y Bank.
- `LegacyReputationGateway`: acceso compatible a `src/product/record.js`.
- `LegacyFileGateway`: carga de comprobantes mediante File/Cloudinary.

No se crearon gateways Product, User o Notification porque los diez handlers extraídos no consultan directamente esos modelos. Los `populate` de referencias continúan ejecutándose sobre las queries originales.

## Fachadas y compatibilidad

- `src/payment/paymentCtrl.js` → controller modular Payment.
- `src/payment/paymentRouter.js` → router modular Payment no montado.
- `src/buy/buyCtrl.js` y `src/buy/buyRouter.js` conservan su contrato completo.
- `BuyUseCaseRegistry` compone internamente `PaymentUseCaseRegistry`.
- Wrappers Payment dentro de Buy conservan imports arquitectónicos existentes.

## Validaciones

- Diez cuerpos Payment comparados literalmente antes/después.
- Las 39 rutas Buy y sus 34 usos de Auth permanecen iguales.
- Buy conserva sus 41 handlers; Payment expone los diez de su capacidad.
- Comparación de respuestas HTTP, contratos JSON, consultas, filtros, `populate` y agregaciones.
- Presentation/Application Payment sin imports de Mongoose, schemas o modelos.
- Repositorio y gateways son los únicos adaptadores hacia persistencia/integraciones.
- Sintaxis y carga completa de Payment y Buy verificadas.

## TODO(v2)

- Los bugs existentes y variables globales accidentales permanecen sin corregir.
- Separar Reputation en su contexto definitivo.
- Definir DTOs restrictivos y políticas de dominio solo tras pruebas de caracterización.
- Evaluar un montaje HTTP propio de Payment únicamente como cambio de versión/API explícito.

## Confirmación

Esta fase no cambia endpoints, middleware, status HTTP, mensajes, validaciones, filtros, consultas Mongo, `populate`, agregaciones ni formas JSON. Payment queda modularizado sin alterar el comportamiento público de `/api/buy`.
