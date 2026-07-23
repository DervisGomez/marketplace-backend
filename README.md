# Andamio

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)
[![Tests](../../actions/workflows/ci.yml/badge.svg?event=push)](../../actions/workflows/ci.yml)
[![CodeQL](../../actions/workflows/codeql.yml/badge.svg)](../../actions/workflows/codeql.yml)
[![Node.js 22.13](https://img.shields.io/badge/Node.js-22.13-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

andamio para configuracion de proyecto de una api rest

## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

Mira **Deployment** para conocer como desplegar el proyecto.

### Pre-requisitos 📋

_Debes tener instalado node.js y mongodb_

### Instalación 🔧

_1-debes clonar el repositorio en tu maquina y luego ubicarte dentro del archivo del proyecto_

_2-instalar modulos_

```
npm install
```

_debes instalar nodemon globalmente si vas a desarrollar dentro del el _

```
npm install nodemon -g
```

_debes instalar nodemon globalmente si vas a desarrollar dentro del el _

## Deployment ⚙️

_para produccion _

```
npm run start ó npm start
```

_para desarrollo _

```
npm run dev
```

### Analizando la estructura de carpeta🔩

_carpeta node_modules => contendra los modulos importados desarrollado por terceros, si ha creado un modulo por favor guardelo en la carpeta middlewares_

```
no meter ningun modulo creado por usted en esta carpeta
```

_carpeta middlewares => contendra los modulos generados por los desarrolladores, ha de aclarar su buen uso, considerando que un middleware su inyeccion va en la cabecera de la peticion de los end point _

```
no lleva regla de nomenclatura
```

_caperta models => contendra los esquemas de la base de datos, debe seguir esta regla_

```
Schema<Nombre>.js
```

_carpeta services => contendra los servicios que seran inyectados dentro de la logica de los archivos controllers_

```
no lleva regla de nomenclatura
```

_carpeta controllers => va la logica de respuesta, manipulacion y uso que son recibidas de los end point_

```
Ctrl<Nombre>.js
```

_carpeta public_

```
NO esta en uso actualmente
```

_config.js => van las configuraciones del puerto del servidor, base de datos, y las configuraciones necesarias de las clave valor de apis de terceros, como cloudinary, mailgun y más_

_server.js => archivo run del proyecto tanto produccion como desarrollo_

_app.js => instacia y uso de modulos_

_carpeta routes => va las rutas de los end point y su configuracion_

```
no lleva regla de nomenclarura
```

## Iniciando 📦

_si no hay error en consola vaya a la ruta_

```
http://localhost:8888/api
```

_si es desarrollador y contribuira al desarrollo considere el mensaje de respuesta_

## Construido con 🛠️

- express - El framework usado

## Quality Gates

Every push to `master` or `main` and every pull request must pass the main CI pipeline:

- **Lint:** `npm run lint` enforces the ESLint 9 rules.
- **Format:** `npm run format:check` verifies formatting with Prettier 3.
- **Tests:** `npm test` runs the 222 characterization tests that protect the observable legacy behavior.
- **Coverage:** `npm run test:coverage` generates the V8 HTML and LCOV reports.

Successful runs publish the coverage report, JUnit test results, and a source package prepared without
`node_modules`. See [RELEASE_ENGINEERING.md](./RELEASE_ENGINEERING.md) for the release and versioning process.

## Security

- **CodeQL:** analyzes JavaScript on pull requests, pushes to `main`, and a weekly schedule.
- **Dependabot:** checks npm and GitHub Actions dependencies weekly and groups compatible minor and patch
  updates.
- **npm audit:** produces an informational JSON report in CI without blocking legacy builds.
- **GitHub Security:** centralizes code-scanning alerts, dependency findings, and private vulnerability
  reports.

Report vulnerabilities privately and review the supported-version and update policies in
[SECURITY.md](./SECURITY.md). Do not publish vulnerability details in a public issue.
