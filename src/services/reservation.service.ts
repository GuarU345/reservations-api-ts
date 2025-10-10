import { UserRoleEnum } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { businessService } from "./business.service";

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
                }
            })

            return reservations
        } catch (error) {
            throw new Error("Error al obtener las reservaciones")
        }
    }
}

export const reservationService = {
    getReservations
}