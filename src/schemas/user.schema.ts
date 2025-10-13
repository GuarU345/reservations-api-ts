import { z } from "zod"

export const userSchema = z.object({
    name: z
        .string({ message: "El nombre es requerido" })
        .min(1, { message: "El nombre no puede estar vacío" })
        .max(50, { message: "El nombre no puede tener más de 50 caracteres" }),

    email: z
        .string({ message: "El email es requerido" })
        .email({ message: "El email no es válido" })
        .max(100, { message: "El email no puede superar los 100 caracteres" }),

    password: z
        .string({ message: "La contraseña debe ser de tipo texto" })
        .min(10, { message: "La contraseña debe tener al menos 10 caracteres" })
        .max(32, { message: "La contraseña debe tener como máximo 32 caracteres" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,32}$/, {
            message: "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial"
        }),

    phone: z
        .string({ message: "El teléfono es requerido" })
        .min(10, { message: "El teléfono debe tener al menos 10 dígitos" })
        .max(13, { message: "El teléfono no puede tener más de 13 dígitos" })
        .regex(/^(?:\+52|52)?\d{10}$/, {
            message: "El teléfono debe ser un número válido de 10 dígitos, con o sin el prefijo +52"
        })
});

export const signinSchema = userSchema.partial({
    name: true,
    phone: true,
})

