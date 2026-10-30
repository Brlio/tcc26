import { z } from 'zod';
import * as estoqueService from '../services/estoque.service.js';

const criarSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
});

const editarSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
});

export async function listar(req, res, next) {
  try {
    const apenasAtivos = req.query.ativo === 'true';
    const estoques = await estoqueService.listarEstoques(apenasAtivos);
    res.json({ data: estoques });
  } catch (err) {
    next(err);
  }
}

export async function obter(req, res, next) {
  try {
    const estoque = await estoqueService.obterEstoque(req.params.id);
    res.json({ data: estoque });
  } catch (err) {
    next(err);
  }
}

export async function criar(req, res, next) {
  try {
    const dados = criarSchema.parse(req.body);
    const usuarioId = req.usuario.id;
    const estoque = await estoqueService.criarEstoque(dados, usuarioId);
    res.status(201).json({ data: estoque });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const dados = editarSchema.parse(req.body);
    const estoque = await estoqueService.editarEstoque(req.params.id, dados);
    res.json({ data: estoque });
  } catch (err) {
    next(err);
  }
}