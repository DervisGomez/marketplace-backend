# Product — Structural Modernization

Esta migración implementa la estructura definida en `PRODUCT_ARCHITECTURE_REVIEW.md` sin cambiar contratos ni comportamiento observable.

## Capacidades

- **Publication:** `createIncrement`, `new`, `edit`, `pause`, `start`.
- **Catalog:** `me`, `user`, `query`, `queryNumber`, `queryFind`, `find`.
- **Search:** `category`, `subcategory`, `filter`, `search`, `keywords`.
- **Favorites:** `favoriteAdd`, `favoriteRemove`, `favorite`.
- **Reporting:** `operations`, `outstanding`, `last`, `sold`.

## Compatibilidad

`src/product/productCtrl.js` y `src/product/productRouter.js` permanecen como fachadas. Los consumidores legacy y `src/router.js` no requieren cambios.

## Persistencia e integraciones

- Los casos de uso solo consumen repositorios; Mongoose queda dentro de `infrastructure/mongoose/repositories`.
- La carga de imágenes se consume mediante `LegacyImageGateway`.
- `record.js` se conserva sin cambios funcionales y se accede mediante `LegacyReputationGateway`.
- Los schemas legacy siguen siendo canónicos; los wrappers en la arquitectura nueva conservan identidad de modelo y compatibilidad con otros módulos.

## Validación

- 23 cuerpos de handlers comparados con la versión anterior, permitiendo únicamente sustituciones equivalentes de adaptadores.
- 23 rutas comparadas textualmente después de normalizar espacios.
- 23 exports de controller verificados.
- Sin imports de Mongoose o schemas en presentación/application.
- Sintaxis y carga de la cadena legacy/nueva verificadas.

## TODO(v2)

Los bugs y riesgos documentados en `PRODUCT_ARCHITECTURE_REVIEW.md` permanecen deliberadamente sin corregir. Reputation deberá migrarse a su módulo futuro antes de modificar la lógica de `record.js`.
