import { NextFunction, Request, Response } from "express"
import { businessService } from "../services/business.service"
import { businessSchema } from "../schemas/business.schema"
import { ValidationError } from "../middlewares/error"

const getBusinesses = async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.query
    const userId = req.user?.id

    try {
        const businesses = await businessService.getBusinesses(userId, categoryId as string)
        return res.status(200).json(businesses)
    } catch (error) {
        next(error)
    }
}

const getBusinessById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    try {
        const business = await businessService.getBusinessById(id)
        return res.status(200).json(business)
    } catch (error) {
        next(error)
    }
}

const getBusinessHoursByBusinessId = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    try {
        const businessHours = await businessService.getBusinessHoursByBusinessId(id)
        res.status(200).json(businessHours)
    } catch (error) {
        next(error)
    }
}

const createBusiness = async (req: Request, res: Response, next: NextFunction) => {
    const result = businessSchema.safeParse(req.body)

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = {
        ...result.data,
        userId: req.user?.id
    }

    try {
        const newBusiness = await businessService.createBusiness(body)
        return res.status(201).json(newBusiness)
    } catch (error) {
        next(error)
    }
}

const updateBusiness = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const result = businessSchema.safeParse(req.body)

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = {
        ...result.data,
        userId: req.user?.id
    }

    try {
        const updatedBusiness = await businessService.updateBusiness(id, body)
        return res.status(200).json(updatedBusiness)
    } catch (error) {
        next(error)
    }
}

const deleteBusiness = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const userId = req.user?.id

    try {
        const deletedBusiness = await businessService.deleteBusiness(id, userId!)
        return res.status(200).json(deletedBusiness)
    } catch (error) {

    }
}

export const businessController = {
    getBusinesses,
    getBusinessById,
    getBusinessHoursByBusinessId,
    createBusiness,
    updateBusiness,
    deleteBusiness
}