import { prisma } from "../utils/prisma"
import { InternalServerError, NotFoundError } from "../middlewares/error"

const getBusinessCategories = async () => {
    try {
        const categories = await prisma.business_categories.findMany({
            where: {
                active: true
            }
        })
        return categories
    } catch (error) {
        throw new InternalServerError("Error al tratar de obtener las categorias")
    }
}

const getBussinessCategoryById = async (categoryId: string) => {
    try {
        const category = await prisma.business_categories.findUnique({
            where: {
                id: categoryId,
                active: true
            }
        })

        if (!category) {
            throw new NotFoundError("Categoria no encontrada")
        }

        return category
    } catch (error) {
        throw error;
    }
}

const createBusinessCategory = async (body: any) => {
    const { category } = body;

    try {
        const newCategory = await prisma.business_categories.create({
            data: {
                category
            }
        })

        return newCategory
    } catch (error) {
        throw new InternalServerError("Error al tratar de crear la categoria")
    }
}

const updateBusinessCategory = async (categoryId: string, body: any) => {
    const { category } = body;

    const foundCategory = await getBussinessCategoryById(categoryId);

    try {
        const updatedCategory = await prisma.business_categories.update({
            where: {
                id: foundCategory.id
            },
            data: {
                category
            }
        })

        return updatedCategory
    } catch (error) {
        throw new InternalServerError("Error al tratar de actualizar la categoria")
    }
}

const deleteBusinessCategory = async (categoryId: string) => {
    const foundCategory = await getBussinessCategoryById(categoryId);

    try {
        const deletedCategory = await prisma.business_categories.update({
            where: {
                id: foundCategory.id
            },
            data: {
                active: false
            }
        })

        return deletedCategory
    } catch (error) {
        throw new InternalServerError("Error al tratar de eliminar la categoria")
    }
}

export const businessCategoryService = {
    getBusinessCategories,
    getBussinessCategoryById,
    createBusinessCategory,
    updateBusinessCategory,
    deleteBusinessCategory
}