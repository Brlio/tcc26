import { boolean, check, integer, numeric, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { estoquesTable } from './estoque.js';
export const produtosTable = pgTable('produto', {
 id: uuid('id').primaryKey().defaultRandom(),
 nome: varchar('nome', { length: 160 }).notNull(),
 codigoDeBarras: varchar('codigo_de_barras', { length: 64 }).notNull(),
 quantidade: integer('quantidade').notNull().default(0),
 preco: numeric('preco', { precision: 12, scale: 2 }).notNull(),
 estoqueId: uuid('estoque_id').notNull().references(() => estoquesTable.id, { onDelete: 'restrict' }),
 ativo: boolean('ativo').notNull().default(true),
 criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
 atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
 uniqueIndex('produto_codigo_de_barras_unique').on(table.codigoDeBarras),
 check('produto_quantidade_nao_negativa', sql`${table.quantidade} >= 0`),
 check('produto_preco_nao_negativo', sql`${table.preco} >= 0`),
]);