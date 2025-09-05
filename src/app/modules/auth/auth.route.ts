import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { loginZodSchema } from "./auth.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

const router = Router()

router.post('/login', AuthControllers.credentialsLogin);
router.post('/refresh-token', AuthControllers.getNewAccessToken)
router.post('/logout', AuthControllers.logOut)
router.post('/reset-password',checkAuth(...Object.values(Role)), AuthControllers.resetPassword)


export const authRouters = router