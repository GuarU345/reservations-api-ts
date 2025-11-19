import { z } from "zod"

export const businessHoursSchema = z.object({
    openTime: z
        .string({ message: "La hora de apertura es requerida" })
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "La hora de apertura debe estar en formato HH:mm" })
        .optional(),

    closeTime: z
        .string({ message: "La hora de cierre es requerida" })
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "La hora de cierre debe estar en formato HH:mm" })
        .optional(),

    isClosed: z
        .boolean({ message: "El campo isClosed debe ser un booleano" })
        .default(false),
})
    .superRefine((data, ctx) => {
        if (data.isClosed) return;

        if (!data.openTime || !data.closeTime) {
            ctx.addIssue({
                path: ["openTime"],
                message: "Debe especificar las horas de apertura y cierre cuando el negocio está abierto",
                code: z.ZodIssueCode.custom
            });
            return;
        }

        const [openHour, openMinute] = data.openTime.split(":").map(Number);
        const [closeHour, closeMinute] = data.closeTime.split(":").map(Number);

        const openTotal = openHour * 60 + openMinute;
        const closeTotal = closeHour * 60 + closeMinute;

        if (closeTotal <= openTotal) {
            ctx.addIssue({
                path: ["closeTime"],
                message: "La hora de cierre debe ser mayor a la hora de apertura",
                code: z.ZodIssueCode.custom
            });
        }
    });