import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { businessCategoryRoutes } from "./business-category.routes";

export const router = Router();

router.use(authRoutes)
router.use(businessCategoryRoutes)