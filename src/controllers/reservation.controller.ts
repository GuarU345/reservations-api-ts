import { NextFunction, Request, Response } from "express";
import { reservationService } from "../services/reservation.service";

const getReservations = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req

    try {
        const reservations = await reservationService.getReservations(user)
        return res.json(reservations)
    } catch (error) {
        next(error)
    }
}

export const reservationController = {
    getReservations
}