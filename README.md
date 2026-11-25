# EbookYa — Laboratorio Fundamentos en S.I (UdeA 2026)
Tienda de libros electrónicos: **Next.js** (`web/`) + **Express + Socket.IO + Mongoose** (`server/`) + MongoDB Atlas + PayPal Sandbox + Railway.

## Arquitectura
```
Navegador ──HTTPS──> Next.js (Railway, servicio "web")
    └──HTTPS/REST + WSS──> Express + Socket.IO (Railway, servicio "server") ──> MongoDB Atlas
                                                         └──HTTPS──> PayPal Sandbox
TestSprite ──> URL pública del frontend
```
Decisiones: APIs y WebSockets en un solo backend (la lógica de pagos no depende del navegador); precios, totales, estados y pagos se deciden en el servidor; salas Socket.IO asignadas por el servidor según el JWT (`user:<id>`, `gestores`); precios en centavos enteros.

## Ejecutar local
```powershell
cd server; copy .env.example .env   # completa MONGODB_URI, JWT_SECRET, PayPal, SEED_PASSWORD
npm install; npm run seed; npm test; npm run dev
cd ..\web; copy .env.example .env.local; npm install; npm run dev
```
Usuarios demo (clave = `SEED_PASSWORD`): `gestor@ebookya.test`, `cliente@ebookya.test`. Comprador PayPal: cuenta Sandbox personal.

## Endpoints y autorización
| Ruta | Acceso |
|---|---|
| POST /api/auth/register · /login | Público (login con rate limit) |
| GET /api/books | Público |
| POST/PUT /api/books(/:id) | gestor |
| POST /api/orders · GET /api/orders/me | cliente (solo propios) |
| GET /api/orders · PATCH /api/orders/:id/status | gestor (máquina de estados) |
| POST /api/payments/paypal/order · /capture | cliente dueño del pedido |
| GET /health | Público |

Modelos: `User`, `Book`, `Order`, `Payment` (ver `server/src/models.js`). Eventos: `order:created`, `order:statusChanged` (gestores), `order:updated` (cliente dueño).

## Despliegue en Railway
1. Sube el repo a GitHub. En Railway crea el proyecto y **dos servicios** desde el repo: Root Directory `server` y `web`.
2. `server`: variables `MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN` (dominio exacto del web), `PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE`. Genera dominio y prueba `/health`. En Atlas permite la salida de Railway (IP) en Network Access.
3. `web`: `NEXT_PUBLIC_API_URL` (dominio del server) y `NEXT_PUBLIC_PAYPAL_CLIENT_ID`. Re-despliega tras cambiar variables `NEXT_PUBLIC_*`.
4. Ejecuta `npm run seed` una vez (`railway run npm run seed` en `server`).

## TestSprite (Live Web App)
Proyecto `ebookya`, tipo Frontend UI, URL del web, login con `cliente@ebookya.test`, sube `PRD.md`, planifica los 7 módulos, revisa/elimina casos ambiguos, **Run All**, clasifica fallos y rellena `INFORME.md`. Casos clave: precio alterado, pedido ajeno (403), cliente en /admin, pago cancelado, captura repetida, salto de estado (409).

## Pendiente por parte del equipo
- [ ] Crear cuentas/credenciales (Atlas, PayPal Sandbox, Railway, TestSprite) y desplegar
- [ ] URLs desplegadas, evidencia de TestSprite, capturas
- [ ] `INFORME.md` con resultados reales y reflexión individual
