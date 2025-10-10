import { z } from "zod"

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const businessHoursSchema = z.object({
    openTime: z
        .string({ message: "La hora de apertura es requerida" })
        .regex(timeRegex, { message: "La hora de apertura debe estar en formato HH:mm" }),
    closeTime: z
        .string({ message: "La hora de cierre es requerida" })
        .regex(timeRegex, { message: "La hora de cierre debe estar en formato HH:mm" }),
    isClosed: z
        .boolean({ message: "El campo isClosed debe ser un booleano" })
        .optional()
})
    .refine((data) => {
        if (data.isClosed) return true

        const [openHour, openMinute] = data.openTime.split(":").map(Number);
        const [closeHour, closeMinute] = data.closeTime.split(":").map(Number);

        const openTotal = openHour * 60 + openMinute;
        const closeTotal = closeHour * 60 + closeMinute;

        return closeTotal > openTotal;
    },
        {
            message: "La hora de cierre debe ser mayor a la hora de apertura",
            path: ["closeTime"]
        }
    )

export const updateBusinessHoursSchema = businessHoursSchema.pick({
    openTime: true,
    closeTime: true
})