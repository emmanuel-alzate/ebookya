import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Book } from './models.js';
const pass = process.env.SEED_PASSWORD; if (!pass) throw new Error('Define SEED_PASSWORD');
await mongoose.connect(process.env.MONGODB_URI);
const passwordHash = await bcrypt.hash(pass, 10);
for (const u of [{ name: 'Gestor', email: 'gestor@ebookya.test', role: 'gestor' }, { name: 'Cliente Demo', email: 'cliente@ebookya.test', role: 'cliente' }])
  await User.updateOne({ email: u.email }, { ...u, passwordHash }, { upsert: true });
await Book.deleteMany({});
await Book.insertMany([
  ['Fundamentos de Sistemas de Información', 'A. Autor', 'Tecnología', 1999, 50],
  ['Bases de Datos con MongoDB', 'B. Autora', 'Tecnología', 1499, 30],
  ['Cien años de soledad (edición demo)', 'G. García', 'Novela', 899, 100],
  ['Introducción a la IA', 'C. Autor', 'Ciencia', 2499, 20],
  ['Cocina colombiana', 'D. Chef', 'Cocina', 1299, 15],
].map(([title, author, category, priceCents, stock]) => ({ title, author, category, priceCents, stock, description: `${title} — libro electrónico (PDF/EPUB).` })));
console.log('Seed listo'); await mongoose.disconnect();
