import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User, Book, Order, Payment } from './models.js';
import { calcTotal, canTransition, FLOW } from './logic.js';
import { createPayPalOrder, capturePayPalOrder } from './paypal.js';
import { toStaff, toUser } from './socket.js';

export const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const auth = (...roles) => (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || '').slice(7), process.env.JWT_SECRET);
  } catch { return res.status(401).json({ error: 'No autenticado' }); }
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Prohibido' });
  next();
};
const sign = (u) => jwt.sign({ id: String(u._id), role: u.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
const summary = (o) => ({ id: o._id, status: o.status, totalCents: o.totalCents, createdAt: o.createdAt,
  items: o.items.map((i) => ({ title: i.title, qty: i.qty })) });

// ---- Auth ----
router.post('/auth/register', wrap(async (req, res) => {
  const d = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }).parse(req.body);
  if (await User.exists({ email: d.email.toLowerCase() })) return res.status(409).json({ error: 'Correo ya registrado' });
  const u = await User.create({ name: d.name, email: d.email, passwordHash: await bcrypt.hash(d.password, 10), role: 'cliente' });
  res.status(201).json({ token: sign(u), user: { name: u.name, role: u.role } });
}));
router.post('/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), wrap(async (req, res) => {
  const d = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
  const u = await User.findOne({ email: d.email.toLowerCase() });
  if (!u || !(await bcrypt.compare(d.password, u.passwordHash))) return res.status(401).json({ error: 'Credenciales inválidas' });
  res.json({ token: sign(u), user: { name: u.name, role: u.role } });
}));

// ---- Catálogo y stock ----
router.get('/books', wrap(async (req, res) => {
  const q = { active: true }; if (req.query.category) q.category = String(req.query.category);
  res.json(await Book.find(q).sort('title'));
}));
const bookSchema = z.object({ title: z.string().min(1), author: z.string().optional(), description: z.string().optional(),
  category: z.string().optional(), priceCents: z.number().int().positive(), stock: z.number().int().min(0),
  coverUrl: z.string().url().optional(), active: z.boolean().optional() });
router.post('/books', auth('gestor'), wrap(async (req, res) => res.status(201).json(await Book.create(bookSchema.parse(req.body)))));
router.put('/books/:id', auth('gestor'), wrap(async (req, res) =>
  res.json(await Book.findByIdAndUpdate(req.params.id, bookSchema.partial().parse(req.body), { new: true }))));

// ---- Pedidos ----
router.post('/orders', auth('cliente'), wrap(async (req, res) => {
  const d = z.object({ items: z.array(z.object({ bookId: z.string(), qty: z.number() })).min(1),
    shipping: z.object({ name: z.string().min(2), email: z.string().email(), address: z.string().min(5), city: z.string().min(2) }) }).parse(req.body);
  const books = await Book.find({ _id: { $in: d.items.map((i) => i.bookId) } });
  const { lines, totalCents } = calcTotal(d.items, books);
  const o = await Order.create({ user: req.user.id, items: lines, shipping: d.shipping, totalCents });
  res.status(201).json(summary(o));
}));
router.get('/orders/me', auth('cliente'), wrap(async (req, res) =>
  res.json((await Order.find({ user: req.user.id, status: { $ne: 'PENDIENTE_PAGO' } }).sort('-createdAt')).map(summary))));
router.get('/orders', auth('gestor'), wrap(async (req, res) =>
  res.json(await Order.find({ status: { $ne: 'PENDIENTE_PAGO' } }).sort('-createdAt'))));
router.patch('/orders/:id/status', auth('gestor'), wrap(async (req, res) => {
  const { status } = z.object({ status: z.enum(['PROCESANDO', 'ENVIADO', 'ENTREGADO']) }).parse(req.body);
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ error: 'No existe' });
  if (!canTransition(o.status, status)) return res.status(409).json({ error: `Transición inválida (siguiente: ${FLOW[o.status] || 'ninguna'})` });
  o.status = status; await o.save();
  toUser(o.user, 'order:updated', summary(o)); toStaff('order:statusChanged', o);
  res.json(o);
}));

// ---- Pagos PayPal ----
const ownOrder = async (req, res) => {
  const { orderId } = z.object({ orderId: z.string() }).parse(req.body);
  const o = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!o) res.status(404).json({ error: 'Pedido no encontrado' });
  return o;
};
router.post('/payments/paypal/order', auth('cliente'), wrap(async (req, res) => {
  const o = await ownOrder(req, res); if (!o) return;
  if (o.status !== 'PENDIENTE_PAGO') return res.status(409).json({ error: 'Pedido ya pagado' });
  let p = await Payment.findOne({ order: o._id });
  if (!p) { const pp = await createPayPalOrder(o);
    p = await Payment.create({ order: o._id, providerOrderId: pp.id, amountCents: o.totalCents }); }
  res.json({ id: p.providerOrderId });
}));
router.post('/payments/paypal/capture', auth('cliente'), wrap(async (req, res) => {
  const o = await ownOrder(req, res); if (!o) return;
  const p = await Payment.findOne({ order: o._id });
  if (!p) return res.status(409).json({ error: 'Pago no iniciado' });
  if (p.status === 'CAPTURED') return res.json(summary(o));          // idempotente
  p.captureId = await capturePayPalOrder(p.providerOrderId, o);        // lanza error si no coincide
  p.status = 'CAPTURED'; await p.save();
  const paid = await Order.findOneAndUpdate({ _id: o._id, status: 'PENDIENTE_PAGO' }, { status: 'PAGADO' }, { new: true });
  if (paid) {
    for (const i of paid.items) await Book.updateOne({ _id: i.book, stock: { $gte: i.qty } }, { $inc: { stock: -i.qty } });
    toStaff('order:created', paid); toUser(paid.user, 'order:updated', summary(paid));
  }
  res.json(summary(paid || o));
}));
