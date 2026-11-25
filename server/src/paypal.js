import { money } from './logic.js';
const base = () => process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
async function token() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const r = await fetch(`${base()}/v1/oauth2/token`, { method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  if (!r.ok) throw new Error('Error de autenticación con PayPal');
  return (await r.json()).access_token;
}
async function call(path, body, requestId) {
  const r = await fetch(`${base()}${path}`, { method: 'POST',
    headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': requestId },
    body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('PayPal rechazó la operación');
  return data;
}
export const createPayPalOrder = (order) => call('/v2/checkout/orders', {
  intent: 'CAPTURE',
  purchase_units: [{ custom_id: String(order._id), amount: { currency_code: 'USD', value: money(order.totalCents) } }] },
  `create-${order._id}`);
// Captura y VERIFICA estado, importe, moneda y pedido antes de devolver.
export async function capturePayPalOrder(providerOrderId, order) {
  const data = await call(`/v2/checkout/orders/${providerOrderId}/capture`, null, `capture-${order._id}`);
  const cap = data.purchase_units?.[0]?.payments?.captures?.[0];
  const ok = data.status === 'COMPLETED' && cap?.status === 'COMPLETED' && cap.amount.currency_code === 'USD'
    && cap.amount.value === money(order.totalCents) && cap.custom_id === String(order._id);
  if (!ok) throw new Error('El pago no coincide con el pedido');
  return cap.id;
}
