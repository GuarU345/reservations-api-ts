import { NextFunction, Request, Response } from "express";
import { businessHoursSchema } from "../schemas/business-hours.schema";
import { ValidationError } from "../middlewares/error";
import { businessHoursService } from "../services/business-hours.service";

const updateBusinessHours = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    const result = businessHoursSchema.safeParse(req.body);

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = result.data

    try {
        const updatedHours = await businessHoursService.updateBusinessHours(id, body)
        res.status(200).json(updatedHours)
    } catch (error) {
        next(error)
    }
}

export const businessHoursController = {
    updateBusinessHours,
}