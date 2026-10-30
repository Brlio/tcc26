import { buscarEstoquePorId, listarEstoques as listarRepo, inserirEstoque, atualizarEstoque as atualizarRepo } from '../repository/estoque.repository.js';
import { httpError } from '../http-error.js';

export async function listarEstoques(apenasAtivos) {
 return listarRepo(apenasAtivos);
}

export async function obterEstoque(id) {
 const estoque = await buscarEstoquePorId(id);
 if (!estoque) throw httpError(404, 'Estoque não encontrado.');
 return estoque;
}

export function criarEstoque(dados, usuarioId) {
 return inserirEstoque({ ...dados, usuarioId });
}

export async function editarEstoque(id, dados) {
 const atualizado = await atualizarRepo(id, dados);
 if (!atualizado) throw httpError(404, 'Estoque não encontrado.');
 return atualizado;
}

export async function alterarStatusEstoque(id, ativo) {
 const atualizado = await atualizarRepo(id, { ativo });
 if (!atualizado) throw httpError(404, 'Estoque não encontrado.');
 return atualizado;
}

export async function exigirEstoqueAtivo(id) {
 const estoque = await buscarEstoquePorId(id);
 if (!estoque || !estoque.ativo) throw httpError(400, 'O estoque não existe ou está inativo.');
 return estoque;
}