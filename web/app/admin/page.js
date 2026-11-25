'use client';
import { useEffect, useState } from 'react';
import { api, connectSocket, money, session } from '../../lib/api';
const COLS = ['PAGADO', 'PROCESANDO', 'ENVIADO', 'ENTREGADO']; const NEXT = { PAGADO: 'PROCESANDO', PROCESANDO: 'ENVIADO', ENVIADO: 'ENTREGADO' };
export default function Admin() {
  const [orders, setO] = useState([]); const [books, setB] = useState([]); const [err, setErr] = useState(''); const [live, setLive] = useState(false);
  const load = () => { api('/orders').then(setO).catch((e) => setErr(e.message)); api('/books').then(setB); };
  useEffect(() => { if (session()?.user.role !== 'gestor') { location.href = '/login'; return; }
    load(); const s = connectSocket(); s.on('connect', () => setLive(true)); s.on('disconnect', () => setLive(false));
    ['order:created', 'order:statusChanged'].forEach((e) => s.on(e, load)); return () => s.close(); }, []);
  const move = (o) => api(`/orders/${o._id}/status`, { method: 'PATCH', body: { status: NEXT[o.status] } }).then(load).catch((e) => setErr(e.message));
  const stock = (b, v) => api(`/books/${b._id}`, { method: 'PUT', body: { stock: +v } }).then(load).catch((e) => setErr(e.message));
  return (<><h1>Gestión de envíos {live ? '🟢 en vivo' : '🔴 sin conexión'}</h1>{err && <p className="err">{err}</p>}
    <div className="cols">{COLS.map((c) => (<div key={c}><h3>{c}</h3>
      {orders.filter((o) => o.status === c).map((o) => (<div className="card" key={o._id}><small>#{o._id.slice(-6)}</small> <b>{money(o.totalCents)}</b>
        <ul>{o.items.map((i, n) => <li key={n}>{i.qty}× {i.title}</li>)}</ul><small>{o.shipping.name} · {o.shipping.email}<br />{o.shipping.address}, {o.shipping.city}</small><br />
        {NEXT[c] && <button onClick={() => move(o)}>→ {NEXT[c]}</button>}</div>))}</div>))}</div>
    <h2>Stock de licencias</h2>
    {books.map((b) => (<div key={b._id}>{b.title}: <input type="number" min="0" defaultValue={b.stock} style={{ width: 80 }} onBlur={(e) => +e.target.value !== b.stock && stock(b, e.target.value)} /></div>))}</>);
}
