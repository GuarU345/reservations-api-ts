import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { businessCategoryRoutes } from "./business-category.routes";
import { businessRoutes } from "./business.routes";
import { businessHoursRoutes } from "./business-hours.routes";
import { reservationRoutes } from "./reservation.routes";

export const router = Router();

router.use(authRoutes)
router.use(businessCategoryRoutes)
router.use(businessRoutes)
router.use(businessHoursRoutes)
router.use(reservationRoutes)