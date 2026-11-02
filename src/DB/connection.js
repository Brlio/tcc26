import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { usuariosTable } from './schemas/usuario.js';
import { estoquesTable } from './schemas/estoque.js';
import { produtosTable } from './schemas/produto.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
 throw new Error('DATABASE_URL não está definida no .env.');
}

const client = neon(databaseUrl);

export const db = drizzle({
 client,
 schema: { usuariosTable, estoquesTable, produtosTable },
});