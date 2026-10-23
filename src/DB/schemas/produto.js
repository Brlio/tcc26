import { integer, pgTable, varchar, text, uuid, real} from "drizzle-orm/pg-core";
export const usersTable = pgTable("estoque", {
  id: uuid().primaryKey().defaultRandom(),
 nome: varchar().notNull(),
  codigodebarras: varchar().notNull(),
  quantidade: integer().notNull(),
  preco: real().notNull(),
  estoqueid: varchar().notNull(),
});