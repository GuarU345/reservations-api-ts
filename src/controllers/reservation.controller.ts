import { NextFunction, Request, Response } from "express";
import { reservationService } from "../services/reservation.service";
import { cancelReservationSchema, reservationSchema } from "../schemas/reservation-schema";
import { ValidationError } from "../middlewares/error";

const getReservations = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req

    try {
        const reservations = await reservationService.getReservations(user)
        return res.json(reservations)
    } catch (error) {
        next(error)
    }
}

const createReservation = async (req: Request, res: Response, next: NextFunction) => {
    const result = reservationSchema.safeParse(req.body)

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = {
        ...result.data,
        userId: req.user?.id
    }

    try {
        const reservation = await reservationService.createReservation(body)
        return res.status(201).json(reservation)
    } catch (error) {
        next(error)
    }
}

const confirmReservation = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    try {
        await reservationService.confirmReservation(id)
        return res.status(200).json({
            message: "Reservación confirmada correctamente"
        })
    } catch (error) {
        next(error)
    }
}

const cancelReservation = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    const result = cancelReservationSchema.safeParse(req.body)

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = {
        ...result.data,
        userId: req.user?.id
    }

    try {
        await reservationService.cancelReservation(id, body)
        return res.status(200).json({
            message: "Reservación cancelada correctamente"
        })
    } catch (error) {
        next(error)
    }
}

const completeReservation = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    try {
        await reservationService.completeReservation(id)
        return res.status(200).json({
            message: "Reservación completada correctamente"
        })
    } catch (error) {
        next(error)
    }
}

export const reservationController = {
    getReservations,
    createReservation,
    confirmReservation,
    cancelReservation,
    completeReservation
}