import { Router } from "express";
import { UserControllers } from "./user.controller";
import  { validateRequest }  from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";

const router = Router()

router.post('/register', validateRequest(createUserZodSchema), UserControllers.createUser)
router.get('/all-users', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers)
router.patch('/:id', validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)

export const UserRouters = router
