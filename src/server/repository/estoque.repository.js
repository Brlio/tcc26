import { asc, eq } from 'drizzle-orm';
import { db } from '../../DB/connection.js';
import { estoquesTable } from '../../DB/schemas/estoque.js';

export async function buscarEstoquePorId(id) {
 const [row] = await db.select().from(estoquesTable).where(eq(estoquesTable.id, id)).limit(1);
 return row ?? null;
}

export async function listarEstoques(apenasAtivos = false) {
 if (apenasAtivos) return db.select().from(estoquesTable).where(eq(estoquesTable.ativo, true)).orderBy(asc(estoquesTable.nome));
 return db.select().from(estoquesTable).orderBy(asc(estoquesTable.nome));
}

export async function inserirEstoque(values) {
 const [row] = await db.insert(estoquesTable).values(values).returning();
 return row;
}

export async function atualizarEstoque(id, values) {
 const [row] = await db.update(estoquesTable).set({ ...values, atualizadoEm: new Date() })
 .where(eq(estoquesTable.id, id)).returning();
 return row ?? null;
}