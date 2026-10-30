import { asc, eq } from 'drizzle-orm';
import { db } from '../../DB/connection.js';
import { usuariosTable } from '../../DB/schemas/usuario.js';

const camposPublicos = {
 id: usuariosTable.id, nome: usuariosTable.nome, email: usuariosTable.email,
 perfil: usuariosTable.perfil, ativo: usuariosTable.ativo, criadoEm: usuariosTable.criadoEm,
};

export async function buscarUsuarioPorEmail(email) {
 const [row] = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email)).limit(1);
 return row ?? null;
}

export async function buscarUsuarioPorId(id) {
 const [row] = await db.select().from(usuariosTable).where(eq(usuariosTable.id, id)).limit(1);
 return row ?? null;
}

export function listarUsuarios() {
 return db.select(camposPublicos).from(usuariosTable).orderBy(asc(usuariosTable.nome));
}

export async function inserirUsuario(values) {
 const [row] = await db.insert(usuariosTable).values(values).returning();
 return row;
}

export async function atualizarUsuario(id, values) {
 const [row] = await db.update(usuariosTable).set({ ...values, atualizadoEm: new Date() })
 .where(eq(usuariosTable.id, id)).returning();
 return row ?? null;
}