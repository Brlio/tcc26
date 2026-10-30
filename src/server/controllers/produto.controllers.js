import { z } from 'zod';
import * as produtoService from '../services/produto.service.js';

const criarSchema = z.object({
  nome: z.string().min(1),
  codigoDeBarras: z.string().min(1),
  quantidade: z.number().int().nonnegative().default(0),
  preco: z.number().nonnegative(),
  estoqueId: z.string().uuid(),
});

const editarSchema = z.object({
  nome: z.string().min(1).optional(),
  codigoDeBarras: z.string().min(1).optional(),
  preco: z.number().nonnegative().optional(),
  estoqueId: z.string().uuid().optional(),
  ativo: z.boolean().optional(),
});

const movimentarSchema = z.object({
  alteracao: z.number().int(),
});

export async function listar(req, res, next) {
  try {
    const { q, estoqueId, ativo, limit = '50', offset = '0' } = req.query;
    const incluirInativos = ativo === 'true' && req.usuario?.perfil === 'admin';
    const produtos = await produtoService.listarProdutos({
      q,
      estoqueId,
      incluirInativos,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    res.json({ data: produtos });
  } catch (err) {
    next(err);
  }
}

export async function obter(req, res, next) {
  try {
    const produto = await produtoService.obterProduto(req.params.id);
    res.json({ data: produto });
  } catch (err) {
    next(err);
  }
}

export async function criar(req, res, next) {
  try {
    const dados = criarSchema.parse(req.body);
    const produto = await produtoService.criarProduto(dados);
    res.status(201).json({ data: produto });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const dados = editarSchema.parse(req.body);
    const produto = await produtoService.editarProduto(req.params.id, dados);
    res.json({ data: produto });
  } catch (err) {
    next(err);
  }
}

export async function movimentar(req, res, next) {
  try {
    const { alteracao } = movimentarSchema.parse(req.body);
    const produto = await produtoService.movimentarProduto(req.params.id, alteracao);
    res.json({ data: produto });
  } catch (err) {
    next(err);
  }
}