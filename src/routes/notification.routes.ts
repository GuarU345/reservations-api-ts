import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router()

router.post("/notifications/subscribe", authenticate, notificationController.subscribe)

export { router as notificationRoutes }