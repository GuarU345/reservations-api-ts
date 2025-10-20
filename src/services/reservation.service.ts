import { UserRoleEnum } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { businessService } from "./business.service";
import { authService } from "./auth.service";
import { ConflictError, InternalServerError, NotFoundError } from "../middlewares/error";
import { notificationService } from "./notification.service";

const getReservations = async (user: any) => {
    const {
        id: userId,
        role
    } = user

    if (role === UserRoleEnum.BUSINESS_OWNER) {
        const business = await businessService.getBusinessByOwnerId(userId)

        try {
            const reservations = await prisma.reservations.findMany({
                where: {
                    business_id: business.id
                },
                include: {
                    users: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    reservation_cancellations: {
                        select: {
                            reason: true,
                            cancelled_by: true,
                            cancelled_at: true
                        }
                    }
                }
            })

            return reservations
        } catch (error) {
            throw new InternalServerError("Error al obtener las reservaciones")
        }
    } else {
        try {
            const reservations = await prisma.reservations.findMany({
                where: {
                    user_id: userId
                },
                include: {
                    businesses: {
                        select: {
                            name: true
                        }
                    },
                    reservation_cancellations: {
                        select: {
                            reason: true,
                            cancelled_by: true,
                            cancelled_at: true
                        }
                    }
                },
                orderBy: {
                    start_time: 'desc'
                }
            })

            return reservations
        } catch (error) {
            throw new InternalServerError("Error al obtener las reservaciones")
        }
    }
}

