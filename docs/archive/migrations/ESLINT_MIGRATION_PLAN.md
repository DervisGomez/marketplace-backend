# Plan de migración a ESLint y Prettier

## Resumen ejecutivo

La discrepancia de runtime detectada durante la auditoría fue resuelta: el baseline oficial es Node 22 LTS (`>=22.13.0 <23`) y CI usa Node 22.13.1. Esto habilita la futura incorporación de ESLint 10 y Prettier 3 sin mantener un toolchain paralelo.

Recomendación principal:

1. No formatear ni autofijar todo el repositorio.
2. Resolver y documentar primero el baseline de Node.
3. No mantener compatibilidad de tooling con Node 12, que dejó de ser el baseline oficial.
4. Adoptar posteriormente **ESLint 10.x** con flat config y **Prettier 3.x** sobre Node 22.13 o superior.
5. Introducir lint en modo diagnóstico, mantener las reglas ruidosas deshabilitadas y endurecer por carpetas o archivos modificados.

Node 12 terminó su soporte oficial en 2022; Node 20 también está fuera de soporte en la fecha de esta auditoría. Node recomienda usar líneas LTS soportadas para aplicaciones de producción. [Calendario oficial de Node.js](https://nodejs.org/en/about/previous-releases), [riesgos de versiones EOL](https://nodejs.org/en/about/eol).

## Estado auditado

| Elemento                        | Estado actual                                           | Implicación                                                                            |
| ------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Node local durante la auditoría | `v20.20.2`                                              | Entorno anterior; no representa el baseline oficial                                    |
| Node declarado                  | `>=22.13.0 <23` en `engines`                            | Compatible con ESLint 10, Prettier 3 y Vitest 1                                        |
| npm local                       | `10.8.2`                                                | Puede reescribir el lockfile v1 del proyecto si se instala sin cuidado                 |
| package-lock                    | formato v1                                              | Fue generado por una generación antigua de npm                                         |
| Lenguaje                        | 246 archivos JavaScript; 0 TypeScript                   | No hace falta parser TypeScript                                                        |
| Módulos                         | CommonJS                                                | Uso consistente de `require` y `module.exports`; no existe `type: module`              |
| Express                         | declarado `^4.17.1`                                     | API CommonJS legacy; no requiere plugin ESLint específico                              |
| Mongoose                        | declarado `^5.5.13`; resuelto actualmente como `5.6.4`  | API antigua, callbacks/deprecaciones y patrones dinámicos sensibles a reglas agresivas |
| Tests                           | Vitest 1.6.1, Supertest 7.1.1, MongoMemoryServer 10.1.4 | El toolchain de tests ya presupone Node moderno                                        |
| Configuración actual            | No hay ESLint, Prettier ni EditorConfig                 | No existe baseline previo que preservar                                                |

### Dependencias y runtime

Las dependencias principales son de la generación 2018-2020: Express 4, Mongoose 5, Redis 2, Socket.IO 2, Cloudinary 1 y Twilio 3. Esto no impide linting, pero sí aconseja evitar reglas que transformen APIs, callbacks, promesas, constructores Mongoose o semántica de `this`.

`npm ls --depth=0` no reportó dependencias directas inválidas. Sí existe una diferencia esperable entre rangos declarados y versiones resueltas; ESLint y Prettier deben instalarse con versión exacta (`--save-exact`) para que una actualización de tooling no altere el baseline.

## Matriz de compatibilidad

| Herramienta    | Requisito de Node | Compatible con Node 12.18 | Estado/recomendación                           |
| -------------- | ----------------- | ------------------------- | ---------------------------------------------- |
| ESLint 7.32.0  | `^10.12           |                           | >=12`                                          | Sí  | Único puente seguro si 12.18 sigue siendo obligatorio; está EOL |
| ESLint 8.57.1  | `^12.22           |                           | ^14.17                                         |     | >=16`                                                           | **No** | No instalar mientras `engines` sea 12.18; también está EOL               |
| ESLint 9.39.x  | `^18.18           |                           | ^20.9                                          |     | >=21.1`                                                         | No     | Compatible con el Node local, pero en mantenimiento hasta agosto de 2026 |
| ESLint 10.x    | `^20.19           |                           | ^22.13                                         |     | >=24`                                                           | No     | Opción actual después de fijar Node 22.13+                               |
| Prettier 2.8.8 | `>=10.13`         | Sí                        | Puente compatible con Node 12; versión antigua |
| Prettier 3.x   | `>=14`            | No                        | Recomendado después de modernizar Node         |

ESLint documenta que v8 requiere como mínimo Node 12.22 y recomienda permanecer en ESLint 7 si no se puede actualizar Node. [Guía oficial de migración a ESLint 8](https://eslint.org/docs/latest/use/migrate-to-8.0.0). Las líneas 7 y 8 están EOL, ESLint 9 está en mantenimiento y ESLint 10 es la línea actual. [Política oficial de versiones de ESLint](https://eslint.org/version-support/).

Prettier 3 introdujo cambios incompatibles, migró internamente a ESM y cambió `trailingComma` de `es5` a `all`; aunque puede consumirse desde CommonJS, no conviene incorporarlo accidentalmente con defaults distintos. [Notas oficiales de Prettier 3](https://prettier.io/blog/2023/07/05/3.0.0.html). Prettier recomienda fijar la versión exacta para evitar cambios de formato no revisados. [Instalación oficial de Prettier](https://prettier.io/docs/install).

## Incompatibilidades detectadas

### Críticas

- La infraestructura de despliegue externa al repositorio debe verificarse para asegurar que respeta el nuevo `engines.node`.
- Node 12 y Node 20 están EOL y ya no deben utilizarse como fallback silencioso.

### Altas

- npm 10 sobre un lockfile v1 puede producir diffs masivos y cambios transitivos al instalar tooling.
- ESLint 10 eliminó el sistema eslintrc; requiere flat config. Adoptarlo sin una migración consciente rompe configuraciones legacy copiadas de otros proyectos.
- Ejecutar `prettier --write .` generaría un cambio transversal difícil de revisar y mezclaría formato con comportamiento.

### Medias

- Se detectaron 53 líneas con comparaciones laxas, 229 llamadas a `console.*`, 29 usos de `var` y 32 referencias relacionadas con globals o llamadas dudosas a `next`.
- `no-undef` detectaría problemas reales ya observables, por ejemplo identificadores legacy no definidos. Activarlo directamente como error bloquearía CI.
- Hay estilos de fin de línea e indentación mezclados.
- `src/data/locations.js`, snapshots y archivos de cobertura son grandes o generados y no deben dominar la primera migración.

## Estrategia recomendada

### Decisión de baseline

Baseline adoptado:

- Ejecutar la aplicación y characterization tests en Node 22 LTS, como mínimo `22.13`.
- Mantener alineados desarrollo, CI y producción.
- Instalar ESLint 10 y Prettier 3 con versiones exactas.
- Usar `eslint.config.cjs` para que la configuración siga el modelo CommonJS del repositorio, aunque ESLint use flat config.

Referencia histórica, no recomendada después de adoptar Node 22:

- `eslint@7.32.0`
- `prettier@2.8.8`
- configuración `.eslintrc.cjs`
- fecha explícita de retirada, porque ambas líneas están fuera de mantenimiento.

No se recomienda ESLint 8: no es compatible con Node 12.18 y tampoco ofrece una ventaja de soporte, pues ya está EOL.

### Alcance inicial

Incluir:

- `app.js`, `server.js`, `config.js`
- `src/**/*.js`
- `services/**/*.js`
- `middlewares/**/*.js`
- `socket/**/*.js`
- `tests/**/*.js`
- `vitest.config.js`

Ignorar inicialmente:

- `node_modules/`
- `coverage/`
- `uploads/`
- snapshots `**/__snapshots__/**`
- `src/data/locations.js`
- `package-lock.json`
- archivos `.pem`, `.key`, `.crt` y credenciales ya ignoradas por Git

Los snapshots deben seguir siendo responsabilidad de Vitest, no de Prettier.

## Configuración ESLint inicial propuesta

La configuración inicial debe declarar explícitamente:

- runtime Node;
- CommonJS (`sourceType: 'commonjs'` en flat config o `sourceType: 'script'` en eslintrc);
- `ecmaVersion: 2020`, compatible con la sintaxis observada y Node 12.18;
- globals de Node;
- override de tests con globals de Vitest (`describe`, `it`, `expect`, `beforeAll`, `beforeEach`, `afterAll`, `vi`).

No se necesita Babel, TypeScript parser, React plugin ni framework preset.

### Reglas iniciales

Empezar como advertencias para obtener baseline sin bloquear:

```js
{
  'no-dupe-args': 'warn',
  'no-dupe-keys': 'warn',
  'no-unreachable': 'warn',
  'no-unsafe-finally': 'warn',
  'no-sparse-arrays': 'warn',
  'no-unexpected-multiline': 'warn',
  'valid-typeof': 'warn',
  'no-undef': 'warn'
}
```

Estas reglas buscan defectos o ambigüedades y no imponen preferencias estéticas. Antes de elevar `no-undef`, se debe clasificar cada resultado entre bug real, global de runtime y falso positivo de configuración.

### Reglas que deben quedar deshabilitadas inicialmente

```js
{
  'no-unused-vars': 'off',
  'no-console': 'off',
  'no-var': 'off',
  'prefer-const': 'off',
  'eqeqeq': 'off',
  'curly': 'off',
  'consistent-return': 'off',
  'array-callback-return': 'off',
  'no-async-promise-executor': 'off',
  'require-await': 'off',
  'no-await-in-loop': 'off',
  'no-param-reassign': 'off',
  'no-prototype-builtins': 'off',
  'no-new': 'off',
  'no-use-before-define': 'off',
  'camelcase': 'off',
  'id-match': 'off',
  'class-methods-use-this': 'off'
}
```

También deben permanecer apagadas en ESLint todas las reglas puramente de formato: `indent`, `quotes`, `semi`, `comma-dangle`, `object-curly-spacing`, `keyword-spacing`, `space-before-function-paren`, `max-len` y equivalentes. Prettier debe ser el único responsable del formato.

No activar inicialmente `eslint:recommended` como un bloque indivisible: incluye reglas cuyo volumen debe auditarse primero. Las reglas seguras se incorporan de forma explícita.

## Configuración Prettier propuesta

Para minimizar diferencias respecto al código dominante:

```json
{
    "semi": true,
    "singleQuote": true,
    "tabWidth": 4,
    "useTabs": false,
    "printWidth": 120,
    "trailingComma": "none",
    "arrowParens": "avoid",
    "endOfLine": "lf"
}
```

Esta configuración no debe aplicarse masivamente al principio. El primer script debe ser `format:check`; `format` con `--write` debe ejecutarse solo sobre archivos seleccionados o modificados.

No agregar `eslint-plugin-prettier`: ejecutar Prettier dentro de ESLint ralentiza el lint, mezcla responsabilidades y produce diagnósticos ruidosos. Si más adelante se adopta un preset externo, `eslint-config-prettier` puede utilizarse únicamente para apagar reglas de estilo en conflicto; con la lista explícita anterior no es obligatorio inicialmente.

## Plan de endurecimiento gradual

### Fase 0 — Baseline y observación

- Resolver versión oficial de Node.
- Fijar versiones exactas de tooling.
- Añadir comandos de solo lectura: `lint` y `format:check`.
- Ejecutar contra todo el árbol sin convertir warnings preexistentes en fallo.
- Registrar número de warnings por regla y carpeta.
- Mantener los characterization tests como puerta principal de compatibilidad.

### Fase 1 — Código nuevo y modificado

- CI ejecuta ESLint sobre archivos cambiados.
- Cero warnings nuevos; la deuda histórica no bloquea todavía.
- Prettier se aplica solo a archivos nuevos o tocados de manera sustancial.
- Elevar a error las reglas sin violaciones en el baseline.

### Fase 2 — Fronteras modernas

- Endurecer primero `src/modules/**/presentation`, `application` y `src/shared`, carpeta por carpeta.
- Activar `no-undef: error` cuando globals y bugs existentes estén clasificados.
- Activar `no-unused-vars` como warning con argumentos ignorados por patrón `^_` únicamente después de medir su impacto.
- Considerar `eqeqeq: ['warn', 'smart']` solo acompañado por characterization tests específicos; cambiar `==` por `===` puede cambiar comportamiento.

### Fase 3 — Legacy restante

- Trabajar por módulo, en commits exclusivos de lint/formato.
- Elevar `no-unused-vars`, `prefer-const` y `no-var` únicamente cuando cada carpeta tenga cero deuda.
- No autofijar comparaciones, control de flujo, promesas o returns.
- Mantener `no-console` deshabilitada hasta disponer de una estrategia de logging; eliminar logs ahora sería un cambio operativo.

### Fase 4 — Política estable

- Lint completo en CI con cero errores.
- Warnings con límite decreciente y registrado.
- `format:check` completo solo después de una migración de formato separada y revisada.
- Renovación programada de ESLint/Prettier, siempre ejecutando primero las 222 characterization tests.

## Riesgos de implementación

- **Cambios semánticos por autofix:** `prefer-const`, `no-var`, `eqeqeq` y refactors de promesas no deben entrar en un commit de formato.
- **Blame inutilizable:** un formateo masivo ocultaría la historia del legacy.
- **CI distinto de producción:** lint puede pasar en Node moderno mientras la aplicación se despliega todavía en Node 12.
- **Plugins innecesarios:** presets populares pueden introducir cientos de reglas y peer dependencies incompatibles.
- **Globals mal configurados:** Vitest, Node y globals legacy pueden aparecer como `no-undef` aunque sean intencionales.
- **Datos y snapshots:** formatearlos produce diffs grandes sin valor funcional.
- **Versiones flotantes:** rangos con `^` pueden cambiar resultados de formato o reglas entre instalaciones.

## Criterios de aceptación para la futura incorporación

- La versión de Node está alineada entre `engines`, desarrollo, CI y producción.
- ESLint y Prettier están fijados exactamente y son compatibles con ese Node.
- No se modifica código productivo en el commit de instalación inicial.
- `npm test` conserva 222/222 pruebas.
- El primer lint no bloquea por deuda histórica.
- No se ejecuta formateo global.
- Las reglas de estilo permanecen fuera de ESLint.
- Cada endurecimiento posterior tiene alcance pequeño, métricas antes/después y characterization tests verdes.
