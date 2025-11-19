import { ConflictError, InternalServerError, NotFoundError } from "../middlewares/error"
import { prisma } from "../utils/prisma"

const initializeBusinessHours = async (businessId: string, tx: any) => {
    const days = [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo'
    ]

    const daysData = days.map((day, index) => {
        return {
            business_id: businessId,
            day_of_week: index,
            is_closed: true
        }
    })

    try {
        await tx.business_hours.createMany({
            data: daysData,
        })
    } catch (error) {
        throw new InternalServerError('Error al tratar de inicializar los horarios del negocio')
    }
}

const getBusinessHoursById = async (businessHoursId: string) => {
    try {
        const businessHours = await prisma.business_hours.findUnique({
            where: {
                id: businessHoursId
            },
            include: {
                businesses: {
                    select: {
                        user_id: true
                    }
                }
            }
        })

        if (!businessHours) {
            throw new NotFoundError('Horario del negocio no encontrado')
        }

        return businessHours
    } catch (error) {
        throw error
    }
}

const updateBusinessHours = async (businessHoursId: string, body: any) => {
    const {
        openTime,
        closeTime,
        isClosed,
        userId
    } = body

    const businessHours = await getBusinessHoursById(businessHoursId)

    if (businessHours.businesses.user_id !== userId) {
        throw new ConflictError('No tienes permiso para actualizar el horario de este negocio')
    }

    try {
        const updatedHours = await prisma.business_hours.update({
            where: {
                id: businessHours.id
            },
            data: {
                open_time: openTime,
                close_time: closeTime,
                is_closed: isClosed
            }
        })

        return updatedHours
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new InternalServerError('Error al tratar de actualizar el horario del negocio')
    }
}

export const businessHoursService = {
    updateBusinessHours,
    initializeBusinessHours
}