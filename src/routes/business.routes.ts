import { Router } from "express"
import { businessController } from "../controllers/business.controller"
import { authenticate } from "../middlewares/authenticate"

const router = Router()

router.get("/businesses", authenticate, businessController.getBusinesses)
router.get("/businesses/:id", authenticate, businessController.getBusinessById)
router.post("/businesses", authenticate, businessController.createBusiness)
router.put("/businesses/:id", authenticate, businessController.updateBusiness)
router.delete("/businesses/:id", authenticate, businessController.deleteBusiness)

export { router as businessRoutes }