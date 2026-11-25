# Informe de resultados — EbookYa
Fundamentos en S.I · UdeA 2026 · Laboratorio: Generación de aplicaciones con IA
**Equipo/Estudiante:** ____________ · **Fecha de entrega:** 24 de noviembre de 2026
**Frontend (Railway):** <URL> · **Backend (Railway):** <URL> · **Repositorio:** <URL>

> Convención: ✅ verificado · 🔲 pendiente de ejecutar por el equipo (rellenar). Nada marcado ✅ está sin evidencia.

## 1. Resumen
EbookYa es una tienda de libros electrónicos con catálogo, stock de licencias, carrito, pedidos, pago con PayPal Sandbox y tablero de gestión de envíos en tiempo real. Frontend Next.js; backend Express + Socket.IO + Mongoose sobre MongoDB Atlas; despliegue en Railway. El código base fue generado con asistencia de IA y revisado frente a los criterios del PRD.

## 2. Arquitectura y decisiones
| Decisión | Justificación |
|---|---|
| APIs y WebSockets en un backend Node separado | La lógica de pagos y autorización no depende del navegador; Socket.IO comparte proceso con Express |
| Total, precio y estado decididos en servidor | No se confía en el cliente: manipular el precio en el navegador no cambia el importe cobrado |
| Captura PayPal verificada (estado, importe, moneda, pedido) y idempotente | Evita pedidos pagados sin cobro y cobros duplicados |
| Máquina de estados PAGADO→PROCESANDO→ENVIADO→ENTREGADO | Impide saltos arbitrarios de estado (HTTP 409) |
| Salas Socket.IO asignadas por el servidor desde el JWT | El navegador no puede suscribirse a canales ajenos |
| Precios en centavos enteros | Evita errores de punto flotante |
Diagrama y endpoints: ver `README.md`.

## 3. Resultados de pruebas
### 3.1 Pruebas unitarias del backend (`npm test`) — ✅ ejecutadas
| Prueba | Resultado |
|---|---|
| Recalcula total con precios del servidor | ✅ Aprobada |
| Une líneas duplicadas y valida stock | ✅ Aprobada |
| Rechaza cantidad inválida, carrito vacío y libro agotado | ✅ Aprobada |
| Estados no permiten saltos | ✅ Aprobada |
**4/4 aprobadas (100 %).** Cubren la lógica pura; no cubren base de datos, PayPal ni WebSockets.

### 3.2 Plan de pruebas TestSprite (trazabilidad) — 🔲 por ejecutar
| Requisito | Caso | Prioridad | Resultado |
|---|---|---|---|
| RF2 | Abrir catálogo sin sesión y filtrar por categoría | Alta | 🔲 |
| RF1 | Login válido / inválido (error genérico) | Alta | 🔲 |
| RF3 | Cliente intenta abrir /admin → denegado | Alta | 🔲 |
| RF4 | Agregar, quitar y cambiar cantidades en carrito | Alta | 🔲 |
| RF5 | Enviar precio alterado → backend recalcula | Alta | 🔲 |
| RF6 | Pago PayPal Sandbox aprobado → pedido PAGADO una vez | Alta | 🔲 |
| RF6 | Pago cancelado/fallido → no se marca pagado | Alta | 🔲 |
| RF7 | Consultar pedido de otro usuario → denegado | Alta | 🔲 |
| RF8 | Gestor avanza estados; salto de estado rechazado | Alta | 🔲 |
| RF9 | Gestor cambia estado → cliente ve actualización | Alta | 🔲 |
| RF4 | Cantidad negativa o dirección vacía → rechazo | Media | 🔲 |
| — | Recargar rutas internas sin perder sesión | Media | 🔲 |

### 3.3 Resumen de ejecución TestSprite (EbookYa) — 🔲 rellenar
| Métrica | Valor |
|---|---|
| Fecha/hora de ejecución | |
| Tests ejecutados | |
| Aprobados / Fallidos / Bloqueados | _ / _ / _ |
| Tasa de éxito | _ % |
Adjuntar capturas de la vista *Test Cases* y de los fallos críticos.

### 3.4 Referencia: ejecución de PlatoYa (guía del profesor, PDF pp. 24–25)
32 pruebas en 7 áreas, ejecución del 2026-09-12: **29 aprobadas, 3 fallidas, 0 bloqueadas (≈ 90,6 %)**. De los fallos solo es legible en la captura PAY-001 *Complete PayPal guest checkout from checkout page* (prioridad alta). Es un resultado de otra aplicación; se incluye únicamente como punto de comparación.

## 4. Defectos
| ID | Descripción | Severidad | Clasificación | Estado |
|---|---|---|---|---|
| D-01 | Script `npm test` fallaba al apuntar a un directorio con la versión de Node usada | Baja | Defecto funcional (tooling) | ✅ Corregido: el script apunta a `src/logic.test.js` |
| D-02 | | | | 🔲 (registrar fallos de TestSprite: ID, evidencia, clasificación funcional/ambiente/dato inválido/falso positivo, commit de corrección y regresión) |

## 5. Controles de seguridad (revisión de código, no pruebas automatizadas)
| Control | Dónde | Evidencia |
|---|---|---|
| Hash de contraseña (bcrypt) y rol `cliente` fijado por el servidor | `routes.js` | Revisión de código |
| Autorización por rol y por propiedad del pedido | `routes.js` (`auth`, `ownOrder`, filtros por `user`) | Revisión de código |
| Validación de entradas (zod) y rate limit en login | `routes.js` | Revisión de código |
| Secretos solo en backend; `.env` en `.gitignore` | `.gitignore`, `.env.example` | Revisión de código |
| CORS limitado a `CLIENT_ORIGIN`; handshake WS autenticado | `index.js`, `socket.js` | Revisión de código |
🔲 Verificar manualmente en el despliegue y anexar evidencia (p. ej. petición de cliente a `/api/orders` → 403).

## 6. Limitaciones conocidas
- Sesión en `localStorage` (mejora: cookie httpOnly).
- Tablero con botones de transición, sin arrastrar y soltar.
- Si el stock se agota entre crear el pedido y pagar, no hay compensación ni reembolso automático.
- Sin descarga real del archivo del libro ni envío de correo; la "entrega" es un estado de pedido.
- Pruebas unitarias solo sobre lógica pura; sin pruebas de integración con MongoDB/PayPal.
- El agente de TestSprite no garantiza cobertura completa ni seguridad.

## 7. Decisión de liberación
🔲 Liberar / no liberar según tasa de éxito, defectos críticos abiertos y regresión: ____________

## 8. Reflexión individual (borrador; edítalo con lo que realmente hiciste)
**Qué generó la IA.** La estructura del monorepo, el backend (modelos, autenticación, rutas, integración PayPal, Socket.IO), las páginas de Next.js, el PRD y esta plantilla de informe.
**Qué verificó el equipo.** (Completa) Ej.: ejecutar `npm test`; correr el flujo con una cuenta Sandbox; probar en dos navegadores el tiempo real; revisar el diff; intentar manipular el precio; ejecutar TestSprite y reproducir manualmente los fallos.
**Qué decisiones se tomaron manualmente.** (Completa) Ej.: credenciales y red de Atlas, entorno Sandbox de PayPal, variables en Railway, qué casos de TestSprite se eliminaron o corrigieron, criterio de liberación.
**Aprendizajes.** (Completa en primera persona: qué falló al confiar en el código generado, qué haría distinto.)
