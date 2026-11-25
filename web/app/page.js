'use client';
import { useEffect, useState } from 'react';
import { api, getCart, setCart, money } from '../lib/api';
export default function Catalog() {
  const [books, setBooks] = useState([]); const [cat, setCat] = useState(''); const [msg, setMsg] = useState('');
  useEffect(() => { api(`/books${cat ? `?category=${encodeURIComponent(cat)}` : ''}`).then(setBooks).catch((e) => setMsg(e.message)); }, [cat]);
  const add = (b) => { const c = getCart(); const i = c.find((x) => x.bookId === b._id);
    i ? (i.qty = Math.min(10, i.qty + 1)) : c.push({ bookId: b._id, title: b.title, priceCents: b.priceCents, qty: 1 }); setCart(c); setMsg(`“${b.title}” añadido`); };
  return (<><h1>Catálogo</h1>
    <select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Todas</option>
      {['Tecnología', 'Novela', 'Ciencia', 'Cocina'].map((c) => <option key={c}>{c}</option>)}</select>
    <p>{msg}</p>
    <div className="grid">{books.map((b) => (<div className="card" key={b._id}><h3>{b.title}</h3><small>{b.author} · {b.category}</small>
      <p>{b.description}</p><b>{money(b.priceCents)}</b> <small>({b.stock} licencias)</small><br />
      <button disabled={b.stock < 1} onClick={() => add(b)}>{b.stock < 1 ? 'Agotado' : 'Añadir'}</button></div>))}</div></>);
}
