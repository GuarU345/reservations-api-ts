import { NextFunction, Request, Response } from "express";
import { notificationService } from "../services/notification.service";

const subscribe = async (req: Request, res: Response, next: NextFunction) => {
    const body = {
        ...req.body,
        userId: req.user?.id
    }

    try {
        await notificationService.subscribe(body)
        return res.status(201).json({
            message: "Suscripción generada correctamente"
        })
    } catch (error) {
        next(error)
    }
}

const isActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
    const { endpoint } = req.query

    try {
        const isActive = await notificationService.isActiveSubscription(endpoint as string)
        res.status(200).json({
            active: isActive
        })
    } catch (error) {
        next(error)
    }
}

export const notificationController = {
    subscribe,
    isActiveSubscription
}