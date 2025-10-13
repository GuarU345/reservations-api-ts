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
        isClosed
    } = body

    const businessHours = await getBusinessHoursById(businessHoursId)

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
        throw new InternalServerError('Error al tratar de actualizar el horario del negocio')
    }
}

const closeBusinessHours = async (businessHoursId: string) => {
    const businessHours = await getBusinessHoursById(businessHoursId)

    if (businessHours.is_closed) {
        throw new ConflictError('El horario del negocio ya está cerrado')
    }

    try {
        const closedHours = await prisma.business_hours.update({
            where: {
                id: businessHours.id
            },
            data: {
                is_closed: true,
                open_time: null,
                close_time: null,
            }
        })
        return closedHours
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new InternalServerError('Error al tratar de cerrar el horario del negocio')
    }
}

export const businessHoursService = {
    updateBusinessHours,
    closeBusinessHours,
    initializeBusinessHours
}