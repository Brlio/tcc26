import { buscarProdutoPorId, listarProdutos as listarRepo, inserirProduto, atualizarProduto as atualizarRepo, movimentarProduto as movimentarRepo } from '../repository/produto.repository.js';
import { exigirEstoqueAtivo } from './estoque.service.js';
import { httpError } from '../http-error.js';

export function listarProdutos(filtros) {
 return listarRepo(filtros);
}

export async function obterProduto(id) {
 const produto = await buscarProdutoPorId(id);
 if (!produto || !produto.ativo) throw httpError(404, 'Produto não encontrado.');
 return produto;
}

export async function criarProduto(dados) {
 await exigirEstoqueAtivo(dados.estoqueId);
 return inserirProduto({ ...dados, preco: dados.preco.toFixed(2) });
}

export async function editarProduto(id, dados) {
 if (dados.estoqueId) await exigirEstoqueAtivo(dados.estoqueId);
 if (dados.preco !== undefined) dados.preco = dados.preco.toFixed(2);
 const atualizado = await atualizarRepo(id, dados);
 if (!atualizado) throw httpError(404, 'Produto não encontrado.');
 return atualizado;
}

export async function alterarStatusProduto(id, ativo) {
 const atualizado = await atualizarRepo(id, { ativo });
 if (!atualizado) throw httpError(404, 'Produto não encontrado.');
 return atualizado;
}

export async function movimentarProduto(id, alteracao) {
 const atualizado = await movimentarRepo(id, alteracao);
 if (atualizado) return atualizado;
 const existente = await buscarProdutoPorId(id);
 if (!existente) throw httpError(404, 'Produto não encontrado.');
 if (!existente.ativo) throw httpError(409, 'Produto inativo não pode ser movimentado.');
 throw httpError(409, 'A quantidade não pode ficar negativa.');
}