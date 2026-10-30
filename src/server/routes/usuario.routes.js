import { Router } from 'express';
import * as ctrl from '../controllers/usuario.controllers.js';
import { autenticar, apenasAdmin } from '../middleware/auth.middleware.js';

const router = Router();
router.use(autenticar, apenasAdmin);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obter);
router.post('/', ctrl.criar);
router.patch('/:id', ctrl.editar);
router.delete('/:id', ctrl.desativar);
router.patch('/:id/ativar', ctrl.ativar);
export default router;