import { z } from 'zod';

export const businessSchema = z.object({
    name: z.string({ message: 'El nombre es requerido' }).min(1),
    description: z.string({ message: 'La descripcion es requerida' }).min(1),
    address: z.string({ message: 'La direccion es requerida' }).min(1),
    phone: z.string({ message: 'El telefono es requerido' }).min(10, { message: "El telefono debe tener al menos 10 caracteres" }),
    email: z.string({ message: 'el email es requerido' }).email({ message: 'El email no es valido' }),
    categoryId: z.string({ message: 'La categoria es requerida' }).min(1),
})