import { Request, Response, NextFunction } from "express"
import { businessCategoryService } from "../services/business-category.service"
import { businessCategorySchema } from "../schemas/business-category.schema"
import { ValidationError } from "../middlewares/error"

const getBusinessCategories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await businessCategoryService.getBusinessCategories()
        return res.status(200).json(categories)
    } catch (error) {
        next(error)
    }
}

const getBussinessCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    try {
        const category = await businessCategoryService.getBussinessCategoryById(id)
        return res.status(200).json(category)
    } catch (error) {
        next(error)
    }
}

const createBusinessCategory = async (req: Request, res: Response, next: NextFunction) => {
    const result = businessCategorySchema.safeParse(req.body)

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = result.data

    try {
        const newCategory = await businessCategoryService.createBusinessCategory(body)
        return res.status(201).json(newCategory)
    } catch (error) {
        next(error)
    }
}

const updateBusinessCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const result = businessCategorySchema.safeParse(req.body)

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = result.data

    try {
        const updatedCategory = await businessCategoryService.updateBusinessCategory(id, body)
        return res.status(200).json(updatedCategory)
    } catch (error) {
        next(error)
    }
}

const deleteBusinessCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    try {
        const deletedCategory = await businessCategoryService.deleteBusinessCategory(id)
        return res.status(200).json(deletedCategory)
    } catch (error) {
        next(error)
    }
}

export const businessCategoryController = {
    getBusinessCategories,
    getBussinessCategoryById,
    createBusinessCategory,
    updateBusinessCategory,
    deleteBusinessCategory
}