import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
let io;
export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_ORIGIN } });
  io.use((socket, next) => {   // autentica el handshake; la sala la decide el servidor
    try { socket.user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET); next(); }
    catch { next(new Error('No autenticado')); }
  });
  io.on('connection', (s) => { s.join(`user:${s.user.id}`); if (s.user.role === 'gestor') s.join('gestores'); });
}
export const toStaff = (ev, payload) => io?.to('gestores').emit(ev, payload);
export const toUser = (userId, ev, payload) => io?.to(`user:${userId}`).emit(ev, payload);
