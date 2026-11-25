'use client';
import { useState } from 'react';
import { api, setSession } from '../../lib/api';
export default function Login() {
  const [mode, setMode] = useState('login'); const [f, setF] = useState({ name: '', email: '', password: '' }); const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); setErr('');
    try { const s = await api(`/auth/${mode}`, { method: 'POST', body: f }); setSession(s); location.href = s.user.role === 'gestor' ? '/admin' : '/'; }
    catch (x) { setErr(x.message); } };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<form onSubmit={submit} className="card" style={{ display: 'grid', gap: '.5rem', maxWidth: 360 }}>
    <h1>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
    {mode === 'register' && <input placeholder="Nombre" value={f.name} onChange={set('name')} />}
    <input type="email" placeholder="Correo" value={f.email} onChange={set('email')} />
    <input type="password" placeholder="Contraseña (mín. 8)" value={f.password} onChange={set('password')} />
    {err && <span className="err">{err}</span>}<button>Continuar</button>
    <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}</a></form>);
}
