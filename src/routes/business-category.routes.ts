import { Router } from "express";
import { businessCategoryController } from "../controllers/business-category.controller";

const router = Router();

router.get("/business-categories", businessCategoryController.getBusinessCategories);
router.get("/business-categories/:id", businessCategoryController.getBussinessCategoryById);
router.post("/business-categories", businessCategoryController.createBusinessCategory);
router.put("/business-categories/:id", businessCategoryController.updateBusinessCategory);
router.delete("/business-categories/:id", businessCategoryController.deleteBusinessCategory);

export { router as businessCategoryRoutes };