const getReservationById = async (reservationId: string) => {
    try {
        const reservation = await prisma.reservations.findUnique({
            where: {
                id: reservationId
            },
            include: {
                businesses: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!reservation) {
            throw new NotFoundError("Reservación no encontrada")
        }

        return reservation
    } catch (error) {
        throw error
    }
}

const getReservationsByUserId = async (userId: string) => {
    const user = await authService.getUserById(userId)

    try {
        const reservations = await prisma.reservations.findMany({
            where: {
                user_id: user.id
            }
        })

        return reservations
    } catch (error) {
        throw new InternalServerError("Error al obtener las reservaciones")
    }
}

const createReservation = async (body: any) => {
    const {
        businessId,
        userId,
        startTime,
        endTime,
        numberOfPeople,
    } = body

    await authService.canCreateReservation(userId)
    const business = await businessService.getBusinessById(businessId)
    await activeReservationToday(userId, business.id, startTime)

    await isDisponibleForReservation(business.id, startTime, endTime)
    await businessService.isAvailableDay(business.id, startTime, endTime)

    try {
        const reservation = await prisma.reservations.create({
            data: {
                business_id: business.id,
                user_id: userId,
                start_time: new Date(startTime),
                end_time: new Date(endTime),
                number_of_people: numberOfPeople,
                status: "PENDING"
            }
        })

        return reservation
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new InternalServerError("Error al tratar de crear la reservacion")
    }
}

const cancelReservation = async (reservationId: string, body: any) => {
    const {
        userId,
        reason
    } = body

    const user = await authService.getUserById(userId)
    const reservation = await getReservationById(reservationId)
    const business = await businessService.getBusinessById(reservation.business_id)

    const isReservationClient = reservation.user_id === userId
    const isBusinessOwner = business.user_id === userId

    if (!isReservationClient && !isBusinessOwner) {
        throw new ConflictError("No tienes permiso para cancelar esta reservación")
    }

    if (reservation.status === "CANCELLED") {
        throw new ConflictError("La reservación ya se encuentra cancelada")
    }

    if (reservation.status === "CONFIRMED" || reservation.status === "COMPLETED") {
        throw new ConflictError("No se puede cancelar una reservación confirmada o completada")
    }

    try {
        const canceledReservation = await prisma.$transaction(async (tx) => {
            const updatedReservation = await tx.reservations.update({
                where: { id: reservationId },
                data: {
                    status: "CANCELLED",
                    active: false
                }
            })

            await tx.reservation_cancellations.create({
                data: {
                    reservation_id: reservationId,
                    reason,
                    cancelled_by: user.name
                }
            })

            return updatedReservation
        })

        const notificationData = {
            title: "Reservación Cancelada",
            message: `Tu reservación en ${reservation.businesses.name} ha sido cancelada`
        }

        await notificationService.notify(reservation.user_id, notificationData)

        return canceledReservation
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new InternalServerError("Error al tratar de cancelar la reservación")
    }
}

const activeReservationToday = async (userId: string, businessId: string, startTime: string) => {
    const targetDate = new Date(startTime);
    targetDate.setHours(0, 0, 0, 0);

    const userReservations = await getReservationsByUserId(userId);

    const activeReservations = userReservations.filter(resev =>
        resev.business_id === businessId &&
        ["CONFIRMED", "PENDING"].includes(resev.status)
    )

    const hasReservationToday = activeReservations.some(resev => {
        const resDate = new Date(resev.start_time)
        resDate.setHours(0, 0, 0, 0);
        return resDate.getTime() === targetDate.getTime()
    })

    if (hasReservationToday) {
        throw new ConflictError("Ya tienes una reservacion activa para este negocio")
    }

    return
}

const isDisponibleForReservation = async (businessId: string, startTime: string, endTime: string) => {
    const newStart = new Date(startTime)
    const newEnd = new Date(endTime)

    const existingReservation = await prisma.reservations.findFirst({
        where: {
            business_id: businessId,
            status: {
                in: ["PENDING", "CONFIRMED"]
            },
            AND: [
                { start_time: { lt: newEnd } },
                { end_time: { gt: newStart } }
            ]
        }
    })

    if (existingReservation) {
        throw new ConflictError("Ya existe una reservacion para este negocio en la fecha y hora seleccionada")
    }
}

const confirmReservation = async (reservationId: string) => {
    const reservation = await getReservationById(reservationId)

    if (reservation.status === "CONFIRMED") {
        throw new ConflictError("La reservación ya se encuentra confirmada")
    }

    if (reservation.status === "CANCELLED") {
        throw new ConflictError("No se puede confirmar una reservación cancelada")
    }

    if (reservation.status === "COMPLETED") {
        throw new ConflictError("No se puede confirmar una reservación completada")
    }

    try {
        const confirmedReservation = await prisma.reservations.update({
            where: {
                id: reservationId
            },
            data: {
                status: "CONFIRMED"
            }
        })

        const notificationData = {
            title: "Reservación Confirmada",
            message: `Tu reservación en ${reservation.businesses.name} ha sido confirmada`
        }

        await notificationService.notify(reservation.user_id, notificationData)

        return confirmedReservation
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new InternalServerError("Error al tratar de confirmar la reservación")
    }
}

const completeReservation = async (reservationId: string) => {
    const currentDate = new Date()

    const reservation = await getReservationById(reservationId)

    if (reservation.status === "COMPLETED") {
        throw new ConflictError("La reservación ya se encuentra completada")
    }

    if (reservation.status === "CANCELLED") {
        throw new ConflictError("No se puede completar una reservación cancelada")
    }

    if (reservation.status === "PENDING") {
        throw new ConflictError("No se puede completar una reservación pendiente, debe ser confirmada primero")
    }

    const endTime = new Date(reservation.end_time)

    if (currentDate < endTime) {
        throw new ConflictError("No se puede completar la reservacion antes de que finalize")
    }

    try {
        const completedReservation = await prisma.reservations.update({
            where: {
                id: reservationId
            },
            data: {
                status: "COMPLETED"
            }
        })

        const notificationData = {
            title: "Reservación Completada",
            message: `Tu reservación en ${reservation.businesses.name} ha sido marcada como completada`
        }

        await notificationService.notify(reservation.user_id, notificationData)

        return completedReservation
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new InternalServerError("Error al tratar de completar la reservación")
    }
}

export const reservationService = {
    getReservations,
    createReservation,
    confirmReservation,
    cancelReservation,
    completeReservation
}