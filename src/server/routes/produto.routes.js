import { Router } from 'express';
import * as ctrl from '../controllers/produto.controllers.js';
import { autenticar, apenasAdmin } from '../middleware/auth.middleware.js';

const router = Router();
router.use(autenticar);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obter);
router.post('/', apenasAdmin, ctrl.criar);
router.patch('/:id', apenasAdmin, ctrl.editar);
router.post('/:id/movimentar', ctrl.movimentar);
export default router;