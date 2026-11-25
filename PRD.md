# PRD — EbookYa
**Producto:** tienda web de libros electrónicos con catálogo, stock de licencias, pago PayPal Sandbox y gestión de envíos (entrega digital) en tiempo real.
**Roles:** cliente (registro público) · gestor (creado por seed).
## Requisitos funcionales
| ID | Requisito | Criterio de aceptación |
|----|-----------|------------------------|
| RF1 | Registro/login con roles | Rol `cliente` asignado por servidor; error genérico ante credenciales inválidas |
| RF2 | Catálogo con filtro por categoría | Solo libros activos; muestra stock |
| RF3 | Gestión de catálogo/stock (gestor) | Solo `gestor` crea/edita libros y stock; cliente recibe 403 |
| RF4 | Carrito y datos de envío | Cantidades 1–10; datos de envío validados |
| RF5 | Pedido | Total recalculado en servidor con precios de BD; manipular el precio no cambia el importe |
| RF6 | Pago PayPal Sandbox | Pedido pasa a PAGADO solo tras captura verificada (estado, importe, moneda, pedido); captura repetida no duplica |
| RF7 | Historial del cliente | Cada cliente ve solo sus pedidos |
| RF8 | Tablero de envíos (gestor) | Flujo PAGADO→PROCESANDO→ENVIADO→ENTREGADO; saltos rechazados (409) |
| RF9 | Tiempo real | Pedido pagado aparece en el tablero sin recargar; el cliente ve cambios de estado |
## No funcionales
Secretos solo en backend · CORS limitado a `CLIENT_ORIGIN` · rate limit en login · WSS en producción · `/health`.
## Fuera de alcance
Descarga real de archivos, reembolsos, impuestos, pagos reales.
