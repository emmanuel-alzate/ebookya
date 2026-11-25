'use client';
import { useEffect, useState } from 'react';
import { api, connectSocket, money } from '../../lib/api';
export default function Orders() {
  const [orders, setO] = useState([]); const [err, setErr] = useState('');
  const load = () => api('/orders/me').then(setO).catch((e) => setErr(e.message));
  useEffect(() => { load(); const s = connectSocket(); s.on('order:updated', load); s.on('connect', load); return () => s.close(); }, []);
  return (<><h1>Mis pedidos</h1>{err && <p className="err">{err}</p>}
    {orders.map((o) => (<div className="card" key={o.id}><b>{o.status}</b> · {new Date(o.createdAt).toLocaleString()}
      <ul>{o.items.map((i, n) => <li key={n}>{i.qty}× {i.title}</li>)}</ul><b>{money(o.totalCents)}</b></div>))}</>);
}
