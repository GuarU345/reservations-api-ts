import { Router } from "express";
import { businessCategoryController } from "../controllers/business-category.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/business-categories", authenticate, businessCategoryController.getBusinessCategories);
router.get("/business-categories/:id", authenticate, businessCategoryController.getBussinessCategoryById);
router.post("/business-categories", authenticate, businessCategoryController.createBusinessCategory);
router.put("/business-categories/:id", authenticate, businessCategoryController.updateBusinessCategory);
router.delete("/business-categories/:id", authenticate, businessCategoryController.deleteBusinessCategory);

export { router as businessCategoryRoutes };