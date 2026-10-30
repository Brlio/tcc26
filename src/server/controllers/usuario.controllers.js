import { z } from 'zod';
import * as usuarioService from '../services/usuario.service.js';

const criarSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(6),
  perfil: z.enum(['admin', 'operador']).optional(),
});

const editarSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  perfil: z.enum(['admin', 'operador']).optional(),
  ativo: z.boolean().optional(),
});

export async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.json({ data: usuarios });
  } catch (err) {
    next(err);
  }
}

export async function obter(req, res, next) {
  try {
    const usuario = await usuarioService.obterUsuario(req.params.id);
    res.json({ data: usuario });
  } catch (err) {
    next(err);
  }
}

export async function criar(req, res, next) {
  try {
    const dados = criarSchema.parse(req.body);
    const usuario = await usuarioService.criarUsuario(dados);
    res.status(201).json({ data: usuario });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const dados = editarSchema.parse(req.body);
    const usuario = await usuarioService.editarUsuario(req.params.id, dados);
    res.json({ data: usuario });
  } catch (err) {
    next(err);
  }
}

export async function desativar(req, res, next) {
  try {
    const usuario = await usuarioService.alterarStatusUsuario(req.params.id, false);
    res.json({ data: usuario });
  } catch (err) {
    next(err);
  }
}

export async function ativar(req, res, next) {
  try {
    const usuario = await usuarioService.alterarStatusUsuario(req.params.id, true);
    res.json({ data: usuario });
  } catch (err) {
    next(err);
  }
}