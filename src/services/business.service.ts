import { Prisma, UserRoleEnum } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError } from "../middlewares/error"
import { prisma } from "../utils/prisma"
import { businessCategoryService } from "./business-category.service"
import { businessHoursService } from "./business-hours.service"
import { authService } from "./auth.service"
import { userService } from "./user.service"

type GetBusinessesParams = {
    requesterId?: string
    requesterRole?: UserRoleEnum
    categoryId?: string
    onlyOwner?: boolean
}

const getBusinesses = async ({ requesterId, requesterRole, categoryId, onlyOwner }: GetBusinessesParams) => {
    const where: Prisma.businessesWhereInput = {
        active: true,
    }

    if (categoryId) {
        where.category_id = categoryId
    }

    if (onlyOwner) {
        if (!requesterId) {
            throw new UnauthorizedError("No se pudo identificar al propietario del negocio")
        }

        if (requesterRole !== UserRoleEnum.BUSINESS_OWNER) {
            throw new UnauthorizedError("Solo los dueños de negocio pueden listar sus negocios")
        }

        where.user_id = requesterId
    }

    try {
        const businesses = await prisma.businesses.findMany({
            where,
            include: {
                business_categories: {
                    select: {
                        category: true
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        })

        const isCustomerRequester = requesterRole === UserRoleEnum.CUSTOMER && Boolean(requesterId)

        if (isCustomerRequester && requesterId) {
            const likedBusinesses = await userService.getLikedBusinesses(requesterId)

            const likedBusinessIds = likedBusinesses.map(liked => liked.id)

            return businesses.map(business => ({
                ...business,
                liked: likedBusinessIds.includes(business.id)
            }))
        }

        return businesses.map(business => ({
            ...business,
            liked: false
        }))
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
            },
            include: {
                business_categories: {
                    select: {
                        category: true
                    }
                },
                business_hours: {
                    select: {
                        day_of_week: true,
                        open_time: true,
                        close_time: true,
                        is_closed: true
                    },
                    orderBy: {
                        day_of_week: 'asc'
                    }
                }
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

const getBusinessByOwnerId = async (ownerId: string) => {
    try {
        const business = await prisma.businesses.findFirst({
            where: {
                user_id: ownerId,
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

const getBusinessHoursByBusinessId = async (businessId: string) => {
    const business = await businessService.getBusinessById(businessId)

    try {
        const businessHours = await prisma.business_hours.findMany({
            where: {
                business_id: business.id
            },
            orderBy: {
                day_of_week: 'asc'
            }
        })

        return businessHours
    } catch (error) {
        throw new InternalServerError('Error al tratar de obtener los horarios del negocio')
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

    await authService.canCreateBusiness(userId)
    const category = await businessCategoryService.getBussinessCategoryById(categoryId)

    try {
        const { newBusiness } = await prisma.$transaction(async (tx) => {
            const newBusiness = await tx.businesses.create({
                data: {
                    name,
                    description,
                    address,
                    phone,
                    email,
                    user_id: userId,
                    category_id: category.id
                }
            })

            await businessHoursService.initializeBusinessHours(newBusiness.id, tx)

            return { newBusiness }
        })

        return newBusiness
    } catch (error: unknown) {
        if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
            throw error
        }

        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002' && String(error?.meta?.target).includes('phone')) {
                throw new ConflictError("El numero de telefono ya esta en uso")
            }
        }

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

const isAvailableDay = async (businessId: string, startTime: string, endTime: string) => {
    const businessHours = await getBusinessHoursByBusinessId(businessId)

    const start = new Date(startTime)
    const end = new Date(endTime)
    const dayOfWeek = start.getUTCDay()
    const hoursForDay = businessHours.find(businessH => businessH.day_of_week === dayOfWeek)

    if (!hoursForDay || hoursForDay.is_closed || !hoursForDay.open_time || !hoursForDay.close_time) {
        throw new ConflictError("El negocio esta cerrado ese dia")
    }

    const [openHour, openMinute] = hoursForDay.open_time!.split(':').map(Number)
    const [closeHour, closeMinute] = hoursForDay.close_time!.split(':').map(Number)
    const openTotal = openHour * 60 + openMinute
    const closeTotal = closeHour * 60 + closeMinute

    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()

    if (startMinutes < openTotal || endMinutes > closeTotal) {
        throw new ConflictError("La reservación no está dentro del horario de atención del negocio")
    }
}

export const businessService = {
    getBusinesses,
    getBusinessById,
    getBusinessHoursByBusinessId,
    getBusinessByOwnerId,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    isAvailableDay
}