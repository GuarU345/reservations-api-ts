import { z } from "zod"
import { DateTime } from "luxon"

const BUSINESS_TZ = "America/Mexico_City";

const parseDate = (date: string) => {
    return DateTime.fromISO(date, { zone: BUSINESS_TZ })
}

export const reservationSchema = z.object({
    businessId: z.string({ message: "El negocio es requerido" }),

    startTime: z.string({ message: "La hora de inicio es requerida" })
        .refine((date) => parseDate(date).isValid, {
            message: "La hora de inicio debe ser válida",
        })
        .refine((date) => parseDate(date) > DateTime.utc(), {
            message: "La hora de inicio debe ser futura",
        }),

    endTime: z.string({ message: "La hora de finalización es requerida" })
        .refine((date) => parseDate(date).isValid, {
            message: "La hora de finalización debe ser válida",
        })
        .refine((date) => parseDate(date) > DateTime.utc(), {
            message: "La hora de finalización debe ser futura",
        }),

    numberOfPeople: z.number({ message: "El número de personas debe ser un número" })
        .min(1, { message: "Debe haber al menos una persona" })
        .max(8, { message: "No se permite más de 8 personas por reservación" }),
})
    .refine((data) => parseDate(data.endTime) > parseDate(data.startTime), {
        message: "La hora de finalización debe ser posterior a la hora de inicio",
        path: ["endTime"],
    })
    .refine((data) => {
        const start = parseDate(data.startTime);
        const end = parseDate(data.endTime);

        return (
            start.year === end.year &&
            start.month === end.month &&
            start.day === end.day
        );
    }, {
        message: "La reservación debe de ser dentro del mismo día",
        path: ["endTime"],
    });

export const cancelReservationSchema = z.object({
    reason: z
        .string({ message: "La razón es requerida" })
        .min(10, { message: "La razón debe tener al menos 10 caracteres" })
        .max(255, { message: "La razón no debe exceder los 255 caracteres" })
})