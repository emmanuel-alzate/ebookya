'use client';
import { io } from 'socket.io-client';
export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const session = () => { try { return JSON.parse(localStorage.getItem('session')); } catch { return null; } };
export const setSession = (s) => (s ? localStorage.setItem('session', JSON.stringify(s)) : localStorage.removeItem('session'));
export const getCart = () => { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } };
export const setCart = (c) => localStorage.setItem('cart', JSON.stringify(c));
export const money = (c) => `$${(c / 100).toFixed(2)}`;
export async function api(path, { method = 'GET', body } = {}) {
  const s = session();
  const r = await fetch(`${API}/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(s ? { Authorization: `Bearer ${s.token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
}
export const connectSocket = () => io(API, { auth: { token: session()?.token } });
