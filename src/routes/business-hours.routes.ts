import { Router } from "express";
import { businessHoursController } from "../controllers/business-hours.controller";

const router = Router();

router.put("/business-hours/:id", businessHoursController.updateBusinessHours);

export { router as businessHoursRoutes };
