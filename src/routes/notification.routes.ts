import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router()

router.post("/notifications/subscribe", authenticate, notificationController.subscribe)
router.get("/notifications/active", authenticate, notificationController.isActiveSubscription)

export { router as notificationRoutes }