import jwt from 'jsonwebtoken';
import { httpError } from '../http-error.js';

export function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(httpError(401, 'Token não fornecido.'));
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return next(httpError(401, 'Erro no token.'));
  }
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return next(httpError(401, 'Token mal formatado.'));
  }
  jwt.verify(token, process.env.JWT_SECRET || 'segredo_padrao', (err, decoded) => {
    if (err) {
      return next(httpError(401, 'Token inválido.'));
    }
    req.usuario = decoded;
    return next();
  });
}

export function apenasAdmin(req, res, next) {
  if (req.usuario?.perfil !== 'admin') {
    return next(httpError(403, 'Acesso negado. Apenas administradores.'));
  }
  return next();
}