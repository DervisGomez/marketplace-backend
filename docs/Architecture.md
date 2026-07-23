# Architecture

## Vista general

Veyco es un monolito modular desplegado como un único proceso Node.js. Express expone la API, Mongoose
accede a MongoDB y Socket.IO atiende conexiones en tiempo real. Los módulos se organizan por capacidad de
negocio bajo `src/modules/`.

La arquitectura está en transición. La estructura modular y los adapters son actuales, pero algunos casos
de uso todavía conocen Express, Mongoose o componentes legacy. Esta documentación describe el sistema
existente; la presencia de una carpeta no implica aislamiento completo.

## Módulos

| Módulo         | Responsabilidad principal                       |
| -------------- | ----------------------------------------------- |
| `account`      | Cuentas de pago del usuario                     |
| `bank`         | Catálogo y gestión bancaria                     |
| `buy`          | Compras, órdenes, mensajería y calificación     |
| `category`     | Categorías y catálogo                           |
| `chat`         | Chat y soporte                                  |
| `denounce`     | Denuncias                                       |
| `invest`       | Solicitudes de inversión                        |
| `notification` | Notificaciones                                  |
| `payment`      | Saldos, depósitos, retiros y transacciones      |
| `product`      | Publicaciones, búsqueda, favoritos e inventario |
| `question`     | Preguntas, respuestas y moderación              |
| `user`         | Registro, autenticación, perfil y recuperación  |

`src/router.js` compone los routers expuestos bajo `/api`. Payment conserva rutas modulares, aunque sus
operaciones HTTP caracterizadas se exponen actualmente a través de Buy.

## Capas

Cada módulo puede contener:

- **Presentation:** rutas, controllers y DTOs HTTP.
- **Application:** servicios, casos de uso y ports.
- **Domain:** entidades, value objects y policies cuando el módulo los necesita.
- **Infrastructure:** schemas, repositories, mappers y gateways a proveedores o módulos existentes.
- **Shared:** constantes o utilidades propias del módulo.

`src/shared/` contiene contratos y adapters técnicos reutilizados. `src/infrastructure/` contiene bootstrap
HTTP y logging transversal.

## Flujo de una petición

```text
Cliente
  → correlation ID y request logger
  → parsers y middleware de autenticación/upload
  → router del módulo
  → controller y DTO
  → servicio/caso de uso
  → repository o gateway
  → Mongoose/proveedor externo
  → respuesta HTTP
```

Algunos casos de uso legacy todavía reciben `req`/`res`, construyen queries Mongoose y serializan la
respuesta. No deben usarse como precedente para código nuevo.

## Composición y runtime

`server.js` carga configuración, crea el servidor HTTP, conecta MongoDB y registra Socket.IO.
`src/infrastructure/http/startServer.ts` espera a que Mongo esté disponible antes de escuchar. TypeScript se
compila a `dist/`; varios consumidores CommonJS conservan bridges JavaScript hacia ese output.

## Principios y reglas

Para código nuevo o modernizado:

1. Domain no depende de Express, Mongoose, logging ni providers.
2. Application expresa entradas y salidas con datos propios; no recibe `Request`/`Response`.
3. Application depende de ports pequeños y semánticos, no de modelos o queries Mongoose.
4. Presentation traduce HTTP a comandos y resultados a respuestas.
5. Infrastructure implementa ports y contiene detalles de MongoDB o proveedores.
6. Las dependencias se ensamblan en el borde de la aplicación, no mediante estado global nuevo.
7. Un módulo consume otro mediante un gateway explícito; no importa sus modelos.
8. Toda migración conserva los contratos HTTP mediante characterization tests.
9. No se introducen microservicios, CQRS, event sourcing o DDD completo sin una necesidad demostrada.

Estas reglas definen la dirección objetivo. El código existente se migra por slices verticales, sin una
reescritura masiva.

## Decisiones relacionadas

- La aplicación permanece como monolito modular.
- MongoDB y Express son dependencias actuales, no abstracciones intercambiables en todo el sistema.
- CommonJS y bridges de compilación siguen activos durante la migración TypeScript.
- Los snapshots protegen compatibilidad; no sustituyen tests de reglas de negocio.

Para ejecutar el proyecto consulta [Development](Development.md); para el modelo de pruebas consulta
[Testing](Testing.md).
