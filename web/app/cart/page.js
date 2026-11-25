'use client';
import { useEffect, useRef, useState } from 'react';
import { api, getCart, setCart, money, session } from '../../lib/api';
export default function Cart() {
  const [cart, setC] = useState([]); const [ship, setShip] = useState({ name: '', email: '', address: '', city: '' });
  const [orderId, setOrderId] = useState(null); const [err, setErr] = useState(''); const box = useRef(null);
  useEffect(() => setC(getCart()), []);
  const total = cart.reduce((a, i) => a + i.priceCents * i.qty, 0);  // solo informativo: el servidor recalcula
  const upd = (c) => { setC(c); setCart(c); };
  const create = async () => { setErr('');
    if (!session()) return (location.href = '/login');
    try { const o = await api('/orders', { method: 'POST', body: { items: cart.map(({ bookId, qty }) => ({ bookId, qty })), shipping: ship } }); setOrderId(o.id); }
    catch (e) { setErr(e.message); } };
  useEffect(() => { if (!orderId) return;
    const mount = () => window.paypal.Buttons({
      createOrder: async () => (await api('/payments/paypal/order', { method: 'POST', body: { orderId } })).id,
      onApprove: async () => { await api('/payments/paypal/capture', { method: 'POST', body: { orderId } }); setCart([]); location.href = '/orders'; },
      onError: () => setErr('No se pudo completar el pago. Puedes reintentar.') }).render(box.current);
    if (window.paypal) return mount();
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`; s.onload = mount; document.body.append(s); }, [orderId]);
  if (!cart.length) return <h1>Carrito vacío</h1>;
  return (<><h1>Carrito</h1>
    {cart.map((i, n) => (<div className="card" key={i.bookId}>{i.title} — {money(i.priceCents)} ×{' '}
      <input type="number" min="1" max="10" value={i.qty} disabled={!!orderId} style={{ width: 60 }}
        onChange={(e) => upd(cart.map((x, m) => (m === n ? { ...x, qty: Math.max(1, Math.min(10, +e.target.value || 1)) } : x)))} />{' '}
      <button disabled={!!orderId} onClick={() => upd(cart.filter((_, m) => m !== n))}>Quitar</button></div>))}
    <h3>Total: {money(total)}</h3>
    <div style={{ display: 'grid', gap: '.5rem', maxWidth: 400 }}>
      {['name', 'email', 'address', 'city'].map((k) => (<input key={k} placeholder={{ name: 'Nombre', email: 'Correo de entrega', address: 'Dirección', city: 'Ciudad' }[k]}
        value={ship[k]} disabled={!!orderId} onChange={(e) => setShip({ ...ship, [k]: e.target.value })} />))}
      {err && <span className="err">{err}</span>}
      {!orderId && <button onClick={create}>Continuar al pago</button>}<div ref={box} /></div></>);
}
