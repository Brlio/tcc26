import { and, asc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../../DB/connection.js';
import { produtosTable } from '../../DB/schemas/produto.js';

export async function buscarProdutoPorId(id) {
 const [row] = await db.select().from(produtosTable).where(eq(produtosTable.id, id)).limit(1);
 return row ?? null;
}

export async function listarProdutos({ q, estoqueId, incluirInativos, limit, offset }) {
 const filtros = [];
 if (!incluirInativos) filtros.push(eq(produtosTable.ativo, true));
 if (estoqueId) filtros.push(eq(produtosTable.estoqueId, estoqueId));
 if (q) filtros.push(or(ilike(produtosTable.nome, `%${q}%`), ilike(produtosTable.codigoDeBarras, `%${q}%`)));
 const where = filtros.length ? and(...filtros) : undefined;
 return db.select().from(produtosTable).where(where).orderBy(asc(produtosTable.nome)).limit(limit).offset(offset);
}

export async function inserirProduto(values) {
 const [row] = await db.insert(produtosTable).values(values).returning();
 return row;
}

export async function atualizarProduto(id, values) {
 const [row] = await db.update(produtosTable).set({ ...values, atualizadoEm: new Date() })
 .where(eq(produtosTable.id, id)).returning();
 return row ?? null;
}

export async function movimentarProduto(id, alteracao) {
 const [row] = await db.update(produtosTable).set({
 quantidade: sql`${produtosTable.quantidade} + ${alteracao}`,
 atualizadoEm: new Date(),
 }).where(and(
 eq(produtosTable.id, id),
 eq(produtosTable.ativo, true),
 sql`${produtosTable.quantidade} + ${alteracao} >= 0`,
 )).returning();
 return row ?? null;
}