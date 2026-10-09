import { integer, pgTable, varchar, text} from "drizzle-orm/pg-core";
export const usersTable = pgTable("estoque", {
  id: varchar().primaryKey(),
 nome: varchar().notNull(),
  descrição: text().notNull(),
  usuario_id: varchar().notNull(),
});