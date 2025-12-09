import z from "zod"

export const verifyCodeSchema = z.object({
    user_id: z.string("El usuario es requerido"),
    code: z.number("El codigo debe de ser numerico")
})