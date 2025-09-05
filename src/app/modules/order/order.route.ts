import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { OrderValidation } from './order.validation';
import { OrderControllers } from './order.controller';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../user/user.interface';

const router = Router();

router.post(
  '/',
  checkAuth(Role.USER),
  validateRequest(OrderValidation.createOrderZodSchema),
  OrderControllers.createOrder,
);

router.get(
  '/',
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  OrderControllers.getAllOrders,
);

router.get(
  '/:id',
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  OrderControllers.getSingleOrder,
);

router.patch(
  '/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(OrderValidation.updateOrderZodSchema),
  OrderControllers.updateOrderStatus,
);

export const OrderRouters = router;
