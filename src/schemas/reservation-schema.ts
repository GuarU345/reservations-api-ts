import { z } from "zod"

export const reservationSchema = z.object({
    businessId: z.string({ message: "El negocio es requerido" }),
    reservationDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "La fecha de reservación debe ser válida" })
        .refine((date) => new Date(date) > new Date(), { message: "La fecha de reservación debe ser futura" }),
    numberOfPeople: z.number({ message: "El numero de personas debe de ser un numero" })
        .min(1, { message: "Debe haber al menos una persona" })
        .max(8, { message: "No se permite más de 8 personas por reservación" }),
})
    .refine((data) => {
        const reservationTime = new Date(data.reservationDate);
        const hour = reservationTime.getHours();
        const minute = reservationTime.getMinutes();

        //validar que no sea antes de las 8:00 ni después de las 22:00
        const totalMinutes = hour * 60 + minute
        if (totalMinutes < 8 * 60 || totalMinutes > 22 * 60) return false
        return true
    }, {
        message: "La hora de la reservación debe estar entre 08:00 y 22:00",
        path: ["reservationDate"],
    });

export const cancelReservationSchema = z.object({
    reason: z
        .string({ message: "La razón es requerida" })
        .min(10, { message: "La razón debe tener al menos 10 caracteres" })
        .max(255, { message: "La razón no debe exceder los 255 caracteres" })
})