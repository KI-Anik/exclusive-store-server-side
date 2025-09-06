import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createProductZodSchema,
  updateProductZodSchema,
  objectIdValidationSchema,
} from './product.validation';
import { ProductControllers } from './product.controller';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../user/user.interface';

const router = Router();


router.post(
  '/',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createProductZodSchema),
  ProductControllers.createProduct,
);

router.get('/', ProductControllers.getAllProducts);

router.get(
  '/:id',
  ProductControllers.getSingleProduct,
);

router.patch(
  '/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateProductZodSchema.merge(objectIdValidationSchema)),
  ProductControllers.updateProduct,
);

router.delete(
  '/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(objectIdValidationSchema),
  ProductControllers.deleteProduct,
);

export const ProductRouters = router;