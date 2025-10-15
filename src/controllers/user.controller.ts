import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";

const getLikedBusinesses = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string

    try {
        const likedBusinesses = await userService.getLikedBusinesses(userId)
        return res.status(200).json(likedBusinesses)
    } catch (error) {
        next(error)
    }
}

const likeBusiness = async (req: Request, res: Response, next: NextFunction) => {
    const { businessId } = req.params
    const userId = req.user?.id as string

    try {
        await userService.likeBusiness(userId, businessId)
        return res.status(200).json({
            message: 'Negocio agregado a tus favoritos'
        })
    } catch (error) {
        next(error)
    }
}

const dislikeBusiness = async (req: Request, res: Response, next: NextFunction) => {
    const { businessId } = req.params
    const userId = req.user?.id as string

    try {
        await userService.dislikeBusiness(userId, businessId)
        return res.status(200).json({
            message: 'Negocio eliminado de tus favoritos'
        })
    } catch (error) {
        next(error)
    }
}

export const userController = {
    getLikedBusinesses,
    likeBusiness,
    dislikeBusiness
}