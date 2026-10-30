import { boolean, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
export const perfilUsuarioEnum = pgEnum('perfil_usuario', ['admin', 'operador']);
export const usuariosTable = pgTable('usuario', {
 id: uuid('id').primaryKey().defaultRandom(),
 nome: varchar('nome', { length: 120 }).notNull(),
 email: varchar('email', { length: 255 }).notNull(),
 senhaHash: text('senha_hash').notNull(),
 perfil: perfilUsuarioEnum('perfil').notNull().default('operador'),
 ativo: boolean('ativo').notNull().default(true),
 criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
 atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('usuario_email_unique').on(table.email)]);