import { z } from "zod"

export const userSchema = z.object({
    name: z.string().min(1, { message: "El nombre es requerido" }),
    email: z.email({ message: "El email no es valido" }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    phone: z.string().min(10, { message: "El telefono debe tener al menos 10 caracteres" })
})

export const signinSchema = userSchema.partial({
    name: true,
    phone: true,
})

