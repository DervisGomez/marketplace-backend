# Infraestructura de calidad de código

## Objetivo

Esta primera etapa incorpora análisis estático y formato verificable sin alterar el comportamiento observable ni generar una reescritura masiva del código legacy. La baseline es CommonJS sobre Node.js 22 LTS.

## Versiones fijadas

- ESLint `9.39.5`.
- Prettier `3.9.6`.

Ambas versiones están declaradas de forma exacta en `devDependencies` y bloqueadas en `package-lock.json`. No se instalaron Babel, TypeScript ni plugins adicionales.

## Arquitectura de lint

`eslint.config.cjs` usa Flat Config y se ejecuta directamente sobre CommonJS. Los globals de Node y Vitest están declarados localmente para evitar una dependencia adicional. La configuración no extiende `eslint:recommended`: selecciona únicamente comprobaciones orientadas a errores y todas tienen severidad `warn`.

Reglas activas:

- `constructor-super`
- `getter-return`
- `no-class-assign`
- `no-const-assign`
- `no-dupe-args`
- `no-dupe-keys`
- `no-ex-assign`
- `no-func-assign`
- `no-import-assign`
- `no-new-native-nonconstructor`
- `no-obj-calls`
- `no-self-assign`
- `no-setter-return`
- `no-sparse-arrays`
- `no-undef`
- `no-unexpected-multiline`
- `no-unreachable`
- `no-unsafe-finally`
- `use-isnan`
- `valid-typeof`

La primera ejecución registra 71 warnings y 0 errores. Estos warnings son un inventario de deuda; no bloquean el comando ni fueron corregidos en esta etapa.

### Reglas deshabilitadas inicialmente

Las siguientes reglas permanecen deshabilitadas por su alta deuda histórica o por ser decisiones de estilo: `array-callback-return`, `camelcase`, `consistent-return`, `curly`, `eqeqeq`, `no-async-promise-executor`, `no-await-in-loop`, `no-console`, `no-new`, `no-param-reassign`, `no-prototype-builtins`, `no-unused-vars`, `no-use-before-define`, `no-var`, `prefer-const` y `require-await`.

### Cuarentena de lint

- `src/data/locations.js`: archivo de datos legacy de gran volumen.
- `services/suggestions.js`: contiene una redeclaración preexistente de `suggestions`. ESLint la trata como error de parser y no permite degradarla a warning. Debe permanecer excluido hasta que una modificación funcional pueda protegerse y revisarse por separado.

## Arquitectura de formato

`.prettierrc.json` define el formato objetivo. `.editorconfig` alinea editores en UTF-8, LF, espacios y newline final. `.prettierignore` evita dependencias, artefactos, secretos y mantiene una cuarentena explícita para el código legacy.

En esta etapa se excluyen `src`, `services`, `middlewares`, `socket`, `tests`, los entrypoints JavaScript, la documentación histórica, `package.json`, el workflow existente y `bin/www`. Estas exclusiones evitan diffs masivos y deben retirarse de forma incremental, por módulo, en cambios dedicados y protegidos por tests. Los archivos de configuración nuevos sí son comprobados por Prettier.

## Scripts

- `npm run lint`: analiza sin modificar archivos.
- `npm run lint:fix`: disponible para una adopción futura y controlada; no fue ejecutado en esta etapa.
- `npm run format:check`: comprueba formato sin escribir.
- `npm run format`: disponible para cambios explícitos; no fue ejecutado en esta etapa.

## Estrategia de endurecimiento gradual

1. Mantener `lint` y `format:check` informativos mientras se clasifica la deuda actual.
2. Resolver warnings de `no-undef` en cambios pequeños, acompañados por Characterization Tests, sin corregir comportamiento de manera incidental.
3. Retirar entradas de `.prettierignore` por módulo y formatear cada área en commits exclusivos, sin mezclar cambios funcionales.
4. Activar `no-unused-vars` como warning con excepciones acordes a CommonJS; después evaluar `eqeqeq`, `no-prototype-builtins` y `no-async-promise-executor` individualmente.
5. Promover una regla de warning a error solo cuando su baseline llegue a cero y el equipo acuerde mantenerla.
6. Aplicar un presupuesto de cero warnings nuevos en CI antes de exigir cero warnings históricos.

## Integración futura con CI y Husky

En CI, después de `npm ci`, ejecutar `npm run lint`, `npm run format:check` y `npm test`. Mientras todas las reglas sean warning, `lint` informa sin bloquear por deuda existente; un error de configuración o parsing no excluido sí bloquea.

Husky y `lint-staged` no se instalaron en esta etapa. Cuando se incorporen, el pre-commit debería comprobar únicamente archivos staged, sin escritura automática; el formateo con `--write` debe ser una acción explícita del desarrollador. La suite completa puede permanecer en CI o pre-push para no degradar la experiencia de commit.

## Validación realizada

Validado con Node.js `22.13.1`:

- `npm run lint`: correcto, 0 errores y 71 warnings.
- `npm run format:check`: correcto.
- `npm test -- --reporter=dot`: 8 archivos y 222/222 tests aprobados.

No se ejecutaron `eslint --fix` ni `prettier --write`. No se modificaron archivos JavaScript productivos ni se introdujeron cambios funcionales.
