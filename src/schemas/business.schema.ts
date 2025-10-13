import { z } from 'zod';

export const businessSchema = z.object({
    name: z
        .string({ message: 'El nombre es requerido' })
        .min(1, { message: 'El nombre no puede estar vacío' })
        .max(100, { message: 'El nombre no puede tener más de 100 caracteres' }),

    description: z
        .string({ message: 'La descripción es requerida' })
        .min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
        .max(500, { message: 'La descripción no puede superar los 500 caracteres' }),

    address: z
        .string({ message: 'La dirección es requerida' })
        .min(5, { message: 'La dirección debe tener al menos 5 caracteres' })
        .max(200, { message: 'La dirección no puede superar los 200 caracteres' }),

    phone: z
        .string({ message: 'El teléfono es requerido' })
        .min(10, { message: 'El teléfono debe tener al menos 10 dígitos' })
        .refine((val) => /^(?:\+52|52)?\d{10}$/.test(val), {
            message: 'El teléfono debe ser un número válido de 10 dígitos, con o sin el prefijo +52',
        }),

    email: z
        .string({ message: 'El email es requerido' })
        .email({ message: 'El email no es válido' })
        .max(100, { message: 'El email no puede tener más de 100 caracteres' }),

    categoryId: z
        .string({ message: 'La categoría es requerida' })
        .uuid({ message: 'El identificador de la categoría no es válido' }),
})