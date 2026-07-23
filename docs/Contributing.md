# Contributing

## Preparación

```bash
npm ci
cp .env.example .env
```

Usa Node.js 22.13.x. El script `prepare` configura Husky; si instalaste sin lifecycle scripts, ejecuta
`npm run prepare`.

## Antes de abrir un pull request

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

Describe el cambio observable, los riesgos y los tests añadidos. Actualiza `CHANGELOG.md` cuando el cambio
sea visible para usuarios u operación.

## Hooks

Pre-commit ejecuta lint-staged sobre los archivos staged:

- JavaScript: ESLint fix y Prettier.
- TypeScript: Prettier.
- JSON, Markdown y YAML: Prettier.

Pre-push ejecuta la suite. Revisa `git diff --cached` después de fixes automáticos. Los hooks pueden omitirse
con `--no-verify`, pero solo en una emergencia documentada; CI continúa siendo obligatorio.

## Reglas de cambio

- Conserva los contratos HTTP salvo que el cambio incompatible sea deliberado y versionado.
- Añade characterization antes de modificar comportamiento no protegido.
- Sigue las reglas de [Architecture](Architecture.md).
- No edites artifacts generados en `dist/` o `coverage/`.
- No confirmes `.env`, uploads, credenciales o datos personales.
- No actualices dependencias con `npm update` durante una release.
- Mantén los cambios pequeños y separa refactors de cambios funcionales cuando sea posible.

## Versionado

El proyecto usa Semantic Versioning:

- PATCH para fixes compatibles.
- MINOR para funcionalidad compatible.
- MAJOR para cambios incompatibles de API o comportamiento.

El tag, `package.json`, `package-lock.json` y `CHANGELOG.md` deben coincidir. Consulta
[Deployment](Deployment.md) para publicar una release.

## Documentación

README es el punto de entrada y `docs/` contiene las fuentes vigentes. No añadas planes o reportes a la raíz.
Si una decisión arquitectónica necesita contexto duradero, documenta un ADR cuando exista la carpeta ADR;
no crees ADRs retrospectivos para decisiones triviales.
