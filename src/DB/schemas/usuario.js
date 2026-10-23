import { integer, pgTable, varchar, text, uuid} from "drizzle-orm/pg-core";
export const usersTable = pgTable("estoque", {
  id: uuid().primaryKey().defaultRandom(),
 nome: varchar().notNull(),
  email: varchar().notNull(),
  senha: varchar().notNull(),
});