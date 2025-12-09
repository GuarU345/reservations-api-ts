import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/signup", authController.signup)
router.post("/signin", authController.signin)
router.post("/logout", authenticate, authController.logout)
router.get("/session/active", authController.isActiveToken)
router.post("/verify", authController.verifyCode);

export { router as authRoutes }