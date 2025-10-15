import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get('/like/business', authenticate, userController.getLikedBusinesses)
router.post("/like/business/:businessId", authenticate, userController.likeBusiness)
router.delete("/dislike/business/:businessId", authenticate, userController.dislikeBusiness)

export { router as userRoutes }