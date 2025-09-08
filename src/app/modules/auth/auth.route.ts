import { Router } from "express";
import { authControllers } from "./auth.controller";
import {validateRequest} from "../../middleware/validateRequest";
import { loginZodSchema } from "./auth.validation";

const router = Router()

router.post('/login', validateRequest(loginZodSchema), authControllers.credentialsLogin)

export const authRouters = router