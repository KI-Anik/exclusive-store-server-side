import { Router } from "express";
import { UserControllers } from "./user.controller";
import  validateRequest  from "../../middleware/validateRequest";
import { createUserZodSchema } from "./user.validation";

const router = Router()

router.post('/register', validateRequest(createUserZodSchema), UserControllers.createUser)
router.get('/all-users', UserControllers.getAllUsers)
export const UserRouters = router
