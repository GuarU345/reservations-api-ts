import { ConflictError, InternalServerError, NotFoundError } from "../middlewares/error"
import { prisma } from "../utils/prisma"
import { authService } from "./auth.service"
import { businessService } from "./business.service"

const getLikedBusinesses = async (userId: string) => {
    const user = await authService.getUserById(userId)

    if (user.role !== "CUSTOMER") {
        throw new ConflictError('No tienes permiso para realizar esta acción')
    }

    try {
        const likedBusinesses = await prisma.user_business_likes.findMany({
            where: {
                user_id: user.id
            }
        })

        const businessesIds = likedBusinesses.map(liked => liked.business_id)

        if (businessesIds.length === 0) {
            return []
        }

        const businessesData = await prisma.businesses.findMany({
            where: {
                id: {
                    in: businessesIds
                }
            }
        })

        return businessesData
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new Error('Error al tratar de consultar tus negocios favoritos')
    }
}

const likeBusiness = async (userId: string, businessId: string) => {
    const foundUser = await authService.getUserById(userId)
    const business = await businessService.getBusinessById(businessId)

    if (foundUser.role !== "CUSTOMER") {
        throw new ConflictError('No tienes permiso para realizar esta acción')
    }

    try {
        const likeBusiness = await prisma.user_business_likes.create({
            data: {
                user_id: foundUser.id,
                business_id: business.id
            }
        })

        return likeBusiness
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new InternalServerError('Error al tratar de agregar a tus favoritos')
    }
}

const dislikeBusiness = async (userId: string, businessId: string) => {
    const foundUser = await authService.getUserById(userId)
    const business = await businessService.getBusinessById(businessId)

    if (foundUser.role !== "CUSTOMER") {
        throw new ConflictError('No tienes permiso para realizar esta acción')
    }

    try {
        const likedBusiness = await prisma.user_business_likes.findFirst({
            where: {
                AND: [
                    { user_id: foundUser.id },
                    { business_id: business.id }
                ]
            }
        })

        if (!likedBusiness) {
            throw new NotFoundError('No se encontro el negocio en tus favoritos')
        }

        await prisma.user_business_likes.delete({
            where: {
                id: likedBusiness.id
            }
        })

        return likeBusiness
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ConflictError) {
            throw error
        }
        throw new InternalServerError('Error al tratar de eliminar de tus favoritos')
    }
}

export const userService = {
    getLikedBusinesses,
    likeBusiness,
    dislikeBusiness
}