import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const opts = { timestamps: true };
export const User = model('User', new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true }, role: { type: String, enum: ['cliente', 'gestor'], default: 'cliente' } }, opts));
export const Book = model('Book', new Schema({
  title: { type: String, required: true }, author: String, description: String, category: String,
  priceCents: { type: Number, required: true, min: 1 }, stock: { type: Number, default: 0, min: 0 },
  coverUrl: String, active: { type: Boolean, default: true } }, opts));
export const Order = model('Order', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ book: { type: Schema.Types.ObjectId, ref: 'Book' }, title: String, priceCents: Number, qty: Number }],
  shipping: { name: String, email: String, address: String, city: String },
  totalCents: Number,
  status: { type: String, enum: ['PENDIENTE_PAGO', 'PAGADO', 'PROCESANDO', 'ENVIADO', 'ENTREGADO'], default: 'PENDIENTE_PAGO' } }, opts));
export const Payment = model('Payment', new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  provider: { type: String, default: 'paypal' }, providerOrderId: { type: String, unique: true, sparse: true },
  captureId: String, amountCents: Number, currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['CREATED', 'CAPTURED', 'FAILED'], default: 'CREATED' } }, opts));
