import { Router } from "express";
import { userController } from "../controllers/user.controller";

const router = Router();

router.post("/signup", userController.signup)
router.post("/signin", userController.signin)

export { router as authRoutes }