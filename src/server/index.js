import 'dotenv/config';
import bcrypt from 'bcrypt';
import app from './app.js';
import { db } from '../DB/connection.js';
import { usuariosTable } from '../DB/schemas/usuario.js';
import { eq } from 'drizzle-orm';

const PORT = process.env.PORT || 3000;

async function seedAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Defina ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD no .env.');
  }

  const [existente] = await db
    .select()
    .from(usuariosTable)
    .where(eq(usuariosTable.email, ADMIN_EMAIL))
    .limit(1);

  if (!existente) {
    const senhaHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.insert(usuariosTable).values({
      nome: ADMIN_NAME,
      email: ADMIN_EMAIL,
      senhaHash,
      perfil: 'admin',
      ativo: true,
    });
    console.log(`[Seed] Administrador ${ADMIN_EMAIL} criado com sucesso.`);
  }
}

async function start() {
  try {
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

start();