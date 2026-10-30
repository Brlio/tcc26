import bcrypt from 'bcrypt';
import { buscarUsuarioPorEmail, buscarUsuarioPorId, listarUsuarios as listarRepo, inserirUsuario, atualizarUsuario as atualizarRepo } from '../repository/usuario.repository.js';
import { httpError } from '../http-error.js';

export async function listarUsuarios() {
 return listarRepo();
}

export async function obterUsuario(id) {
 const usuario = await buscarUsuarioPorId(id);
 if (!usuario) throw httpError(404, 'Usuário não encontrado.');
 const { senhaHash, ...publico } = usuario;
 return publico;
}

export async function criarUsuario(dados) {
 const existente = await buscarUsuarioPorEmail(dados.email);
 if (existente) throw httpError(409, 'E-mail já cadastrado.');
 const senhaHash = await bcrypt.hash(dados.senha, 10);
 const { senha, ...rest } = dados;
 const criado = await inserirUsuario({ ...rest, senhaHash });
 const { senhaHash: _, ...publico } = criado;
 return publico;
}

export async function editarUsuario(id, dados) {
 const existente = await buscarUsuarioPorId(id);
 if (!existente) throw httpError(404, 'Usuário não encontrado.');
 if (dados.email && dados.email !== existente.email) {
   const emailDuplicado = await buscarUsuarioPorEmail(dados.email);
   if (emailDuplicado) throw httpError(409, 'E-mail já cadastrado.');
 }
 const updateData = { ...dados };
 if (updateData.senha) {
   updateData.senhaHash = await bcrypt.hash(updateData.senha, 10);
   delete updateData.senha;
 }
 const atualizado = await atualizarRepo(id, updateData);
 const { senhaHash: _, ...publico } = atualizado;
 return publico;
}

export async function alterarStatusUsuario(id, ativo) {
 const atualizado = await atualizarRepo(id, { ativo });
 if (!atualizado) throw httpError(404, 'Usuário não encontrado.');
 const { senhaHash: _, ...publico } = atualizado;
 return publico;
}