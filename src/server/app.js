import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import estoqueRoutes from './routes/estoque.routes.js';
import produtoRoutes from './routes/produto.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/estoques', estoqueRoutes);
app.use('/api/produtos', produtoRoutes);

// Middleware de Erro
app.use(errorHandler);

export default app;