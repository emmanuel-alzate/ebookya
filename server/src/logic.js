// Lógica pura (sin DB) para poder probarla fácilmente.
export const FLOW = { PAGADO: 'PROCESANDO', PROCESANDO: 'ENVIADO', ENVIADO: 'ENTREGADO' };
export const canTransition = (from, to) => FLOW[from] === to;
export const money = (cents) => (cents / 100).toFixed(2);

export function calcTotal(items, books) {
  if (!Array.isArray(items) || !items.length) throw new Error('Carrito vacío');
  const merged = new Map();
  for (const { bookId, qty } of items) {
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) throw new Error('Cantidad inválida');
    merged.set(String(bookId), (merged.get(String(bookId)) || 0) + qty);
  }
  const byId = new Map(books.map((b) => [String(b._id), b]));
  let totalCents = 0;
  const lines = [];
  for (const [id, qty] of merged) {
    const b = byId.get(id);
    if (!b || !b.active) throw new Error('Libro no disponible');
    if (b.stock < qty) throw new Error(`Sin stock: ${b.title}`);
    totalCents += b.priceCents * qty; // precio SIEMPRE desde la base de datos
    lines.push({ book: b._id, title: b.title, priceCents: b.priceCents, qty });
  }
  return { lines, totalCents };
}
