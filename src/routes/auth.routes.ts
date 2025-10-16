import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/signup", authController.signup)
router.post("/signin", authController.signin)
router.delete("/logout", authenticate, authController.logout)
router.get("/session/active", authController.isActiveToken)

export { router as authRoutes }