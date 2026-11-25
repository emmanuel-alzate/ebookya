import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { router } from './routes.js';
import { initSocket } from './socket.js';

for (const k of ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_ORIGIN']) if (!process.env[k]) { console.error(`Falta variable ${k}`); process.exit(1); }
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', router);
app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ error: 'Datos inválidos', detail: err.issues.map((i) => i.message) });
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message === 'El pago no coincide con el pedido' || /^Sin stock|inválida|vacío|no disponible/.test(err.message) ? err.message : 'Error interno' });
});
const server = http.createServer(app);
initSocket(server);
await mongoose.connect(process.env.MONGODB_URI).catch(() => { console.error('No se pudo conectar a MongoDB'); process.exit(1); });
console.log('MongoDB conectado');
server.listen(process.env.PORT || 4000, '0.0.0.0', () => console.log('API lista'));
