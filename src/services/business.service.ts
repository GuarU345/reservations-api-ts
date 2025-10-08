import { InternalServerError, NotFoundError } from "../middlewares/error"
import { prisma } from "../utils/prisma"
import { userService } from "./user.service"

const getBusinesses = async (categoryId?: string) => {
    try {
        const businesses = await prisma.businesses.findMany({
            where: {
                active: true,
                category_id: categoryId
            }
        })

        return businesses
    } catch (error) {
        throw new InternalServerError("Error al tratar de obtener los negocios")
    }
}

const getBusinessById = async (businessId: string) => {
    try {
        const business = await prisma.businesses.findUnique({
            where: {
                id: businessId,
                active: true
            }
        })

        if (!business) {
            throw new NotFoundError("Negocio no encontrado")
        }

        return business
    } catch (error) {
        throw error
    }
}

const createBusiness = async (body: any) => {
    const {
        name,
        description,
        address,
        phone,
        email,
        userId,
        categoryId
    } = body

    const isValidUser = await userService.canCreateBusiness(userId)

    if (!isValidUser) return

    try {
        const newBusiness = await prisma.businesses.create({
            data: {
                name,
                description,
                address,
                phone,
                email,
                user_id: userId,
                category_id: categoryId
            }
        })

        return newBusiness
    } catch (error) {
        console.log(error)
        throw new InternalServerError("Error al tratar de crear el negocio")
    }
}

const updateBusiness = async (businessId: string, body: any) => {
    const {
        name,
        description,
        address,
        phone,
        email,
        categoryId,
        userId
    } = body

    const verifiedBusiness = await verifyBusinessOwner(businessId, userId)

    try {
        const updatedBusiness = await prisma.businesses.update({
            where: {
                id: verifiedBusiness.id
            },
            data: {
                name,
                description,
                address,
                phone,
                email,
                category_id: categoryId
            }
        })

        return updatedBusiness
    } catch (error) {
        throw new InternalServerError("Error al tratar de actualizar el negocio")
    }
}

const deleteBusiness = async (businessId: string, userId: string) => {
    const verifiedBusiness = await verifyBusinessOwner(businessId, userId)

    try {
        const deletedBusiness = await prisma.businesses.update({
            where: {
                id: verifiedBusiness.id
            },
            data: {
                active: false
            }
        })

        return deletedBusiness
    } catch (error) {
        throw new InternalServerError("Error al tratar de eliminar el negocio")
    }
}

const verifyBusinessOwner = async (businessId: string, userId: string) => {
    const business = await getBusinessById(businessId)

    if (business.user_id !== userId) {
        throw new NotFoundError("No tienes acceso a este negocio")
    }

    return business
}

export const businessService = {
    getBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness
}