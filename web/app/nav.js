'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { session, setSession } from '../lib/api';
export default function Nav() {
  const [s, setS] = useState(null);
  useEffect(() => setS(session()), []);
  return (<nav><b>EbookYa</b><Link href="/">Catálogo</Link><Link href="/cart">Carrito</Link>
    {s?.user.role === 'cliente' && <Link href="/orders">Mis pedidos</Link>}
    {s?.user.role === 'gestor' && <Link href="/admin">Gestión</Link>}
    {s ? <a href="/" onClick={() => { setSession(null); }}>Salir ({s.user.name})</a> : <Link href="/login">Ingresar</Link>}</nav>);
}
