import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usuariosTable } from './usuario.js';
export const estoquesTable = pgTable('estoque', {
 id: uuid('id').primaryKey().defaultRandom(),
 nome: varchar('nome', { length: 120 }).notNull(),
 descricao: text('descricao'),
 ativo: boolean('ativo').notNull().default(true),
 usuarioId: uuid('usuario_id').references(() => usuariosTable.id, { onDelete: 'set null' }),
 criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
 atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});