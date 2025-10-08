import { z } from "zod"

export const businessCategorySchema = z.object({
    category: z.string().min(1, { message: "La categoria es requerida" })
})