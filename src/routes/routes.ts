import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { businessCategoryRoutes } from "./business-category.routes";
import { businessRoutes } from "./business.routes";

export const router = Router();

router.use(authRoutes)
router.use(businessCategoryRoutes)
router.use(businessRoutes)