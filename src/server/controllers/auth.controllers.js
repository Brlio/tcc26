import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { buscarUsuarioPorEmail } from '../repository/usuario.repository.js';
import { httpError } from '../http-error.js';

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function login(req, res, next) {
  try {
    const dados = loginSchema.parse(req.body);
    const usuario = await buscarUsuarioPorEmail(dados.email);
    if (!usuario || !usuario.ativo) {
      throw httpError(401, 'Credenciais inválidas.');
    }
    const senhaValida = await bcrypt.compare(dados.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw httpError(401, 'Credenciais inválidas.');
    }
    const tokenPayload = { id: usuario.id, perfil: usuario.perfil };
    const secret = process.env.JWT_SECRET || 'segredo_padrao';
    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
    res.json({
      token,
      tokenType: 'Bearer',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    });
  } catch (err) {
    next(err);
  }
}