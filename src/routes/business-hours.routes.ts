import { Router } from "express";
import { businessHoursController } from "../controllers/business-hours.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.put("/business-hours/:id", authenticate, businessHoursController.updateBusinessHours);

export { router as businessHoursRoutes };
