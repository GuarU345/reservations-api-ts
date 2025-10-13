import { z } from "zod"

export const businessCategorySchema = z.object({
    category: z
        .string({ message: "La categoría es requerida" })
        .min(1, { message: "La categoría no puede estar vacía" })
        .max(50, { message: "La categoría no puede tener más de 50 caracteres" })
        .trim()
});