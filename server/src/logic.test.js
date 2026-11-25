import test from 'node:test';
import assert from 'node:assert/strict';
import { calcTotal, canTransition } from './logic.js';
const books = [{ _id: 'a', title: 'A', priceCents: 1000, stock: 3, active: true },
               { _id: 'b', title: 'B', priceCents: 550, stock: 0, active: true }];
test('recalcula total con precios del servidor', () => {
  assert.equal(calcTotal([{ bookId: 'a', qty: 2 }], books).totalCents, 2000);
});
test('une líneas duplicadas y valida stock', () => {
  assert.throws(() => calcTotal([{ bookId: 'a', qty: 2 }, { bookId: 'a', qty: 2 }], books), /Sin stock/);
});
test('rechaza cantidades inválidas, carrito vacío y libro agotado', () => {
  assert.throws(() => calcTotal([{ bookId: 'a', qty: -1 }], books), /Cantidad/);
  assert.throws(() => calcTotal([], books), /vacío/);
  assert.throws(() => calcTotal([{ bookId: 'b', qty: 1 }], books), /Sin stock/);
});
test('máquina de estados no permite saltos', () => {
  assert.ok(canTransition('PAGADO', 'PROCESANDO'));
  assert.ok(!canTransition('PAGADO', 'ENTREGADO'));
  assert.ok(!canTransition('PENDIENTE_PAGO', 'PAGADO'));
});
