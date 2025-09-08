import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import {validateRequest} from "../../middleware/validateRequest";
import { loginZodSchema } from "./auth.validation";

const router = Router()

router.post('/login', validateRequest(loginZodSchema), AuthControllers.credentialsLogin);
router.post('/refresh-token', AuthControllers.getNewAccessToken);

export const authRouters = router