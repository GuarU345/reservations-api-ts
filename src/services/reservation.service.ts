import { UserRoleEnum } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { businessService } from "./business.service";
import { userService } from "./user.service";
import { ConflictError, NotFoundError } from "../middlewares/error";

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
            throw new Error("Error al obtener las reservaciones")
        }
    } else {
        try {
            const reservations = await prisma.reservations.findMany({
                where: {
                    user_id: userId
                },
                include: {
                    reservation_cancellations: {
                        select: {
                            reason: true
                        }
                    }
                }
            })

            return reservations
        } catch (error) {
            throw new Error("Error al obtener las reservaciones")
        }
    }
}

const getReservationById = async (reservationId: string) => {
    try {
        const reservation = await prisma.reservations.findUnique({
            where: {
                id: reservationId
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
    const user = await userService.getUserById(userId)

    try {
        const reservations = await prisma.reservations.findMany({
            where: {
                user_id: user.id
            }
        })

        return reservations
    } catch (error) {
        throw new Error("Error al obtener las reservaciones")
    }
}

const createReservation = async (body: any) => {
    const {
        businessId,
        userId,
        reservationDate,
        numberOfPeople,
    } = body

    await userService.canCreateReservation(userId)
    const business = await businessService.getBusinessById(businessId)
    await activeReservationToday(userId, business.id, reservationDate)

    await isDisponibleForReservation(business.id, reservationDate)
    await businessService.isAvailableDay(business.id, reservationDate)

    try {
        const reservation = await prisma.reservations.create({
            data: {
                business_id: business.id,
                user_id: userId,
                reservation_date: new Date(reservationDate),
                number_of_people: numberOfPeople,
                status: "PENDING"
            }
        })

        return reservation
    } catch (error) {
        console.log(error)
        if (error instanceof ConflictError) {
            throw error
        }
        throw new Error("Error al tratar de crear la reservacion")
    }
}

const cancelReservation = async (reservationId: string, body: any) => {
    const {
        userId,
        reason
    } = body

    const reservation = await getReservationById(reservationId)

    if (reservation.user_id !== userId) {
        throw new ConflictError("No tienes permiso para cancelar esta reservación")
    }

    if (reservation.status === "CANCELLED") {
        throw new ConflictError("La reservación ya se encuentra cancelada")
    }

    try {
        const canceledReservation = await prisma.$transaction(async (tx) => {
            const updatedReservation = await tx.reservations.update({
                where: { id: reservationId },
                data: { status: "CANCELLED" }
            })

            await tx.reservation_cancellations.create({
                data: {
                    reservation_id: reservationId,
                    reason,
                    cancelled_by: userId
                }
            })

            return updatedReservation
        })

        return canceledReservation
    } catch (error) {
        if (error instanceof ConflictError) {
            throw error
        }
        throw new Error("Error al tratar de cancelar la reservación")
    }
}

const activeReservationToday = async (userId: string, businessId: string, reservationDate: string) => {
    const targetDate = new Date(reservationDate);
    targetDate.setHours(0, 0, 0, 0);

    const userReservations = await getReservationsByUserId(userId);

    const activeReservation = userReservations.find(res => {
        if (res.status !== "CONFIRMED"
            && res.status !== "PENDING"
            && res.business_id === businessId) return false

        const resDate = new Date(res.reservation_date)
        resDate.setHours(0, 0, 0, 0);

        return resDate.getTime() === targetDate.getTime()
    });

    if (activeReservation) {
        throw new ConflictError("El usuario ya tiene una reservación activa para este día")
    }

    return
}

const isDisponibleForReservation = async (businessId: string, reservationDate: string) => {
    const existingReservation = await prisma.reservations.findFirst({
        where: {
            business_id: businessId,
            reservation_date: new Date(reservationDate),
            status: {
                in: ["PENDING", "CONFIRMED"]
            }
        }
    })

    if (existingReservation) {
        throw new ConflictError("Ya existe una reservacion para este negocio en la fecha y hora seleccionada")
    }
}

export const reservationService = {
    getReservations,
    createReservation,
    cancelReservation
}