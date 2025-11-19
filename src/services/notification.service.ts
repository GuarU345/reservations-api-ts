import { InternalServerError } from "../middlewares/error"
import { prisma } from "../utils/prisma"
import { authService } from "./auth.service"
import webpush from "web-push"

const subscribe = async (body: any) => {
    const {
        userId,
        type,
        endpoint,
        p256dh,
        auth,
        expirationTime
    } = body

    try {
        const subscription = await prisma.push_subscriptions.create({
            data: {
                user_id: userId,
                type,
                endpoint,
                p256dh,
                auth,
                expiration_time: expirationTime
            }
        })

        return subscription
    } catch (error) {
        throw new InternalServerError("Error al tratar de generar la suscripción (notificaciones-push)")
    }
}

const notify = async (userId: string, body: any) => {
    const {
        title,
        message
    } = body

    const user = await authService.getUserById(userId)

    try {
        const subscriptions = await prisma.push_subscriptions.findMany({
            where: {
                user_id: user.id
            }
        })

        const payload = JSON.stringify({ title, body: message })

        const sendNotifications = subscriptions.map(sub => {
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                },
                payload
            )
                .catch(async (err) => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await prisma.push_subscriptions.update({
                            where: {
                                endpoint: sub.endpoint
                            },
                            data: {
                                active: false
                            }
                        })
                    }
                })
        })

        await Promise.all(sendNotifications)
    } catch (error) {
        throw new InternalServerError("Error al tratar de enviar las notificaciones")
    }
}

const isActiveSubscription = async (endpoint: string) => {
    try {
        const activeSubscription = await prisma.push_subscriptions.findFirst({
            where: {
                endpoint
            }
        })

        return activeSubscription?.active
    } catch (error) {
        throw new InternalServerError('Error al tratar de encontrar la subscripcion')
    }
}

export const notificationService = {
    subscribe,
    notify,
    isActiveSubscription
}