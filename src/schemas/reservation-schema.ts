import { z } from "zod"

export const reservationSchema = z.object({
    businessId: z.string({ message: "El negocio es requerido" }),

    startTime: z.string({ message: "La hora de inicio es requerida" })
        .refine((date) => !isNaN(Date.parse(date)), { message: "La hora de inicio debe ser válida" })
        .refine((date) => new Date(date) > new Date(), { message: "La hora de inicio debe ser futura" }),

    endTime: z.string({ message: "La hora de finalización es requerida" })
        .refine((date) => !isNaN(Date.parse(date)), { message: "La hora de finalización debe ser válida" })
        .refine((date) => new Date(date) > new Date(), { message: "La hora de finalización debe ser futura" }),

    numberOfPeople: z.number({ message: "El número de personas debe ser un número" })
        .min(1, { message: "Debe haber al menos una persona" })
        .max(8, { message: "No se permite más de 8 personas por reservación" }),
})
    // Validar que la hora de fin sea posterior a la de inicio
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
        message: "La hora de finalización debe ser posterior a la hora de inicio",
        path: ["endTime"],
    })
    .refine((data) => {
        const start = new Date(data.startTime)
        const end = new Date(data.endTime)

        return (
            start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth() &&
            start.getDate() === end.getDate()
        )
    },
        {
            message: "La reservación debe de ser dentro del mismo dia",
            path: ["endTime"]
        }
    )

export const cancelReservationSchema = z.object({
    reason: z
        .string({ message: "La razón es requerida" })
        .min(10, { message: "La razón debe tener al menos 10 caracteres" })
        .max(255, { message: "La razón no debe exceder los 255 caracteres" })
})