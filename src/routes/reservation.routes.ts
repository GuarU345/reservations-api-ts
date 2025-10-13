import { Router } from "express"
import { reservationController } from "../controllers/reservation.controller"
import { authenticate } from "../middlewares/authenticate"

const router = Router()

router.get("/reservations", authenticate, reservationController.getReservations)
router.post("/reservations", authenticate, reservationController.createReservation)
router.post("/reservations/:id/cancel", authenticate, reservationController.cancelReservation)

export { router as reservationRoutes }